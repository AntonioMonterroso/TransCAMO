(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica(require('./motor-xlsx.js'));
  else raiz.ExcelPipas = fabrica(raiz.MotorXlsx);
})(typeof self !== 'undefined' ? self : this, function (Motor) {
  'use strict';

  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MES_PLANTILLA = { anio: 2026, mes: 9 };

  const VIAJES_RASTRA = [
    { clave: 'fert250', col: 'E', nombre: 'Fertilizante 2.50' },
    { clave: 'fertpq', col: 'F', nombre: 'Fertilizante Puerto Quetzal a Acapán 4000' },
    { clave: 'block', col: 'G', nombre: 'Block 4000' },
    { clave: 'cemento', col: 'H', nombre: 'Cemento 4500' },
    { clave: 'cementopq', col: 'I', nombre: 'Cemento Puerto Quetzal a Ayutía 4000' },
    { clave: 'camo', col: 'J', nombre: 'camo' }
  ];

  const UNIDADES = {
    TS01: {
      hoja: 'TS01', tipo: 'pipa', ini: 3, fin: 27, limpiar: ['A', 'P'],
      manos: [{ celda: 'B30', clases: ['reparacion'] }, { celda: 'B33', clases: ['sueldo'] }],
      viajes: 'B29', clientes: { F: 'F28', G: 'G28', H: 'H28' }, finClientes: 27,
      gastos: { bloque: 'AA' }, vales: { titulo: 4, ini: 7, fin: 13 }
    },
    TS02: {
      hoja: 'TS02', tipo: 'pipa', ini: 3, fin: 24, limpiar: ['A', 'P'],
      manos: [{ celda: 'B30', clases: ['reparacion'] }, { celda: 'B33', clases: ['sueldo'], extra: ['L26'] }, { celda: 'I33', clases: ['sueldo'] }],
      viajes: 'B29', clientes: { F: 'F25', G: 'G25', H: 'H25' }, finClientes: 24,
      gastos: { bloque: 'A' }, vales: { titulo: 15, ini: 18, fin: 43 }
    },
    TS03: {
      hoja: 'TS03', tipo: 'pipa', ini: 3, fin: 28, limpiar: ['A', 'P'],
      manos: [{ celda: 'B35', clases: ['reparacion'] }, { celda: 'B38', clases: ['sueldo'], extra: ['L30'], extraPrimero: true }, { celda: 'E38', clases: ['sueldo'] }],
      viajes: 'B34', clientes: { F: 'F29', G: 'G29', H: 'H29' }, finClientes: 28,
      gastos: { bloque: 'N' }, vales: { titulo: 45, ini: 48, fin: 80 }
    },
    TS04: {
      hoja: 'TS04', tipo: 'tag', ini: 3, fin: 16, limpiar: ['A', 'J'],
      manos: [
        { celda: 'B23', clases: ['reparacion', 'viatico'] },
        { celda: 'F24', clases: ['reparacion'] },
        { celda: 'F25', clases: ['viatico'] },
        { celda: 'B26', clases: ['sueldo'] },
        { celda: 'F26', clases: ['sueldo'] }
      ],
      viajes: 'B22', gastos: { bloque: 'AN' }, vales: { titulo: 83, ini: 86, fin: 100 }
    },
    Rastra: {
      hoja: 'Rastra', tipo: 'rastra', ini: 3, fin: 31, limpiar: ['A', 'R'],
      manos: [{ celda: 'B34', clases: ['reparacion'] }, { celda: 'B37', clases: ['sueldo'] }],
      viajes: 'B33', gastos: { bloque: 'AX' }, vales: { titulo: 104, ini: 107, fin: 149 }, notas: ['S', 'T']
    },
    TACOMA: {
      hoja: 'TACOMA', tipo: 'tacoma', ini: 4, fin: 15, limpiar: ['A', 'D'],
      manos: [], vales: { titulo: 153, ini: 155, fin: 166, soloCombustible: true }
    }
  };

  const COLUMNAS = {
    pipa: {
      comb: { fecha: 'A', galones: 'B', vale: 'C', monto: 'D', gal_trans: 'E', destino: 'I' },
      cargo: { puma: 'F', santander: 'G', camo: 'H' },
      viat: { fecha: 'J', vale: 'K', monto: 'L' },
      gasto: { fecha: 'M', vale: 'N', monto: 'O', detalle: 'P' }
    },
    tag: {
      comb: { fecha: 'A', galones: 'B', vale: 'C', monto: 'D', gal_trans: 'E', destino: 'F' },
      gasto: { fecha: 'G', vale: 'H', monto: 'I', detalle: 'J' }
    },
    rastra: {
      comb: { fecha: 'A', galones: 'B', vale: 'C', monto: 'D', destino: 'K' },
      viat: { fecha: 'L', vale: 'M', monto: 'N' },
      gasto: { fecha: 'O', vale: 'P', monto: 'Q', detalle: 'R' }
    },
    tacoma: {
      comb: { fecha: 'A', vale: 'B', galones: 'C', monto: 'D' }
    }
  };

  const GASTOS_BLOQUES = {
    A: { comb: ['A', 'B', 'C', 'D', 'E', 'F'], viat: ['G', 'H', 'I'], gasto: ['J', 'K', 'L', 'M'] },
    N: { comb: ['N', 'O', 'P', 'Q', 'R', 'S'], viat: ['T', 'U', 'V'], gasto: ['W', 'X', 'Y', 'Z'] },
    AA: { comb: ['AA', 'AB', 'AC', 'AD', 'AE', 'AF'], viat: ['AG', 'AH', 'AI'], gasto: ['AJ', 'AK', 'AL', 'AM'] },
    AN: { comb: ['AN', 'AO', 'AP', 'AQ', 'AR', 'AS'], gasto: ['AT', 'AU', 'AV', 'AW'] },
    AX: { comb: ['AX', 'AY', 'AZ', 'BA', 'BB', 'BC', 'BD', 'BE'], viat: ['BF', 'BG', 'BH'], gasto: ['BI', 'BJ', 'BK', 'BL'] }
  };

  const RANGO_GASTOS = { ini: 3, fin: 25, finRastra: 29, limpiar: ['A', 'BL'] };
  const RANGO_HOJA1 = { ini: 9, fin: 75, total: 'F76', limpiar: ['A', 'G'] };

  const EXCLUIR_DATOS = /^(FINAL!(B4|B5|B7|B8|A31)|Hoja1!.*|TS04!(A35|A36|B35|C35|B36|C36|B22|B26|F26)|Rastra!(S|T)\d+|TS01!(B29|B33)|TS02!B29|TS03!B34|Rastra!B33)$/;
  const ETIQUETAS = {"FINAL!D4": "Precio por galón · %", "FINAL!M4": "Porcentaje de retención (M4)", "FINAL!D5": "Precio por quintal · %", "FINAL!D6": "Precio por viaje · fertilizante Puerto Quetzal (fila 6)", "FINAL!D7": "Precio por viaje, cemento Puerto Quetzal · %", "FINAL!D8": "Precio por viaje, cemento · %", "FINAL!G8": "Retención de IVA (G8) · %", "FINAL!N8": "Retención fija sobre 30,000 (N8)", "FINAL!F14": "Saldo bancario del mes anterior", "FINAL!I14": "Monto aparte (I14)", "FINAL!N17": "Retención fija sobre 30,000 (N17)", "FINAL!F20": "Salario de auditoría", "FINAL!F22": "IGSS del mes", "FINAL!F23": "ISR opcional del mes", "FINAL!F24": "Proyección IVA", "FINAL!F25": "Saldo (F25)", "FINAL!K33": "ISR mensual", "FINAL!F33": "Ganancia · %", "FINAL!F34": "Ganancia · %", "FINAL!F35": "Ganancia · %", "FINAL!F36": "Ganancia · %", "FINAL!F37": "Ganancia · %", "GASTOS!F33": "Viajes · TS-02", "GASTOS!S33": "Viajes · TS-03", "GASTOS!AF33": "Viajes · TS-01", "GASTOS!AS33": "Viajes · TS-04", "GASTOS!AT33": "Galones · TS-04", "GASTOS!BE33": "Viajes · Rastra", "GASTOS!BI33": "Galones · Rastra", "GASTOS!N37": "Según encargado · Santander (galones)", "GASTOS!P37": "Pasa al mes siguiente · Santander", "GASTOS!N38": "Según encargado · %", "GASTOS!P38": "Pasa al mes siguiente · %", "GASTOS!N39": "Según encargado · fertilizante Puerto Quetzal", "GASTOS!P39": "Pasa al mes siguiente · fertilizante Puerto Quetzal", "GASTOS!N40": "Según encargado, cemento Puerto Quetzal · %", "GASTOS!N41": "Según encargado · cemento", "GASTOS!R46": "Dato R46", "GASTOS!Q47": "Costo por galón (Q47)", "GASTOS!R47": "Dato R47", "TS01!G29": "Reportado · Santander", "TS01!H29": "Reportado · Camo", "TS01!Q29": "Siguiente mes (Q29)", "TS01!M31": "Precio por galón para rentabilidad", "TS01!E38": "Total galones (E38)", "TS01!H38": "Dato H38", "TS01!H44": "Según factura · Corporación", "TS01!H45": "Según factura · Grupo Camo", "TS01!H46": "Según factura · Puma", "TS02!F27": "Reportado · Puma", "TS02!G27": "Reportado · Santander", "TS02!H27": "Reportado · Camo", "TS02!M31": "Precio por galón para rentabilidad", "TS02!B36": "%", "TS02!G45": "Según factura · Corporación", "TS02!G46": "Según factura · Grupo Camo", "TS02!G47": "Según factura · Puma", "TS03!G31": "Reportado · Santander", "TS03!H31": "Reportado · Camo", "TS03!F35": "Dato F35", "TS03!L36": "Precio por galón para rentabilidad", "TS03!G40": "Dato G40", "TS03!G53": "Según factura · Corporación", "TS03!G54": "Según factura · Grupo Camo", "TS03!G55": "Según factura · Puma", "TS04!K19": "Dato K19", "TS04!I20": "Dato I20", "TS04!J24": "Precio por galón para rentabilidad", "TS04!F28": "%", "TS04!F29": "%", "Rastra!I33": "Reportado · cemento Puerto Quetzal", "Rastra!J33": "Reportado · Camo", "Rastra!O35": "Precio por galón para rentabilidad", "Rastra!E42": "Total galones (E42)", "Rastra!J42": "Dato J42", "Rastra!J48": "Según factura · Corporación", "Rastra!J49": "Según factura · Grupo Camo", "Rastra!J50": "Según factura · Puma", "Vales!S15": "Total esperado TS-01 (S15)", "Vales!E168": "Tacoma: monto aparte (E168)", "Vales!G178": "Dato G178", "Vales!F179": "Factura Santander", "Vales!F192": "Factura Santander (F192)"};
  const TEXTO_DATOS = ['FINAL!D4', 'FINAL!D5', 'FINAL!D6', 'FINAL!D7', 'FINAL!D8'];

  function num(x) {
    if (x == null || x === '') return null;
    if (typeof x === 'number') return x;
    const n = Number(String(x).replace(/[Q,\s]/g, ''));
    return isNaN(n) ? null : n;
  }

  function valorVale(v) {
    if (v == null || v === '') return null;
    const s = String(v).trim();
    return /^\d+$/.test(s) ? Number(s) : s;
  }

  function claseGasto(r) {
    if (r.tipo === 'viatico') return 'viatico';
    return r.clase === 'sueldo' ? 'sueldo' : 'reparacion';
  }

  function ordenar(lista) {
    return lista.slice().sort(function (a, b) {
      if (!!b.mes_anterior !== !!a.mes_anterior) return a.mes_anterior ? -1 : 1;
      return (a.orden || 0) - (b.orden || 0);
    });
  }

  function agrupar(renglones) {
    const g = {};
    Object.keys(UNIDADES).forEach(function (u) { g[u] = { comb: [], viat: [], gasto: [] }; });
    renglones.forEach(function (r) {
      const u = g[r.unidad];
      if (!u) return;
      const cfg = UNIDADES[r.unidad];
      if (r.tipo === 'combustible') u.comb.push(r);
      else if (r.tipo === 'viatico' && cfg.tipo !== 'tag' && cfg.tipo !== 'tacoma') u.viat.push(r);
      else if (cfg.tipo !== 'tacoma') u.gasto.push(r);
    });
    Object.keys(g).forEach(function (k) {
      g[k].comb = ordenar(g[k].comb);
      g[k].viat = ordenar(g[k].viat);
      g[k].gasto = ordenar(g[k].gasto);
    });
    return g;
  }

  function Seguidor() { this.inserciones = []; }
  Seguidor.prototype.anotar = function (hoja, desde, n) { this.inserciones.push({ hoja: hoja, desde: desde, n: n }); };
  Seguidor.prototype.fila = function (hoja, r) {
    let x = r;
    this.inserciones.forEach(function (i) { if (i.hoja === hoja && x >= i.desde) x += i.n; });
    return x;
  };
  Seguidor.prototype.celda = function (hoja, direccion) {
    const p = Motor.partirRef(direccion);
    return Motor.numACol(p.c) + this.fila(hoja, p.r);
  };

  function estilosColumna(libro, hoja, ini, fin, desdeCol, hastaCol) {
    const h = libro.hoja(hoja);
    const out = {};
    for (let c = Motor.colANum(desdeCol); c <= Motor.colANum(hastaCol); c++) {
      let estilo;
      for (let r = ini; r <= fin; r++) {
        const fila = h.celdas.get(r);
        const x = fila && fila.get(c);
        if (x && (x.v != null || x.si != null || x.f != null) && x.s !== undefined) { estilo = x.s; break; }
      }
      if (estilo === undefined) {
        const fila = h.celdas.get(ini);
        const x = fila && fila.get(c);
        if (x) estilo = x.s;
      }
      out[Motor.numACol(c)] = estilo;
    }
    return out;
  }

  function vaciarZona(libro, hoja, ini, fin, desdeCol, hastaCol, conFormulas) {
    const h = libro.hoja(hoja);
    for (let r = ini; r <= fin; r++) {
      const fila = h.celdas.get(r);
      if (!fila) continue;
      for (let c = Motor.colANum(desdeCol); c <= Motor.colANum(hastaCol); c++) {
        const x = fila.get(c);
        if (!x) continue;
        if (x.f != null && !conFormulas) continue;
        const tenia = x.v != null || x.si != null || x.f != null;
        if (x.s === undefined) fila.delete(c);
        else fila.set(c, { s: x.s, t: undefined, v: null, f: null, _tenia: tenia });
      }
    }
  }

  function estiloPara(libro, hoja, dir, estiloCol) {
    const c = libro.celda(hoja, dir);
    if (c && c._tenia && c.s !== undefined) return c.s;
    if (estiloCol !== undefined) return estiloCol;
    return c ? c.s : undefined;
  }

  function crecer(libro, seg, hoja, ini, fin, necesarias, modelo) {
    const capacidad = fin - ini + 1;
    if (necesarias <= capacidad) return fin;
    const n = necesarias - capacidad;
    const desde = seg.fila(hoja, ini + 2);
    libro.insertarFilas(hoja, desde, n, seg.fila(hoja, modelo != null ? modelo : ini + 1));
    seg.anotar(hoja, desde, n);
    return fin + n;
  }

  function ponerTipado(libro, hoja, dir, valor, estiloCol, esFecha) {
    const actual = libro.celda(hoja, dir);
    const estilo = (valor == null || valor === '') && actual ? actual.s : estiloPara(libro, hoja, dir, estiloCol);
    if (valor == null || valor === '') {
      libro.poner(hoja, dir, null, { estilo: estilo });
      return;
    }
    libro.poner(hoja, dir, valor, { estilo: estilo, fecha: esFecha });
  }

  function cambiarMeses(texto, delta, anio) {
    return texto.replace(/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b(\s+(?:de\s+)?)?(20\d\d)?/gi, function (todo, mes, sep, an) {
      let i = MESES.indexOf(mes.toLowerCase().replace('setiembre', 'septiembre'));
      let a = an ? +an : null;
      let total = i + delta;
      let ajusteAnio = Math.floor(total / 12);
      total = ((total % 12) + 12) % 12;
      let nombre = MESES[total];
      if (mes === mes.toUpperCase()) nombre = nombre.toUpperCase();
      else if (mes[0] === mes[0].toUpperCase()) nombre = nombre[0].toUpperCase() + nombre.slice(1);
      let s = nombre + (sep || '');
      if (an) s += String((a || anio) + ajusteAnio);
      return s;
    });
  }

  function nombreMes(m, forma) {
    const n = MESES[m - 1];
    if (forma === 'MAY') return n.toUpperCase();
    if (forma === 'Cap') return n[0].toUpperCase() + n.slice(1);
    return n;
  }

  function datosEditables(libro) {
    const lista = [];
    const zonas = {};
    Object.keys(UNIDADES).forEach(function (k) {
      const u = UNIDADES[k];
      zonas[u.hoja] = { ini: u.ini, fin: u.fin, hasta: Motor.colANum(u.limpiar[1]) };
    });
    zonas.GASTOS = { ini: RANGO_GASTOS.ini, fin: RANGO_GASTOS.finRastra, hasta: Motor.colANum('BL') };
    zonas.Vales = { ini: 7, fin: 166, hasta: Motor.colANum('R') };
    libro.hojas.forEach(function (h) {
      const nombre = h.nombre.trim();
      const z = zonas[nombre];
      h.celdas.forEach(function (fila, r) {
        fila.forEach(function (x, c) {
          const clave = nombre + '!' + Motor.ref(c, r);
          if (x.f != null) return;
          const esNumero = x.v != null && x.si == null && x.t !== 'e' && x.t !== 'str' && x.t !== 'b';
          const esTextoDato = TEXTO_DATOS.indexOf(clave) >= 0;
          if (!esNumero && !esTextoDato) return;
          if (z && r >= z.ini && r <= z.fin && c <= z.hasta) return;
          if (EXCLUIR_DATOS.test(clave)) return;
          lista.push({
            clave: clave,
            hoja: nombre,
            celda: Motor.ref(c, r),
            valor: esTextoDato ? libro.valor(nombre, Motor.ref(c, r)) : Number(x.v),
            texto: esTextoDato,
            etiqueta: etiquetaFinal(ETIQUETAS[clave], etiquetaDe(libro, h, r, c), Motor.ref(c, r))
          });
        });
      });
    });
    return lista;
  }

  function etiquetaFinal(curada, auto, celda) {
    if (!curada) return auto || 'Dato ' + celda;
    if (curada.indexOf('%') < 0) return curada;
    return auto ? curada.replace('%', auto) : curada.replace(/\s*·\s*%|%/, '') || 'Dato ' + celda;
  }

  function etiquetaDe(libro, h, r, c) {
    const fila = h.celdas.get(r);
    for (let cc = c - 1; cc >= 1 && cc >= c - 6; cc--) {
      const x = fila && fila.get(cc);
      if (x && x.si != null) {
        const t = Motor.textoDeSi(x.si).trim();
        if (t && !/^\d/.test(t)) return t;
      }
    }
    for (let rr = r - 1; rr >= 1 && rr >= r - 4; rr--) {
      const f2 = h.celdas.get(rr);
      const x = f2 && f2.get(c);
      if (x && x.si != null) {
        const t = Motor.textoDeSi(x.si).trim();
        if (t) return t;
      }
    }
    return '';
  }

  async function generar(plantilla, JSZip, mes) {
    const libro = await Motor.abrir(plantilla, JSZip);
    const seg = new Seguidor();
    const g = agrupar(mes.renglones || []);
    const delta = (mes.anio - MES_PLANTILLA.anio) * 12 + (mes.mes - MES_PLANTILLA.mes);
    const datosBase = datosEditables(libro);
    libro.hojas.forEach(function (h) {
      h.celdas.forEach(function (fila) {
        fila.forEach(function (x) {
          if (x.si != null && x.f == null) {
            const t = Motor.textoDeSi(x.si);
            const n = cambiarMeses(t, delta, MES_PLANTILLA.anio);
            if (n !== t) x.si = '<si><t xml:space="preserve">' + n.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</t></si>';
          }
        });
      });
    });

    const estilos = {};
    Object.keys(UNIDADES).forEach(function (k) {
      const u = UNIDADES[k];
      estilos[k] = estilosColumna(libro, u.hoja, u.ini, u.fin, u.limpiar[0], u.limpiar[1]);
    });
    const estGastos = estilosColumna(libro, 'GASTOS', RANGO_GASTOS.ini, RANGO_GASTOS.finRastra, 'A', 'BL');
    const estVales = estilosColumna(libro, 'Vales', 107, 149, 'B', 'R');
    const estValesTacoma = estilosColumna(libro, 'Vales', 155, 166, 'B', 'E');
    const estHoja1 = estilosColumna(libro, 'Hoja1', RANGO_HOJA1.ini, RANGO_HOJA1.fin, 'A', 'G');

    const filasUnidad = {};
    Object.keys(UNIDADES).forEach(function (k) {
      const u = UNIDADES[k];
      const d = g[k];
      const n = Math.max(d.comb.length, d.viat.length, d.gasto.length);
      const fin = crecer(libro, seg, u.hoja, u.ini, u.fin, n);
      filasUnidad[k] = { ini: u.ini, fin: fin };
    });

    Object.keys(UNIDADES).forEach(function (k) {
      const u = UNIDADES[k];
      const d = g[k];
      const est = estilos[k];
      const cols = COLUMNAS[u.tipo];
      const fu = filasUnidad[k];
      vaciarZona(libro, u.hoja, fu.ini, fu.fin, u.limpiar[0], u.limpiar[1], true);
      if (u.notas) vaciarZona(libro, u.hoja, fu.ini, fu.fin - 1, u.notas[0], u.notas[1], false);
      d.comb.forEach(function (r, i) {
        const fila = fu.ini + i;
        const p = function (campo, valor, esFecha) {
          const col = cols.comb[campo];
          if (col) ponerTipado(libro, u.hoja, col + fila, valor, est[col], esFecha);
        };
        p('fecha', r.fecha, true);
        p('galones', num(r.galones));
        p('vale', valorVale(r.vale));
        p('monto', num(r.monto));
        p('gal_trans', num(r.gal_trans));
        p('destino', r.destino || null);
        if (u.tipo === 'pipa' && r.cargo && cols.cargo[r.cargo] && num(r.gal_trans) != null) {
          const col = cols.cargo[r.cargo];
          ponerTipado(libro, u.hoja, col + fila, num(r.gal_trans), est[col]);
        }
        if (u.tipo === 'rastra' && r.viajes) {
          VIAJES_RASTRA.forEach(function (v) {
            const cant = num(r.viajes[v.clave]);
            if (cant) ponerTipado(libro, u.hoja, v.col + fila, cant, est[v.col]);
          });
        }
      });
      d.viat.forEach(function (r, i) {
        const fila = fu.ini + i;
        ponerTipado(libro, u.hoja, cols.viat.fecha + fila, r.fecha, est[cols.viat.fecha], true);
        ponerTipado(libro, u.hoja, cols.viat.vale + fila, valorVale(r.vale), est[cols.viat.vale]);
        ponerTipado(libro, u.hoja, cols.viat.monto + fila, num(r.monto), est[cols.viat.monto]);
      });
      d.gasto.forEach(function (r, i) {
        const fila = fu.ini + i;
        ponerTipado(libro, u.hoja, cols.gasto.fecha + fila, r.fecha, est[cols.gasto.fecha], true);
        ponerTipado(libro, u.hoja, cols.gasto.vale + fila, valorVale(r.vale), est[cols.gasto.vale]);
        ponerTipado(libro, u.hoja, cols.gasto.monto + fila, num(r.monto), est[cols.gasto.monto]);
        const detalle = r.detalle || (r.tipo === 'viatico' ? 'Viáticos' : null);
        ponerTipado(libro, u.hoja, cols.gasto.detalle + fila, detalle, est[cols.gasto.detalle]);
      });

      u.manos.forEach(function (m) {
        const dir = seg.celda(u.hoja, m.celda);
        const terminos = [];
        d.gasto.forEach(function (r, i) {
          if (m.clases.indexOf(claseGasto(r)) >= 0) terminos.push(cols.gasto.monto + (fu.ini + i));
        });
        const extras = (m.extra || []).map(function (e) { return seg.celda(u.hoja, e); });
        const todos = m.extraPrimero ? extras.concat(terminos) : terminos.concat(extras);
        if (todos.length) libro.poner(u.hoja, dir, null, { formula: todos.join('+') });
        else libro.poner(u.hoja, dir, 0);
      });

      if (u.clientes) {
        const k0 = d.comb.filter(function (r) { return r.mes_anterior; }).length;
        const finC = seg.fila(u.hoja, u.finClientes);
        Object.keys(u.clientes).forEach(function (col) {
          const dir = seg.celda(u.hoja, u.clientes[col]);
          const vieja = libro.celda(u.hoja, dir);
          let estilo = vieja ? vieja.s : undefined;
          if (estilo === undefined) {
            const vecina = libro.celda(u.hoja, 'G' + Motor.partirRef(dir).r);
            estilo = vecina ? vecina.s : undefined;
          }
          libro.poner(u.hoja, dir, null, { formula: 'SUM(' + col + (u.ini + k0) + ':' + col + finC + ')', estilo: estilo });
        });
      }

      if (u.viajes) {
        const viajes = d.comb.filter(function (r) {
          if (r.mes_anterior) return false;
          if (u.tipo === 'rastra') return VIAJES_RASTRA.some(function (v) { return num(r.viajes && r.viajes[v.clave]); });
          return num(r.gal_trans) > 0;
        }).length;
        libro.poner(u.hoja, seg.celda(u.hoja, u.viajes), viajes);
      }
    });

    llenarGastos(libro, seg, g, estGastos);
    llenarVales(libro, seg, g, filasUnidad, estVales, estValesTacoma);
    llenarHoja1(libro, seg, mes.facturas || [], estHoja1);

    libro.poner('TACOMA', seg.celda('TACOMA', 'A2'), 'TACOMA ROJO   MES ' + nombreMes(mes.mes, 'MAY') + ' ' + mes.anio);
    libro.poner('Vales', seg.celda('Vales', 'B153'), 'TACOMA ROJO   MES ' + nombreMes(mes.mes, 'Cap'));
    const previo = mes.mes === 1 ? 12 : mes.mes - 1;
    libro.poner('Hoja1', seg.celda('Hoja1', 'E77'), 'Salarios de ' + nombreMes(previo, 'Cap'));

    const datos = mes.datos || {};
    datosBase.forEach(function (d) {
      if (!(d.clave in datos)) return;
      const v = datos[d.clave];
      const dir = seg.celda(d.hoja, d.celda);
      if (d.texto) libro.poner(d.hoja, dir, v == null ? null : String(v));
      else libro.poner(d.hoja, dir, v == null || v === '' ? null : num(v));
    });
    if ('Hoja1!F77' in datos) libro.poner('Hoja1', seg.celda('Hoja1', 'F77'), num(datos['Hoja1!F77']));

    const ev = libro.calcular();
    return { libro: libro, evaluador: ev, seguidor: seg };
  }

  function llenarGastos(libro, seg, g, est) {
    const pedidos = {
      A: g.TS02, N: g.TS03, AA: g.TS01, AN: { comb: g.TS04.comb.concat(g.TACOMA.comb.map(function (r) { return Object.assign({ _tacoma: true }, r); })), viat: [], gasto: g.TS04.gasto }, AX: g.Rastra
    };
    let necesarias = 0;
    let necesariasRastra = 0;
    Object.keys(pedidos).forEach(function (b) {
      const d = pedidos[b];
      const n = Math.max(d.comb.length, d.viat.length, d.gasto.length);
      if (b === 'AX') necesariasRastra = n; else necesarias = Math.max(necesarias, n);
    });
    const capacidad = RANGO_GASTOS.fin - RANGO_GASTOS.ini + 1;
    const capRastra = RANGO_GASTOS.finRastra - RANGO_GASTOS.ini + 1;
    const extra = Math.max(necesarias - capacidad, necesariasRastra - capRastra, 0);
    if (extra > 0) {
      const desde = seg.fila('GASTOS', RANGO_GASTOS.ini + 2);
      libro.insertarFilas('GASTOS', desde, extra, seg.fila('GASTOS', RANGO_GASTOS.ini + 1));
      seg.anotar('GASTOS', desde, extra);
    }
    const fin = seg.fila('GASTOS', RANGO_GASTOS.finRastra);
    vaciarZona(libro, 'GASTOS', RANGO_GASTOS.ini, fin, 'A', 'BL', false);
    const p = function (col, fila, valor, esFecha) { ponerTipado(libro, 'GASTOS', col + fila, valor, est[col], esFecha); };
    Object.keys(pedidos).forEach(function (b) {
      const d = pedidos[b];
      const cols = GASTOS_BLOQUES[b];
      d.comb.forEach(function (r, i) {
        const fila = RANGO_GASTOS.ini + i;
        if (r._tacoma) {
          p(cols.comb[0], fila, r.fecha, true);
          p(cols.comb[1], fila, valorVale(r.vale));
          p(cols.comb[2], fila, num(r.galones));
          p(cols.comb[3], fila, num(r.monto));
          return;
        }
        p(cols.comb[0], fila, r.fecha, true);
        p(cols.comb[1], fila, num(r.galones));
        p(cols.comb[2], fila, valorVale(r.vale));
        p(cols.comb[3], fila, num(r.monto));
        if (b === 'AX') {
          const v = r.viajes || {};
          const fert = (num(v.fert250) || 0) * 2.5 + (num(v.fertpq) || 0) * 4000;
          const cem = (num(v.block) || 0) * 4000 + (num(v.cemento) || 0) * 4500 + (num(v.cementopq) || 0) * 4000;
          p(cols.comb[4], fila, fert || null);
          p(cols.comb[6], fila, cem || null);
          p(cols.comb[7], fila, r.destino || null);
        } else {
          p(cols.comb[4], fila, num(r.gal_trans));
          p(cols.comb[5], fila, r.destino || null);
        }
      });
      (d.viat || []).forEach(function (r, i) {
        const fila = RANGO_GASTOS.ini + i;
        p(cols.viat[0], fila, r.fecha, true);
        p(cols.viat[1], fila, valorVale(r.vale));
        p(cols.viat[2], fila, num(r.monto));
      });
      d.gasto.forEach(function (r, i) {
        const fila = RANGO_GASTOS.ini + i;
        p(cols.gasto[0], fila, r.fecha, true);
        p(cols.gasto[1], fila, valorVale(r.vale));
        p(cols.gasto[2], fila, num(r.monto));
        p(cols.gasto[3], fila, r.detalle || (r.tipo === 'viatico' ? 'Viáticos' : null));
      });
    });
  }

  function llenarVales(libro, seg, g, filasUnidad, est, estTacoma) {
    const orden = ['TS01', 'TS02', 'TS03', 'TS04', 'Rastra', 'TACOMA'];
    const planes = {};
    orden.forEach(function (k) {
      const u = UNIDADES[k];
      const d = g[k];
      const sinFactura = d.gasto.filter(function (r) { return !tieneFactura(r); });
      const conFactura = d.gasto.filter(tieneFactura);
      let filasIzq;
      if (u.vales.soloCombustible) filasIzq = d.comb.length;
      else if (u.tipo === 'tag') filasIzq = Math.max(d.comb.length, sinFactura.length);
      else filasIzq = Math.max(d.comb.length, d.viat.length) + sinFactura.length;
      planes[k] = { sinFactura: sinFactura, conFactura: conFactura, n: Math.max(filasIzq, conFactura.length) };
    });
    orden.forEach(function (k) {
      const u = UNIDADES[k];
      const fin = crecer(libro, seg, 'Vales', u.vales.ini, u.vales.fin, planes[k].n, u.vales.ini);
      planes[k].fin = fin;
    });
    orden.forEach(function (k) {
      const u = UNIDADES[k];
      const d = g[k];
      const pl = planes[k];
      const cols = COLUMNAS[u.tipo];
      const ini = seg.fila('Vales', u.vales.ini);
      const fin = seg.fila('Vales', u.vales.fin);
      const hojaRef = "'" + libro.hoja(u.hoja).nombre.replace(/'/g, "''") + "'!";
      const refHoja = /^[A-Za-z_][A-Za-z0-9_]*$/.test(libro.hoja(u.hoja).nombre) ? libro.hoja(u.hoja).nombre + '!' : hojaRef;
      const e = u.vales.soloCombustible ? estTacoma : est;
      vaciarZona(libro, 'Vales', ini, fin, 'B', u.vales.soloCombustible ? 'E' : 'R', true);
      const fu = filasUnidad[k];
      const enlace = function (col, filaVales, colHoja, filaHoja) {
        libro.poner('Vales', col + filaVales, null, { formula: refHoja + colHoja + filaHoja, estilo: estiloPara(libro, 'Vales', col + filaVales, e[col]) });
      };
      d.comb.forEach(function (r, i) {
        const fh = fu.ini + i;
        const fv = ini + i;
        if (u.tipo === 'tacoma') {
          enlace('B', fv, 'A', fh); enlace('C', fv, 'B', fh); enlace('D', fv, 'C', fh); enlace('E', fv, 'D', fh);
        } else {
          enlace('B', fv, cols.comb.fecha, fh); enlace('C', fv, cols.comb.galones, fh); enlace('D', fv, cols.comb.vale, fh); enlace('E', fv, cols.comb.monto, fh);
        }
      });
      if (u.vales.soloCombustible) return;
      d.viat.forEach(function (r, i) {
        const fh = fu.ini + i;
        const fv = ini + i;
        enlace('F', fv, cols.viat.fecha, fh); enlace('G', fv, cols.viat.vale, fh); enlace('H', fv, cols.viat.monto, fh);
        libro.poner('Vales', 'I' + fv, 'Viáticos', { estilo: estiloPara(libro, 'Vales', 'I' + fv, e.I) });
      });
      const base = u.tipo === 'tag' ? 0 : Math.max(d.comb.length, d.viat.length);
      pl.sinFactura.forEach(function (r, i) {
        const fh = fu.ini + d.gasto.indexOf(r);
        const fv = ini + base + i;
        enlace('F', fv, cols.gasto.fecha, fh); enlace('G', fv, cols.gasto.vale, fh); enlace('H', fv, cols.gasto.monto, fh); enlace('I', fv, cols.gasto.detalle, fh);
      });
      pl.conFactura.forEach(function (r, i) {
        const fh = fu.ini + d.gasto.indexOf(r);
        const fv = ini + i;
        const f = r.factura || {};
        enlace('J', fv, cols.gasto.fecha, fh); enlace('K', fv, cols.gasto.vale, fh); enlace('L', fv, cols.gasto.monto, fh); enlace('M', fv, cols.gasto.detalle, fh);
        ponerTipado(libro, 'Vales', 'N' + fv, f.fecha || null, e.N, true);
        ponerTipado(libro, 'Vales', 'O' + fv, f.serie || null, e.O);
        ponerTipado(libro, 'Vales', 'P' + fv, f.nit != null && f.nit !== '' ? String(f.nit) : null, e.P);
        ponerTipado(libro, 'Vales', 'Q' + fv, f.proveedor || null, e.Q);
        ponerTipado(libro, 'Vales', 'R' + fv, num(f.monto), e.R);
      });
    });
  }

  function tieneFactura(r) {
    const f = r.factura;
    return !!(f && (f.serie || f.nit || f.proveedor || num(f.monto)));
  }

  function llenarHoja1(libro, seg, facturas, est) {
    const fin = crecer(libro, seg, 'Hoja1', RANGO_HOJA1.ini, RANGO_HOJA1.fin, facturas.length);
    vaciarZona(libro, 'Hoja1', RANGO_HOJA1.ini, fin, 'A', 'G', true);
    facturas.forEach(function (f, i) {
      const fila = RANGO_HOJA1.ini + i;
      const eA = estiloPara(libro, 'Hoja1', 'A' + fila, est.A);
      if (i === 0) libro.poner('Hoja1', 'A' + fila, 1, { estilo: eA });
      else libro.poner('Hoja1', 'A' + fila, null, { formula: 'A' + (fila - 1) + '+1', estilo: eA });
      ponerTipado(libro, 'Hoja1', 'B' + fila, f.fecha || null, est.B, true);
      ponerTipado(libro, 'Hoja1', 'C' + fila, f.factura || null, est.C);
      ponerTipado(libro, 'Hoja1', 'D' + fila, f.nit != null && f.nit !== '' ? String(f.nit) : null, est.D);
      ponerTipado(libro, 'Hoja1', 'E' + fila, f.proveedor || null, est.E);
      ponerTipado(libro, 'Hoja1', 'F' + fila, num(f.monto), est.F);
      ponerTipado(libro, 'Hoja1', 'G' + fila, f.descripcion || null, est.G);
    });
    const total = seg.celda('Hoja1', RANGO_HOJA1.total);
    libro.poner('Hoja1', total, null, { formula: 'SUM(F' + RANGO_HOJA1.ini + ':F' + fin + ')' });
  }

  async function listarDatos(plantilla, JSZip) {
    const libro = await Motor.abrir(plantilla, JSZip);
    const lista = datosEditables(libro);
    lista.push({ clave: 'Hoja1!F77', hoja: 'Hoja1', celda: 'F77', valor: 23295.24, texto: false, etiqueta: 'Salarios del mes anterior' });
    return lista;
  }

  return {
    generar: generar,
    listarDatos: listarDatos,
    UNIDADES: UNIDADES,
    VIAJES_RASTRA: VIAJES_RASTRA,
    MESES: MESES,
    cambiarMeses: cambiarMeses
  };
});
