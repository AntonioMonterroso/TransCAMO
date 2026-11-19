(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.MotorXlsx = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function colANum(l) {
    let n = 0;
    for (const ch of l) n = n * 26 + ch.charCodeAt(0) - 64;
    return n;
  }

  function numACol(n) {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = (n - m - 1) / 26;
    }
    return s;
  }

  function partirRef(ref) {
    const m = /^\$?([A-Z]{1,3})\$?(\d+)$/.exec(ref);
    if (!m) throw new Error('Referencia inválida: ' + ref);
    return { c: colANum(m[1]), r: +m[2] };
  }

  function ref(c, r) { return numACol(c) + r; }

  function decodificar(s) {
    return s.replace(/&(lt|gt|quot|apos|amp|#\d+|#x[0-9a-fA-F]+);/g, function (_, e) {
      if (e === 'lt') return '<';
      if (e === 'gt') return '>';
      if (e === 'quot') return '"';
      if (e === 'apos') return "'";
      if (e === 'amp') return '&';
      if (e[1] === 'x') return String.fromCodePoint(parseInt(e.slice(2), 16));
      return String.fromCodePoint(parseInt(e.slice(1), 10));
    });
  }

  function codificar(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function leerAtributos(txt) {
    const a = {};
    const re = /([\w:]+)="([^"]*)"/g;
    let m;
    while ((m = re.exec(txt))) a[m[1]] = m[2];
    return a;
  }

  function escribirAtributos(a) {
    return Object.keys(a).map(function (k) { return ' ' + k + '="' + a[k] + '"'; }).join('');
  }

  const RE_REF = /((?:'(?:[^']|'')+'|[A-Za-z_][A-Za-z0-9_.]*)!)?(\$?)([A-Z]{1,3})(\$?)(\d+)(?::(\$?)([A-Z]{1,3})(\$?)(\d+))?/g;

  function recorrerRefs(formula, fn) {
    let salida = '';
    let i = 0;
    while (i < formula.length) {
      const comilla = formula.indexOf('"', i);
      const tramo = comilla < 0 ? formula.slice(i) : formula.slice(i, comilla);
      salida += tramo.replace(RE_REF, function (todo, pref, a1, c1, a2, r1, a3, c2, a4, r2, pos, texto) {
        const antes = pos > 0 ? texto[pos - 1] : '';
        const despues = texto[pos + todo.length] || '';
        if (!pref && /[A-Za-z0-9_.]/.test(antes)) return todo;
        if (/[A-Za-z0-9_(!]/.test(despues)) return todo;
        let hoja = null;
        if (pref) {
          const p = pref.slice(0, -1);
          hoja = p[0] === "'" ? p.slice(1, -1).replace(/''/g, "'") : p;
        }
        const r = {
          hoja: hoja,
          pref: pref || '',
          c1: colANum(c1), r1: +r1, ac1: a1, ar1: a2,
          rango: !!c2,
          c2: c2 ? colANum(c2) : null, r2: r2 ? +r2 : null, ac2: a3 || '', ar2: a4 || ''
        };
        const n = fn(r);
        if (!n) return todo;
        let s = n.pref + n.ac1 + numACol(n.c1) + n.ar1 + n.r1;
        if (n.rango) s += ':' + n.ac2 + numACol(n.c2) + n.ar2 + n.r2;
        return s;
      });
      if (comilla < 0) break;
      let fin = comilla + 1;
      while (fin < formula.length) {
        if (formula[fin] === '"') {
          if (formula[fin + 1] === '"') { fin += 2; continue; }
          break;
        }
        fin++;
      }
      salida += formula.slice(comilla, fin + 1);
      i = fin + 1;
    }
    return salida;
  }

  function trasladarFormula(formula, dr, dc) {
    return recorrerRefs(formula, function (r) {
      const n = Object.assign({}, r);
      if (!r.ar1) n.r1 = r.r1 + dr;
      if (!r.ac1) n.c1 = r.c1 + dc;
      if (r.rango) {
        if (!r.ar2) n.r2 = r.r2 + dr;
        if (!r.ac2) n.c2 = r.c2 + dc;
      }
      return n;
    });
  }

  function leerHoja(nombre, ruta, xml, sst) {
    const ini = xml.search(/<sheetData\b/);
    let finTag = xml.indexOf('</sheetData>', ini);
    let cuerpo = '';
    let antes, despues;
    if (finTag < 0) {
      const auto = /<sheetData\s*\/>/.exec(xml);
      antes = xml.slice(0, auto.index);
      despues = xml.slice(auto.index + auto[0].length);
    } else {
      const abre = xml.indexOf('>', ini) + 1;
      antes = xml.slice(0, ini);
      cuerpo = xml.slice(abre, finTag);
      despues = xml.slice(finTag + '</sheetData>'.length);
    }
    const hoja = { nombre: nombre, ruta: ruta, antes: antes, despues: despues, filas: new Map(), celdas: new Map(), merges: [] };
    const compartidas = {};
    const pendientes = [];
    const reFila = /<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g;
    let mf;
    while ((mf = reFila.exec(cuerpo))) {
      const atr = leerAtributos(mf[1]);
      const r = +atr.r;
      delete atr.r;
      hoja.filas.set(r, atr);
      const interior = mf[2] || '';
      const reCelda = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
      let mc;
      while ((mc = reCelda.exec(interior))) {
        const a = leerAtributos(mc[1]);
        const pos = partirRef(a.r);
        const celda = { s: a.s, t: a.t, v: null, f: null };
        const dentro = mc[2] || '';
        const mfo = /<f\b([^>]*?)(?:\/>|>([\s\S]*?)<\/f>)/.exec(dentro);
        if (mfo) {
          const fa = leerAtributos(mfo[1]);
          const texto = mfo[2] != null ? decodificar(mfo[2]) : '';
          if (fa.t === 'shared') {
            if (texto) {
              compartidas[fa.si] = { f: texto, r: pos.r, c: pos.c };
              celda.f = texto;
            } else {
              pendientes.push({ celda: celda, si: fa.si, r: pos.r, c: pos.c });
            }
          } else {
            celda.f = texto;
          }
        }
        const mv = /<v>([\s\S]*?)<\/v>/.exec(dentro);
        if (mv) celda.v = decodificar(mv[1]);
        const mis = /<is>([\s\S]*?)<\/is>/.exec(dentro);
        if (celda.t === 's' && celda.v != null) {
          celda.si = sst[+celda.v];
          celda.v = null;
        } else if (celda.t === 'inlineStr' && mis) {
          celda.si = '<si>' + mis[1] + '</si>';
          celda.t = 's';
        }
        ponerCelda(hoja, pos.r, pos.c, celda);
      }
    }
    pendientes.forEach(function (p) {
      const m = compartidas[p.si];
      p.celda.f = trasladarFormula(m.f, p.r - m.r, p.c - m.c);
    });
    const mm = /<mergeCells\b[^>]*>([\s\S]*?)<\/mergeCells>/.exec(hoja.despues);
    if (mm) {
      const reM = /<mergeCell ref="([A-Z]+\d+):([A-Z]+\d+)"\s*\/>/g;
      let x;
      while ((x = reM.exec(mm[1]))) {
        const a = partirRef(x[1]);
        const b = partirRef(x[2]);
        hoja.merges.push({ c1: a.c, r1: a.r, c2: b.c, r2: b.r });
      }
      hoja.despues = hoja.despues.replace(mm[0], '<!--MERGES-->');
    }
    return hoja;
  }

  function ponerCelda(hoja, r, c, celda) {
    let fila = hoja.celdas.get(r);
    if (!fila) { fila = new Map(); hoja.celdas.set(r, fila); }
    fila.set(c, celda);
  }

  function textoDeSi(si) {
    if (!si) return '';
    const partes = [];
    const re = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let m;
    const sinFonetica = si.replace(/<rPh\b[\s\S]*?<\/rPh>/g, '');
    while ((m = re.exec(sinFonetica))) partes.push(decodificar(m[1]));
    return partes.join('');
  }

  function siDeTexto(t) {
    const esp = /^\s|\s$|\n/.test(t) ? ' xml:space="preserve"' : '';
    return '<si><t' + esp + '>' + codificar(t) + '</t></si>';
  }

  function serialFecha(d) {
    if (typeof d === 'string') {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
      return (Date.UTC(+m[1], +m[2] - 1, +m[3]) - Date.UTC(1899, 11, 30)) / 86400000;
    }
    return (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(1899, 11, 30)) / 86400000;
  }

  function fechaDeSerial(n) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(n) * 86400000);
    return d.toISOString().slice(0, 10);
  }

  function Libro(zip, archivos, hojas, rels) {
    this.zip = zip;
    this.archivos = archivos;
    this.hojas = hojas;
    this.rels = rels;
  }

  async function abrir(datos, JSZip) {
    const zip = await JSZip.loadAsync(datos);
    const archivos = {};
    const nombres = Object.keys(zip.files);
    for (const n of nombres) {
      if (zip.files[n].dir) continue;
      if (/\.(xml|rels)$/.test(n)) archivos[n] = await zip.file(n).async('string');
    }
    const sst = [];
    if (archivos['xl/sharedStrings.xml']) {
      const re = /<si>[\s\S]*?<\/si>/g;
      let m;
      while ((m = re.exec(archivos['xl/sharedStrings.xml']))) sst.push(m[0]);
    }
    const rels = {};
    const reRel = /<Relationship\b([^>]*)\/>/g;
    let mr;
    while ((mr = reRel.exec(archivos['xl/_rels/workbook.xml.rels']))) {
      const a = leerAtributos(mr[1]);
      rels[a.Id] = a.Target.replace(/^\/?xl\//, '');
    }
    const hojas = [];
    const reHoja = /<sheet\b([^>]*)\/>/g;
    let mh;
    while ((mh = reHoja.exec(archivos['xl/workbook.xml']))) {
      const a = leerAtributos(mh[1]);
      const nombre = decodificar(a.name);
      const ruta = 'xl/' + rels[a['r:id']];
      hojas.push(leerHoja(nombre, ruta, archivos[ruta], sst));
    }
    return new Libro(zip, archivos, hojas, rels);
  }

  Libro.prototype.hoja = function (nombre) {
    const limpio = String(nombre).trim();
    const h = this.hojas.find(function (x) { return x.nombre.trim() === limpio; });
    if (!h) throw new Error('No existe la hoja ' + nombre);
    return h;
  };

  Libro.prototype.celda = function (nombreHoja, direccion) {
    const h = this.hoja(nombreHoja);
    const p = partirRef(direccion);
    const fila = h.celdas.get(p.r);
    return fila ? fila.get(p.c) || null : null;
  };

  Libro.prototype.valor = function (nombreHoja, direccion) {
    const c = this.celda(nombreHoja, direccion);
    if (!c) return null;
    if (c.si != null) return textoDeSi(c.si);
    if (c.v == null) return null;
    if (c.t === 'str' || c.t === 'e') return c.v;
    if (c.t === 'b') return c.v === '1';
    return Number(c.v);
  };

  Libro.prototype.formula = function (nombreHoja, direccion) {
    const c = this.celda(nombreHoja, direccion);
    return c && c.f != null ? c.f : null;
  };

  Libro.prototype.estilo = function (nombreHoja, direccion) {
    const c = this.celda(nombreHoja, direccion);
    return c ? c.s : undefined;
  };

  Libro.prototype.poner = function (nombreHoja, direccion, valor, opciones) {
    const h = this.hoja(nombreHoja);
    const p = partirRef(direccion);
    const fila = h.celdas.get(p.r);
    const vieja = fila ? fila.get(p.c) : null;
    const o = opciones || {};
    const celda = { s: o.estilo !== undefined ? o.estilo : (vieja ? vieja.s : undefined), t: undefined, v: null, f: null };
    if (o.formula != null) {
      celda.f = String(o.formula).replace(/^=/, '');
    } else if (valor == null || valor === '') {
      if (celda.s === undefined) { if (fila) fila.delete(p.c); return; }
    } else if (typeof valor === 'number') {
      celda.v = String(valor);
    } else if (typeof valor === 'boolean') {
      celda.t = 'b';
      celda.v = valor ? '1' : '0';
    } else if (valor instanceof Date || (o.fecha && typeof valor === 'string')) {
      celda.v = String(serialFecha(valor));
    } else {
      celda.t = 's';
      celda.si = siDeTexto(String(valor));
    }
    if (!h.filas.has(p.r)) h.filas.set(p.r, {});
    ponerCelda(h, p.r, p.c, celda);
  };

  Libro.prototype.vaciar = function (nombreHoja, rango) {
    const h = this.hoja(nombreHoja);
    const partes = rango.split(':');
    const a = partirRef(partes[0]);
    const b = partirRef(partes[1] || partes[0]);
    for (let r = a.r; r <= b.r; r++) {
      const fila = h.celdas.get(r);
      if (!fila) continue;
      for (let c = a.c; c <= b.c; c++) {
        const x = fila.get(c);
        if (!x) continue;
        if (x.s === undefined) fila.delete(c);
        else fila.set(c, { s: x.s, t: undefined, v: null, f: null });
      }
    }
  };

  function moverRefsPorInsercion(formula, hojaFormula, hojaObjetivo, desde, n) {
    return recorrerRefs(formula, function (r) {
      const destino = r.hoja != null ? r.hoja : hojaFormula;
      if (destino.trim() !== hojaObjetivo.trim()) return null;
      const x = Object.assign({}, r);
      if (r.r1 >= desde) x.r1 = r.r1 + n;
      if (r.rango && r.r2 >= desde) x.r2 = r.r2 + n;
      return x;
    });
  }

  Libro.prototype.insertarFilas = function (nombreHoja, desde, n, filaModelo) {
    if (n <= 0) return;
    const h = this.hoja(nombreHoja);
    const libro = this;
    const nuevasCeldas = new Map();
    h.celdas.forEach(function (fila, r) { nuevasCeldas.set(r >= desde ? r + n : r, fila); });
    h.celdas = nuevasCeldas;
    const nuevasFilas = new Map();
    h.filas.forEach(function (atr, r) { nuevasFilas.set(r >= desde ? r + n : r, atr); });
    h.filas = nuevasFilas;
    const modelo = filaModelo != null ? filaModelo : desde - 1;
    const atrModelo = h.filas.get(modelo) || {};
    const celdasModelo = h.celdas.get(modelo) || new Map();
    for (let i = 0; i < n; i++) {
      const r = desde + i;
      h.filas.set(r, Object.assign({}, atrModelo));
      const fila = new Map();
      celdasModelo.forEach(function (c, col) {
        if (c.s !== undefined) fila.set(col, { s: c.s, t: undefined, v: null, f: null });
      });
      h.celdas.set(r, fila);
    }
    h.merges.forEach(function (m) {
      if (m.r1 >= desde) { m.r1 += n; m.r2 += n; }
      else if (m.r2 >= desde) m.r2 += n;
    });
    libro.hojas.forEach(function (otra) {
      otra.celdas.forEach(function (fila) {
        fila.forEach(function (c) {
          if (c.f) c.f = moverRefsPorInsercion(c.f, otra.nombre, h.nombre, desde, n);
        });
      });
    });
    const desplazarTexto = function (texto, hojaBase) {
      return moverRefsPorInsercion(texto, hojaBase, h.nombre, desde, n);
    };
    h.antes = h.antes.replace(/(<dimension ref=")([^"]+)(")/, function (_, a, rr, b) { return a + desplazarTexto(rr, h.nombre) + b; });
    h.despues = h.despues.replace(/(<autoFilter ref=")([^"]+)(")/, function (_, a, rr, b) { return a + desplazarTexto(rr, h.nombre) + b; });
    h.despues = h.despues.replace(/<brk id="(\d+)"/g, function (t, id) { return +id >= desde ? '<brk id="' + (+id + n) + '"' : t; });
    const wb = this.archivos['xl/workbook.xml'];
    this.archivos['xl/workbook.xml'] = wb.replace(/(<definedName\b[^>]*>)([\s\S]*?)(<\/definedName>)/g, function (_, a, cuerpo, b) {
      return a + codificar(desplazarTexto(decodificar(cuerpo), h.nombre)) + b;
    });
  };

  function Evaluador(libro) {
    this.libro = libro;
    this.cache = new Map();
    this.enCurso = new Set();
  }

  const ERR = function (e) { return { error: e }; };

  Evaluador.prototype.valorCelda = function (hoja, r, c) {
    const clave = hoja.nombre + '!' + r + ',' + c;
    if (this.cache.has(clave)) return this.cache.get(clave);
    const fila = hoja.celdas.get(r);
    const celda = fila ? fila.get(c) : null;
    let v = null;
    if (celda) {
      if (celda.f != null) {
        if (this.enCurso.has(clave)) return ERR('#REF!');
        this.enCurso.add(clave);
        v = this.evaluar(celda.f, hoja);
        this.enCurso.delete(clave);
        if (Array.isArray(v)) v = v[0] != null ? v[0] : 0;
      } else if (celda.si != null) {
        v = textoDeSi(celda.si);
      } else if (celda.v != null) {
        if (celda.t === 'str') v = celda.v;
        else if (celda.t === 'e') v = ERR(celda.v);
        else if (celda.t === 'b') v = celda.v === '1';
        else v = Number(celda.v);
      }
    }
    this.cache.set(clave, v);
    return v;
  };

  Evaluador.prototype.tokens = function (f) {
    const t = [];
    let i = 0;
    while (i < f.length) {
      const ch = f[i];
      if (ch === ' ') { i++; continue; }
      if (ch === '"') {
        let j = i + 1, s = '';
        while (j < f.length) {
          if (f[j] === '"') { if (f[j + 1] === '"') { s += '"'; j += 2; continue; } break; }
          s += f[j++];
        }
        t.push({ k: 'str', v: s });
        i = j + 1;
        continue;
      }
      if (ch === '#') {
        const m = /^#(DIV\/0!|REF!|VALUE!|NAME\?|N\/A|NUM!|NULL!)/.exec(f.slice(i));
        t.push({ k: 'err', v: m[0] });
        i += m[0].length;
        continue;
      }
      const mr = /^((?:'(?:[^']|'')+'|[A-Za-z_][A-Za-z0-9_.]*)!)?\$?([A-Z]{1,3})\$?(\d+)(?::\$?([A-Z]{1,3})\$?(\d+))?(?![A-Za-z0-9_(])/.exec(f.slice(i));
      if (mr && !/[A-Za-z0-9_.]/.test(f[i - 1] || '')) {
        let hoja = null;
        if (mr[1]) {
          const p = mr[1].slice(0, -1);
          hoja = p[0] === "'" ? p.slice(1, -1).replace(/''/g, "'") : p;
        }
        t.push({ k: 'ref', hoja: hoja, c1: colANum(mr[2]), r1: +mr[3], c2: mr[4] ? colANum(mr[4]) : null, r2: mr[5] ? +mr[5] : null });
        i += mr[0].length;
        continue;
      }
      const mn = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(f.slice(i)) || /^\.\d+/.exec(f.slice(i));
      if (mn) { t.push({ k: 'num', v: Number(mn[0]) }); i += mn[0].length; continue; }
      const mfn = /^([A-Za-z_][A-Za-z0-9_.]*)\(/.exec(f.slice(i));
      if (mfn) { t.push({ k: 'fn', v: mfn[1].toUpperCase().replace(/^_XLFN\./, '') }); i += mfn[0].length; continue; }
      const mop = /^(<>|<=|>=|[-+*/^&=<>%(),:])/.exec(f.slice(i));
      if (mop) { t.push({ k: 'op', v: mop[0] }); i += mop[0].length; continue; }
      const mb = /^(TRUE|FALSE)\b/i.exec(f.slice(i));
      if (mb) { t.push({ k: 'bool', v: mb[0].toUpperCase() === 'TRUE' }); i += mb[0].length; continue; }
      throw new Error('No entiendo la fórmula: ' + f);
    }
    return t;
  };

  Evaluador.prototype.evaluar = function (formula, hoja) {
    const ev = this;
    let toks;
    try { toks = this.tokens(formula); } catch (e) { return ERR('#NAME?'); }
    let p = 0;
    const ver = function () { return toks[p]; };
    const esOp = function (v) { const x = toks[p]; return x && x.k === 'op' && x.v === v; };
    const num = function (x) {
      if (x && x.error) return x;
      if (Array.isArray(x)) x = x[0];
      if (x == null || x === '') return 0;
      if (typeof x === 'boolean') return x ? 1 : 0;
      if (typeof x === 'number') return x;
      const n = Number(String(x).replace(/,/g, ''));
      return isNaN(n) ? ERR('#VALUE!') : n;
    };
    const txt = function (x) {
      if (Array.isArray(x)) x = x[0];
      if (x == null) return '';
      if (typeof x === 'boolean') return x ? 'TRUE' : 'FALSE';
      return String(x);
    };
    const binario = function (a, b, fn) {
      const x = num(a), y = num(b);
      if (x && x.error) return x;
      if (y && y.error) return y;
      return fn(x, y);
    };
    function primario() {
      const t = toks[p++];
      if (!t) return ERR('#VALUE!');
      if (t.k === 'num') return t.v;
      if (t.k === 'str') return t.v;
      if (t.k === 'bool') return t.v;
      if (t.k === 'err') return ERR(t.v);
      if (t.k === 'ref') {
        const h = t.hoja != null ? ev.libro.hoja(t.hoja) : hoja;
        if (t.c2 == null) return ev.valorCelda(h, t.r1, t.c1);
        const lista = [];
        for (let r = Math.min(t.r1, t.r2); r <= Math.max(t.r1, t.r2); r++) {
          for (let c = Math.min(t.c1, t.c2); c <= Math.max(t.c1, t.c2); c++) lista.push(ev.valorCelda(h, r, c));
        }
        return lista;
      }
      if (t.k === 'fn') {
        const args = [];
        if (!esOp(')')) {
          args.push(expresion());
          while (esOp(',')) { p++; args.push(expresion()); }
        }
        p++;
        return llamar(t.v, args);
      }
      if (t.k === 'op' && t.v === '(') {
        const v = expresion();
        p++;
        return v;
      }
      if (t.k === 'op' && t.v === '-') { const v = num(potencia()); return v && v.error ? v : -v; }
      if (t.k === 'op' && t.v === '+') return potencia();
      return ERR('#VALUE!');
    }
    function porcentaje() {
      let v = primario();
      while (esOp('%')) { p++; const x = num(v); v = x && x.error ? x : x / 100; }
      return v;
    }
    function potencia() {
      let v = porcentaje();
      while (esOp('^')) { p++; const b = porcentaje(); v = binario(v, b, Math.pow); }
      return v;
    }
    function producto() {
      let v = potencia();
      while (esOp('*') || esOp('/')) {
        const op = toks[p++].v;
        const b = potencia();
        v = binario(v, b, function (x, y) {
          if (op === '*') return x * y;
          if (y === 0) return ERR('#DIV/0!');
          return x / y;
        });
      }
      return v;
    }
    function suma() {
      let v = producto();
      while (esOp('+') || esOp('-')) {
        const op = toks[p++].v;
        const b = producto();
        v = binario(v, b, function (x, y) { return op === '+' ? x + y : x - y; });
      }
      return v;
    }
    function concatenar() {
      let v = suma();
      while (esOp('&')) {
        p++;
        const b = suma();
        if (v && v.error) continue;
        if (b && b.error) { v = b; continue; }
        v = txt(v) + txt(b);
      }
      return v;
    }
    function expresion() {
      let v = concatenar();
      while (ver() && ver().k === 'op' && ['=', '<>', '<', '>', '<=', '>='].indexOf(ver().v) >= 0) {
        const op = toks[p++].v;
        const b = concatenar();
        const x = typeof v === 'string' || typeof b === 'string' ? [txt(v), txt(b)] : [num(v), num(b)];
        v = op === '=' ? x[0] === x[1] : op === '<>' ? x[0] !== x[1] : op === '<' ? x[0] < x[1] : op === '>' ? x[0] > x[1] : op === '<=' ? x[0] <= x[1] : x[0] >= x[1];
      }
      return v;
    }
    function aplanar(args) {
      const out = [];
      args.forEach(function (a) { if (Array.isArray(a)) a.forEach(function (x) { out.push({ v: x, rango: true }); }); else out.push({ v: a, rango: false }); });
      return out;
    }
    function llamar(nombre, args) {
      if (nombre === 'SUM') {
        let s = 0;
        for (const x of aplanar(args)) {
          if (x.v && x.v.error) return x.v;
          if (x.rango) { if (typeof x.v === 'number') s += x.v; }
          else { const n = num(x.v); if (n && n.error) return n; s += n; }
        }
        return s;
      }
      if (nombre === 'CONCAT' || nombre === 'CONCATENATE') {
        let s = '';
        for (const x of aplanar(args)) { if (x.v && x.v.error) return x.v; s += txt(x.v); }
        return s;
      }
      if (nombre === 'ROUND') {
        const a = num(args[0]), d = num(args[1]);
        if (a && a.error) return a;
        const f = Math.pow(10, d);
        return Math.round(a * f + (a >= 0 ? 1e-9 : -1e-9)) / f;
      }
      if (nombre === 'IF') return (num(args[0]) ? args[1] : (args.length > 2 ? args[2] : false));
      if (nombre === 'IFERROR') return args[0] && args[0].error ? args[1] : args[0];
      if (nombre === 'ABS') { const a = num(args[0]); return a && a.error ? a : Math.abs(a); }
      return ERR('#NAME?');
    }
    const r = expresion();
    return r;
  };

  Libro.prototype.calcular = function () {
    const ev = new Evaluador(this);
    this.hojas.forEach(function (h) {
      h.celdas.forEach(function (fila, r) {
        fila.forEach(function (c, col) {
          if (c.f == null) return;
          const v = ev.valorCelda(h, r, col);
          if (v && v.error) { c.t = 'e'; c.v = v.error; }
          else if (typeof v === 'string') { c.t = 'str'; c.v = v; }
          else if (typeof v === 'boolean') { c.t = 'b'; c.v = v ? '1' : '0'; }
          else { c.t = undefined; c.v = v == null ? '0' : String(redondearIEEE(v)); }
        });
      });
    });
    return ev;
  };

  function redondearIEEE(v) {
    return Number.isFinite(v) ? +v.toPrecision(15) : v;
  }

  function escribirHoja(h, sst) {
    const filas = Array.from(h.filas.keys());
    h.celdas.forEach(function (_, r) { if (filas.indexOf(r) < 0) filas.push(r); });
    filas.sort(function (a, b) { return a - b; });
    let minR = Infinity, maxR = 0, minC = Infinity, maxC = 0;
    const partes = [];
    filas.forEach(function (r) {
      const atr = Object.assign({ r: String(r) }, h.filas.get(r) || {});
      const fila = h.celdas.get(r);
      const cols = fila ? Array.from(fila.keys()).sort(function (a, b) { return a - b; }) : [];
      let s = '<row' + escribirAtributos(atr);
      if (!cols.length) { partes.push(s + '/>'); return; }
      s += '>';
      cols.forEach(function (c) {
        const x = fila.get(c);
        minR = Math.min(minR, r); maxR = Math.max(maxR, r); minC = Math.min(minC, c); maxC = Math.max(maxC, c);
        let a = ' r="' + ref(c, r) + '"';
        if (x.s !== undefined) a += ' s="' + x.s + '"';
        let interior = '';
        if (x.si != null && x.f == null) {
          let idx = sst.mapa.get(x.si);
          if (idx == null) { idx = sst.lista.length; sst.lista.push(x.si); sst.mapa.set(x.si, idx); }
          sst.usos++;
          a += ' t="s"';
          interior = '<v>' + idx + '</v>';
        } else {
          if (x.t && x.t !== 's') a += ' t="' + x.t + '"';
          if (x.f != null) interior += '<f>' + codificar(x.f) + '</f>';
          if (x.v != null) interior += '<v>' + codificar(x.v) + '</v>';
        }
        s += interior ? '<c' + a + '>' + interior + '</c>' : '<c' + a + '/>';
      });
      partes.push(s + '</row>');
    });
    let antes = h.antes;
    if (maxR > 0) antes = antes.replace(/<dimension ref="[^"]*"\/>/, '<dimension ref="' + ref(minC, minR) + ':' + ref(maxC, maxR) + '"/>');
    let despues = h.despues;
    const merges = h.merges.length
      ? '<mergeCells count="' + h.merges.length + '">' + h.merges.map(function (m) { return '<mergeCell ref="' + ref(m.c1, m.r1) + ':' + ref(m.c2, m.r2) + '"/>'; }).join('') + '</mergeCells>'
      : '';
    despues = despues.replace('<!--MERGES-->', merges);
    return antes + '<sheetData>' + partes.join('') + '</sheetData>' + despues;
  }

  Libro.prototype.guardar = async function (tipo) {
    const sst = { lista: [], mapa: new Map(), usos: 0 };
    const zip = this.zip;
    for (const h of this.hojas) zip.file(h.ruta, escribirHoja(h, sst));
    zip.file('xl/sharedStrings.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' + sst.usos + '" uniqueCount="' + sst.lista.length + '">' + sst.lista.join('') + '</sst>');
    let wb = this.archivos['xl/workbook.xml'];
    wb = wb.replace(/<calcPr\b[^>]*\/>/, function (t) { return /fullCalcOnLoad/.test(t) ? t : t.replace('/>', ' fullCalcOnLoad="1"/>'); });
    zip.file('xl/workbook.xml', wb);
    if (zip.file('xl/calcChain.xml')) {
      zip.remove('xl/calcChain.xml');
      zip.file('[Content_Types].xml', this.archivos['[Content_Types].xml'].replace(/<Override PartName="\/xl\/calcChain.xml"[^>]*\/>/, ''));
      zip.file('xl/_rels/workbook.xml.rels', this.archivos['xl/_rels/workbook.xml.rels'].replace(/<Relationship\b[^>]*Target="calcChain.xml"[^>]*\/>/, ''));
    }
    return zip.generateAsync({ type: tipo || 'uint8array', compression: 'DEFLATE', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  return {
    abrir: abrir,
    colANum: colANum,
    numACol: numACol,
    partirRef: partirRef,
    ref: ref,
    serialFecha: serialFecha,
    fechaDeSerial: fechaDeSerial,
    recorrerRefs: recorrerRefs,
    textoDeSi: textoDeSi
  };
});
