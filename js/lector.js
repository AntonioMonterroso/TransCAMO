(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.LectorVale = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DESTINOS = ['Reu', 'Retalhuleu', 'Acapán', 'Acapan', 'Champerico', 'Ayutía', 'Ayutia', 'Nuevo San Carlos', 'S3', 'Zona 18', 'Puerto Quetzal', 'Cobadonga', 'La Montaña', 'Coatepeque', 'Xochi', 'Mazatenango', 'Escuintla', 'Galindo', 'Finca la Naco', 'La Virgen'];

  function aNumero(t) {
    if (t == null) return null;
    let s = String(t).replace(/[Qq\s]/g, '').replace(/[oO]/g, '0').replace(/[lI|]/g, '1');
    s = s.replace(/[.\-]+$/, '');
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
    else if (/^\d+,\d{1,2}$/.test(s)) s = s.replace(',', '.');
    else s = s.replace(/,/g, '');
    const n = Number(s);
    return isNaN(n) ? null : n;
  }

  function primerMonto(linea) {
    const m = /Q?\.?\s*(\d[\d,]*(?:\.\d{1,2})?)/.exec(linea);
    return m ? aNumero(m[1]) : null;
  }

  function leer(texto, contexto) {
    const ctx = contexto || {};
    const res = { renglones: [], avisos: [] };
    if (!texto || !texto.trim()) return res;
    const t = texto.replace(/\r/g, '');
    const lineas = t.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
    const plano = lineas.join(' ');

    const mNum = /N[o0º°]\s*\.?\s*0*(\d{3,6})/i.exec(plano);
    if (mNum) res.numero = mNum[1];

    const mUni = /\b(T\s*[S5]|TAG)\s*-?\s*0?([1-4])\b/i.exec(plano);
    if (mUni) res.unidad = 'TS0' + mUni[2];
    else if (/rastra/i.test(plano)) res.unidad = 'Rastra';
    else if (/tacoma/i.test(plano)) res.unidad = 'TACOMA';

    const mPlaca = /\b([CP])\s*-?\s*(\d{3})\s*-?\s*([A-Z]{3})\b/.exec(plano.toUpperCase());
    if (mPlaca) res.placa = mPlaca[1] + '-' + mPlaca[2] + mPlaca[3];

    const reFecha = /(?:^|[^\d.,])(\d{1,2})\s*[\/\-\s|]\s*(\d{1,2})\s*[\/\-\s|]\s*(20\d{2}|\d{2})(?![\d.,])/g;
    let mFecha;
    while ((mFecha = reFecha.exec(plano))) {
      const d = +mFecha[1], m = +mFecha[2];
      let a = +mFecha[3];
      if (a < 100) a += 2000;
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && a >= 2020 && a <= 2099) {
        res.fecha = a + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        break;
      }
      reFecha.lastIndex = mFecha.index + 1;
    }

    const mTotal = /TOTAL\s*Q?\.?\s*:?\s*(\d[\d,]*(?:\.\d{1,2})?)/i.exec(plano) || /Por\s*Q\.?\s*(\d[\d,]*(?:\.\d{1,2})?)/i.exec(plano);
    if (mTotal) res.total = aNumero(mTotal[1]);

    lineas.forEach(function (l, i) {
      if (/di[eé]s[eo]l/i.test(l)) {
        const nums = (l.match(/\d[\d,]*(?:\.\d+)?/g) || []).map(aNumero).filter(function (x) { return x != null; });
        let gal = null, monto = null;
        nums.forEach(function (n) {
          if (n < 200 && /\.\d{2,3}$/.test(String(n)) && gal == null) gal = n;
          else if (n >= 200) monto = n;
        });
        if (gal == null) {
          const previa = lineas[i - 1] || '';
          const mg = /^(\d{1,3}\.\d{1,3})$/.exec(previa);
          if (mg) gal = aNumero(mg[1]);
        }
        if (monto != null || gal != null) res.renglones.push({ concepto: 'diesel', galones: gal, monto: monto });
      } else if (/vi[aá]tico/i.test(l)) {
        res.renglones.push({ concepto: 'viatico', monto: primerMonto(l.replace(/vi[aá]tico/i, '')) });
      } else if (/arbitrio/i.test(l)) {
        res.renglones.push({ concepto: 'arbitrio', monto: primerMonto(l.replace(/arbitrio/i, '')) });
      } else if (/peaje|autopista/i.test(l)) {
        res.renglones.push({ concepto: 'peaje', monto: primerMonto(l), detalle: l });
      } else if (/quincena|sueldo|salario/i.test(l)) {
        res.renglones.push({ concepto: 'sueldo', monto: res.total || null, detalle: l });
      }
    });

    if (/carg[oóa]\s*(en)?\s*puma/i.test(plano)) res.cargo = 'puma';
    else if (/carg[oóa]\s*(en)?\s*santander/i.test(plano)) res.cargo = 'santander';
    else if (/carg[oóa]\s*(en)?\s*camo/i.test(plano)) res.cargo = 'camo';

    const mGls = /total\s*=?\s*(\d[\d,]*)\s*g/i.exec(plano) || /=\s*(\d[\d,]{3,})\s*g?ls/i.exec(plano);
    if (mGls) res.gal_trans = aNumero(mGls[1]);
    let sumaProductos = 0;
    let hayProductos = false;
    const reProd = /(\d[\d,]{2,})\s*([SRDB])\b|\b([SRDB])\s*[=:]\s*(\d[\d,]{2,})/g;
    let mp;
    while ((mp = reProd.exec(plano))) {
      const n = aNumero(mp[1] || mp[4]);
      if (n != null && n >= 100 && n <= 20000) { sumaProductos += n; hayProductos = true; }
    }
    if (hayProductos) {
      res.productos = sumaProductos;
      if (res.gal_trans == null) {
        const ultimas = lineas.slice(-2).map(function (l) { return /^=?\s*(\d[\d,]{3,})\s*(g?ls)?\.?$/i.exec(l); }).filter(Boolean);
        res.gal_trans = ultimas.length ? aNumero(ultimas[ultimas.length - 1][1]) : sumaProductos;
      }
      if (Math.abs(res.gal_trans - sumaProductos) > 0.5) res.avisos.push('Los galones por producto suman ' + sumaProductos + ' y el total dice ' + res.gal_trans + '.');
    }

    const vistos = [];
    DESTINOS.forEach(function (d) {
      const re = new RegExp('\\b' + d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      const norm = d.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      if (re.test(plano) && !vistos.some(function (v) { return v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() === norm; })) vistos.push(d);
    });
    if (vistos.length) res.destino = vistos.join(', ');

    if (ctx.pilotos) {
      ctx.pilotos.forEach(function (p) {
        const ap = p.split(/\s+/).pop();
        if (ap && new RegExp(ap, 'i').test(plano)) res.piloto = p;
      });
    }

    if (res.total != null && res.renglones.length) {
      const suma = res.renglones.reduce(function (a, r) { return a + (r.monto || 0); }, 0);
      if (Math.abs(suma - res.total) > 0.009) res.avisos.push('La suma de los renglones no cuadra con el total del vale.');
    }
    return res;
  }

  return { leer: leer, aNumero: aNumero, DESTINOS: DESTINOS };
});
