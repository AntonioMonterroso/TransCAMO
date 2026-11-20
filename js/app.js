(function () {
  'use strict';

  const UNIDADES = [
    { id: 'TS01', nombre: 'TS-01', tipo: 'pipa' },
    { id: 'TS02', nombre: 'TS-02', tipo: 'pipa' },
    { id: 'TS03', nombre: 'TS-03', tipo: 'pipa' },
    { id: 'TS04', nombre: 'TS-04', tipo: 'tag' },
    { id: 'Rastra', nombre: 'Rastra', tipo: 'rastra' },
    { id: 'TACOMA', nombre: 'Tacoma', tipo: 'tacoma' }
  ];
  const UNI = {};
  UNIDADES.forEach(function (u) { UNI[u.id] = u; });

  const CONCEPTOS = [
    { id: 'diesel', nombre: 'Diésel', tipo: 'combustible' },
    { id: 'viatico', nombre: 'Viático', tipo: 'viatico' },
    { id: 'arbitrio', nombre: 'Arbitrio', tipo: 'gasto', clase: 'reparacion', detalle: 'Arbitrio' },
    { id: 'peaje', nombre: 'Peaje', tipo: 'gasto', clase: 'reparacion', detalle: 'Peaje' },
    { id: 'reparacion', nombre: 'Reparación o repuesto', tipo: 'gasto', clase: 'reparacion' },
    { id: 'sueldo', nombre: 'Sueldo o quincena', tipo: 'gasto', clase: 'sueldo' },
    { id: 'otro', nombre: 'Otro gasto', tipo: 'gasto', clase: 'reparacion' }
  ];
  const CON = {};
  CONCEPTOS.forEach(function (c) { CON[c.id] = c; });

  const CARGOS = [
    { id: 'santander', nombre: 'Santander' },
    { id: 'puma', nombre: 'Puma Lerin' },
    { id: 'camo', nombre: 'Camo' }
  ];

  const ROLES = { admin: 'Administrador', captura: 'Captura', lector: 'Solo ver' };
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const ICONOS = {
    vales: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    paquete: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    facturas: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
    datos: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    excel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    usuarios: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14.5c2.2.6 3.5 2.6 3.5 5.5"/>',
    luna: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
    sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    salir: '<path d="M12 3v8"/><path d="M6.4 6.5a8 8 0 1 0 11.2 0"/>',
    contraer: '<path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/>',
    atras: '<path d="m15 6-6 6 6 6"/>',
    adelante: '<path d="m9 6 6 6-6 6"/>',
    lapiz: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bajar: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    borrar: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    girar: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
    acercar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6M11 8v6"/>',
    alejar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>'
  };

  function ico(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONOS[n] + '</svg>';
  }

  const E = {
    usuario: null,
    mes: null,
    vista: 'vales',
    vales: [],
    facturas: [],
    filtro: 'todas',
    busca: '',
    marcados: new Set(),
    marcadasFact: new Set(),
    buscaFact: '',
    paquete: null,
    editor: null,
    datos: null,
    buscaDatos: '',
    cargando: false
  };

  const $app = document.getElementById('app');
  const $capas = document.getElementById('capas');
  const $avisos = document.getElementById('avisos');

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function num(x) {
    if (x == null || x === '') return null;
    if (typeof x === 'number') return x;
    return LectorVale.aNumero(x);
  }

  function fmtQ(n) {
    const v = num(n);
    if (v == null) return 'Q —';
    const s = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (v < 0 ? '−Q ' : 'Q ') + s;
  }

  function fmtNum(n, dec) {
    const v = num(n);
    if (v == null) return '—';
    return v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: dec == null ? 3 : dec });
  }

  function fmtFecha(f) {
    if (!f) return 'Sin fecha';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(f);
    return m ? m[3] + '/' + m[2] + '/' + m[1] : f;
  }

  function nombreMes(mes) {
    const m = /^(\d{4})-(\d{2})/.exec(mes);
    const t = MESES[+m[2] - 1];
    return t[0].toUpperCase() + t.slice(1) + ' ' + m[1];
  }

  function mesCorto(mes) {
    const m = /^(\d{4})-(\d{2})/.exec(mes);
    const t = MESES[+m[2] - 1].slice(0, 3);
    return t[0].toUpperCase() + t.slice(1) + m[1].slice(2);
  }

  function moverMes(mes, d) {
    const m = /^(\d{4})-(\d{2})/.exec(mes);
    let a = +m[1], n = +m[2] + d;
    while (n > 12) { n -= 12; a++; }
    while (n < 1) { n += 12; a--; }
    return a + '-' + String(n).padStart(2, '0') + '-01';
  }

  function hoyISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function iniciales(t) {
    const p = String(t || '?').replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
    return ((p[0] || '?')[0] + (p[1] ? p[1][0] : (p[0] || '').slice(1, 2))).toUpperCase();
  }

  function recordar(clave, valor) {
    try { localStorage.setItem('transcamo:pref:' + clave, JSON.stringify(valor)); } catch (e) { return; }
  }

  function recordado(clave, defecto) {
    try {
      const t = localStorage.getItem('transcamo:pref:' + clave);
      return t ? JSON.parse(t) : defecto;
    } catch (e) { return defecto; }
  }

  function aviso(texto, tipo) {
    const el = document.createElement('div');
    el.className = 'aviso aviso-' + (tipo || 'ok');
    el.innerHTML = '<span>' + esc(texto) + '</span><button type="button" class="aviso-x" title="Cerrar este aviso" aria-label="Cerrar">' + ico('cerrar') + '</button>';
    $avisos.appendChild(el);
    const quitar = function () { el.classList.add('saliendo'); setTimeout(function () { el.remove(); }, 200); };
    el.querySelector('.aviso-x').addEventListener('click', quitar);
    setTimeout(quitar, tipo === 'error' ? 9000 : 4500);
  }

  let nivelCapa = 0;

  function abrirCapa(html, clase) {
    nivelCapa++;
    const capa = document.createElement('div');
    capa.className = 'capa ' + (clase || '');
    capa.style.zIndex = String(100 + nivelCapa * 10);
    capa.innerHTML = '<div class="capa-fondo"></div><div class="capa-caja" role="dialog" aria-modal="true">' + html + '</div>';
    $capas.appendChild(capa);
    document.body.classList.add('con-capa');
    return capa;
  }

  function cerrarCapa(capa) {
    if (!capa || !capa.parentNode) return;
    capa.classList.add('saliendo');
    nivelCapa = Math.max(0, nivelCapa - 1);
    setTimeout(function () {
      capa.remove();
      if (!$capas.children.length) document.body.classList.remove('con-capa');
    }, 180);
  }

  function preguntar(o) {
    return new Promise(function (resolver) {
      const capa = abrirCapa(
        '<div class="hoja-cabeza"><h2 class="hoja-titulo">' + esc(o.titulo) + '</h2></div>' +
        '<div class="hoja-cuerpo"><p class="dlg-texto">' + esc(o.texto || '') + '</p></div>' +
        '<div class="hoja-pie"><span></span><div class="erp-chips">' +
        '<button type="button" class="m-btn m-btn-secundario" data-r="no" title="' + esc(o.noAyuda || 'Volver sin hacer nada') + '">' + esc(o.no || 'Cancelar') + '</button>' +
        '<button type="button" class="m-btn ' + (o.peligro ? 'm-btn-peligro' : 'm-btn-primario') + '" data-r="si" title="' + esc(o.siAyuda || o.si) + '">' + esc(o.si) + '</button>' +
        '</div></div>', 'capa-pregunta');
      capa.addEventListener('click', function (ev) {
        const b = ev.target.closest('[data-r]');
        if (b) { cerrarCapa(capa); resolver(b.dataset.r === 'si'); }
        else if (ev.target.classList.contains('capa-fondo')) { cerrarCapa(capa); resolver(false); }
      });
      setTimeout(function () { const b = capa.querySelector('[data-r="si"]'); if (b) b.focus(); }, 30);
    });
  }

  function guardarScroll(fn) {
    const y = window.scrollY;
    fn();
    window.scrollTo(0, y);
  }

  function tipoDe(r) { return CON[r.concepto] ? CON[r.concepto].tipo : r.tipo; }

  function normalizarRenglon(r, unidad) {
    const c = CON[r.concepto] || CON.otro;
    const x = Object.assign({}, r);
    x.tipo = c.tipo;
    x.clase = c.tipo === 'gasto' ? c.clase : null;
    if (c.tipo !== 'combustible') { x.galones = null; x.gal_trans = null; x.cargo = null; x.mes_anterior = false; x.viajes = null; }
    if (c.tipo === 'combustible' && UNI[unidad] && UNI[unidad].tipo !== 'pipa') { x.cargo = null; x.mes_anterior = false; }
    if (c.tipo !== 'gasto') x.factura = null;
    if (c.tipo === 'gasto' && !x.detalle && c.detalle) x.detalle = c.detalle;
    return x;
  }

  function faltantes(v) {
    const f = [];
    if (!v.numero) f.push('número de vale');
    if (!v.fecha) f.push('fecha');
    if (num(v.total) == null) f.push('total');
    if (!v.renglones || !v.renglones.length) f.push('renglones');
    const u = UNI[v.unidad];
    (v.renglones || []).forEach(function (r) {
      if (num(r.monto) == null) f.push((CON[r.concepto] ? CON[r.concepto].nombre : 'renglón') + ' sin monto');
      if (tipoDe(r) === 'combustible') {
        if (num(r.galones) == null) f.push('galones cargados');
        if (u && u.tipo === 'pipa' && num(r.gal_trans) == null) f.push('galones transportados');
        if (u && u.tipo === 'pipa' && num(r.gal_trans) != null && !r.cargo) f.push('dónde cargó');
        if (u && u.tipo === 'rastra' && !(r.viajes && Object.keys(r.viajes).length)) f.push('tipo de viaje');
      }
    });
    const suma = (v.renglones || []).reduce(function (a, r) { return a + (num(r.monto) || 0); }, 0);
    if (num(v.total) != null && v.renglones && v.renglones.length && Math.abs(suma - num(v.total)) > 0.009) f.push('la suma no cuadra con el total');
    return f.filter(function (x, i) { return f.indexOf(x) === i; });
  }

  function aRenglonesExcel(vales) {
    const out = [];
    const ord = vales.slice().sort(function (a, b) {
      const fa = a.fecha || '9999', fb = b.fecha || '9999';
      if (fa !== fb) return fa < fb ? -1 : 1;
      const na = num(a.numero) || 0, nb = num(b.numero) || 0;
      if (na !== nb) return na - nb;
      return String(a.creado_en || '').localeCompare(String(b.creado_en || ''));
    });
    let k = 0;
    ord.forEach(function (v) {
      (v.renglones || []).forEach(function (r) {
        const x = normalizarRenglon(r, v.unidad);
        out.push({
          unidad: v.unidad, tipo: x.tipo, clase: x.clase, orden: ++k, fecha: x.fecha || v.fecha, vale: v.numero,
          galones: x.galones, monto: x.monto, gal_trans: x.gal_trans, cargo: x.cargo, destino: x.destino, detalle: x.detalle,
          mes_anterior: !!x.mes_anterior, viajes: x.viajes, factura: x.factura
        });
      });
    });
    return out;
  }

  function aplicarTemaUsuario(t) {
    if (!t || !window.MonterrosoTema) return;
    const p = String(t).split(':');
    E._aplicandoTema = true;
    MonterrosoTema.letra(p[2] || 'normal');
    MonterrosoTema.aplicar(p[0], p[1] || undefined);
    E._aplicandoTema = false;
  }

  let temaT = null;
  document.addEventListener('monterroso:tema', function (ev) {
    actualizarBotonTema();
    if (E._aplicandoTema || !E.usuario || !ev.detail) return;
    const k = ev.detail.clave + ':' + (ev.detail.modo || 'oscuro') + (ev.detail.letra && ev.detail.letra !== 'normal' ? ':' + ev.detail.letra : '');
    if (k === E.usuario.tema) return;
    E.usuario.tema = k;
    clearTimeout(temaT);
    temaT = setTimeout(function () { Datos.guardarTema(k).catch(function (e) { aviso(e.message, 'error'); }); }, 400);
  });

  function actualizarBotonTema() {
    const b = document.getElementById('bTema');
    if (!b) return;
    const claro = document.documentElement.dataset.modo === 'claro';
    b.title = claro ? 'Cambiar a oscuro' : 'Cambiar a claro';
    b.setAttribute('aria-label', b.title);
  }

  async function iniciar() {
    E.mes = recordado('mes', moverMes(hoyISO().slice(0, 7) + '-01', -1));
    E.vista = recordado('vista', 'vales');
    E.filtro = recordado('filtro', 'todas');
    $app.innerHTML = '<div class="m-cargando pantalla-completa"><span class="m-logo" aria-hidden="true"></span><div class="m-cargando-linea"></div><span>Abriendo TransCAMO…</span></div>';
    Datos.alCambiarSesion(function (ev) { if (ev === 'SIGNED_OUT') { E.usuario = null; pintar(); } });
    try {
      E.usuario = await Datos.sesion();
    } catch (e) {
      aviso(e.message, 'error');
    }
    if (E.usuario) {
      aplicarTemaUsuario(E.usuario.tema);
      await cargarMes();
    }
    pintar();
  }

  async function cargarMes() {
    E.cargando = true;
    if (E.usuario) pintar();
    try {
      const r = await Promise.all([Datos.listarVales(E.mes), Datos.listarFacturas(E.mes)]);
      E.vales = r[0];
      E.facturas = r[1];
      E.marcados.clear();
      E.marcadasFact.clear();
      E.datos = null;
    } catch (e) {
      aviso(e.message, 'error');
    }
    E.cargando = false;
  }

  const VISTAS = [
    { id: 'vales', nombre: 'Vales', ayuda: 'Ver, buscar y corregir los vales del mes', grupo: 'Trabajo', icono: 'vales' },
    { id: 'paquete', nombre: 'Subir paquete', ayuda: 'Subir los vales de una pipa con fotos', grupo: 'Trabajo', icono: 'paquete', escribe: true },
    { id: 'facturas', nombre: 'Facturas', ayuda: 'Facturas de compra del mes (hoja Hoja1)', grupo: 'Trabajo', icono: 'facturas' },
    { id: 'datos', nombre: 'Datos del mes', ayuda: 'IGSS, ISR, saldo del banco y demás datos que no vienen en vales', grupo: 'Cierre del mes', icono: 'datos' },
    { id: 'excel', nombre: 'Excel del mes', ayuda: 'Descargar el Excel del mes', grupo: 'Cierre del mes', icono: 'excel' },
    { id: 'usuarios', nombre: 'Usuarios', ayuda: 'Ver quién entra y con qué permiso', grupo: 'Administración', icono: 'usuarios', admin: true }
  ];

  function vistasVisibles() {
    return VISTAS.filter(function (v) {
      if (v.admin && E.usuario.rol !== 'admin') return false;
      if (v.escribe && E.usuario.rol === 'lector') return false;
      return true;
    });
  }

  function pintar() {
    if (!E.usuario) { pintarEntrar(); return; }
    if (E.usuario.rol == null) { pintarSinPermiso(); return; }
    const visibles = vistasVisibles();
    if (!visibles.some(function (v) { return v.id === E.vista; })) E.vista = 'vales';
    const actual = VISTAS.find(function (v) { return v.id === E.vista; });
    let grupo = null;
    let menu = '';
    visibles.forEach(function (v) {
      if (v.grupo !== grupo) { grupo = v.grupo; menu += '<div class="m-grupo">' + esc(grupo) + '</div>'; }
      let cuenta = '';
      if (v.id === 'vales' && E.vales.length) cuenta = '<span class="m-cuenta m-cuenta-neutra">' + E.vales.length + '</span>';
      if (v.id === 'facturas' && E.facturas.length) cuenta = '<span class="m-cuenta m-cuenta-neutra">' + E.facturas.length + '</span>';
      menu += '<a href="#' + v.id + '" data-accion="vista" data-v="' + v.id + '"' + (E.vista === v.id ? ' aria-current="page"' : '') + ' title="' + esc(v.ayuda) + '">' + ico(v.icono) + '<span class="m-txt">' + esc(v.nombre) + '</span>' + cuenta + '</a>';
    });
    const anchoAngosto = window.matchMedia('(max-width: 860px)').matches;
    const compacto = !anchoAngosto && recordado('compacto', false);
    $app.innerHTML =
      '<div class="m-app" id="vApp" data-lateral="' + (compacto ? 'compacto' : '') + '">' +
      '<nav class="m-lateral" aria-label="Menú principal">' +
      '<div class="m-lateral-marca"><span class="m-logo" aria-hidden="true"></span><div class="m-lateral-nombre m-txt">TransCAMO<small>Control de pipas</small></div></div>' +
      '<div id="menu">' + menu + '</div>' +
      '<div class="m-lateral-pie">' +
      '<button type="button" class="erp-perfil-btn" data-accion="perfil" title="Mi perfil: apariencia y colores"><span class="m-avatar" aria-hidden="true">' + esc(iniciales(E.usuario.nombre)) + '</span><span class="m-txt"><b>' + esc(E.usuario.nombre) + '</b><span>' + esc(Datos.modo === 'local' ? 'Modo de prueba' : ROLES[E.usuario.rol] || '') + '</span></span></button>' +
      '<button type="button" id="bTema" data-accion="tema" title="Cambiar entre claro y oscuro">' + ico('luna').replace('<svg ', '<svg class="ico-luna" ') + ico('sol').replace('<svg ', '<svg class="ico-sol" ') + '</button>' +
      (Datos.modo === 'local' ? '' : '<button type="button" data-accion="salir" title="Cerrar sesión" aria-label="Cerrar sesión">' + ico('salir') + '</button>') +
      '<button type="button" data-accion="contraer" data-m-contraer title="' + (compacto ? 'Abrir el menú' : 'Contraer el menú a íconos') + '" aria-label="Contraer el menú">' + ico('contraer') + '</button>' +
      '</div></nav>' +
      '<header class="erp-barra-mes" id="barraMes">' +
      '<button type="button" class="erp-bm-menu" id="bmMenu" data-accion="menu-movil" title="Menú" aria-label="Menú" aria-expanded="false">' + ico('menu') + '</button>' +
      '<div class="erp-bm-mes" role="group" aria-label="Mes de trabajo"><span class="erp-bm-etq">Mes de trabajo</span>' +
      '<button type="button" class="m-icono-btn" data-accion="mes" data-d="-1" title="Ir al mes anterior" aria-label="Mes anterior">' + ico('atras') + '</button>' +
      '<b>' + esc(nombreMes(E.mes)) + '</b>' +
      '<button type="button" class="m-icono-btn" data-accion="mes" data-d="1" title="Ir al mes siguiente" aria-label="Mes siguiente">' + ico('adelante') + '</button></div>' +
      '<div class="erp-bm-donde"><span>TransCAMO</span><i>›</i><b>' + esc(actual ? actual.nombre : '') + '</b></div>' +
      (Datos.modo === 'local' ? '<span class="m-estado pendiente" title="Todavía no hay base: lo que guardes queda solo en este navegador">Modo de prueba</span>' : '') +
      '</header>' +
      '<main class="m-contenido" id="contenido">' + (E.cargando ? '<div class="m-cargando"><span class="m-logo" aria-hidden="true"></span><div class="m-cargando-linea"></div><span>Cargando ' + esc(nombreMes(E.mes)) + '…</span></div>' : vistaActual()) + '</main>' +
      '</div>';
    actualizarBotonTema();
  }

  function vistaActual() {
    if (E.vista === 'paquete') return vistaPaquete();
    if (E.vista === 'datos') return vistaDatos();
    if (E.vista === 'facturas') return vistaFacturas();
    if (E.vista === 'excel') return vistaExcel();
    if (E.vista === 'usuarios') return vistaUsuarios();
    return vistaVales();
  }

  function pintarEntrar() {
    $app.innerHTML =
      '<div class="m-acceso">' +
      '<div class="m-acceso-marca"><div><span class="m-logo" aria-hidden="true"></span><h1>TransCAMO</h1><p>Control de pipas</p></div><p class="contacto">Sistema hecho por Monterroso, Auditores &amp; Consultores</p></div>' +
      '<div class="m-acceso-forma"><form class="m-tarjeta" id="formEntrar" novalidate>' +
      '<div><div class="m-etiqueta">TransCAMO · Control de pipas</div><h1 class="m-titulo-3">Bienvenido de nuevo</h1></div>' +
      '<div class="m-campo"><label for="aCorreo">Correo</label><input class="m-entrada" id="aCorreo" name="correo" type="email" autocomplete="username" inputmode="email" required></div>' +
      '<div class="m-campo"><label for="aClave">Contraseña</label><div class="m-clave"><input class="m-entrada" id="aClave" name="clave" type="password" autocomplete="current-password" required>' +
      '<button type="button" data-accion="ver-clave" aria-label="Mostrar contraseña" title="Mostrar u ocultar la contraseña">' + ico('ojo') + '</button></div></div>' +
      '<button class="m-btn m-btn-primario" type="submit" title="Entrar con tu correo y contraseña">Entrar</button>' +
      '<p class="m-acceso-pie">Si no tienes usuario, pídeselo a la firma Monterroso.</p>' +
      '</form></div></div>';
  }

  function pintarSinPermiso() {
    $app.innerHTML = '<div class="m-acceso"><div class="m-acceso-marca"><div><span class="m-logo" aria-hidden="true"></span><h1>TransCAMO</h1><p>Control de pipas</p></div></div><div class="m-acceso-forma"><div class="m-tarjeta"><h1 class="m-titulo-3">Sin permiso todavía</h1><p class="m-texto-suave">Tu usuario existe, pero aún no tiene un perfil asignado. Pide a la firma que te lo active.</p><button type="button" class="m-btn m-btn-secundario" data-accion="salir" title="Cerrar tu sesión">Salir</button></div></div></div>';
  }

  function titulo(t, acciones) {
    return '<div class="erp-titulo-fila"><h1 class="erp-titulo">' + esc(t) + ' <span>· ' + esc(nombreMes(E.mes)) + '</span></h1>' + (acciones ? '<div class="erp-chips">' + acciones + '</div>' : '') + '</div>';
  }

  function vacio(titulo2, texto) {
    return '<div class="m-tarjeta m-vacio"><span class="m-logo" aria-hidden="true"></span><b>' + esc(titulo2) + '</b><span>' + esc(texto) + '</span></div>';
  }

  function valesFiltrados() {
    const b = E.busca.trim().toLowerCase();
    return E.vales.filter(function (v) {
      if (E.filtro !== 'todas' && v.unidad !== E.filtro) return false;
      if (!b) return true;
      const texto = [v.numero, v.piloto, v.placa, v.notas, fmtFecha(v.fecha), UNI[v.unidad] ? UNI[v.unidad].nombre : v.unidad]
        .concat((v.renglones || []).map(function (r) { return [r.detalle, r.destino, CON[r.concepto] ? CON[r.concepto].nombre : '', r.factura && r.factura.proveedor].join(' '); }))
        .join(' ').toLowerCase();
      return texto.indexOf(b) >= 0;
    }).sort(function (a, b2) {
      const fa = a.fecha || '9999', fb = b2.fecha || '9999';
      if (fa !== fb) return fa < fb ? -1 : 1;
      return (num(a.numero) || 0) - (num(b2.numero) || 0);
    });
  }

  function resumenUnidad(id) {
    const r = { comb: 0, gal: 0, galTrans: 0, viat: 0, gasto: 0, vales: 0 };
    E.vales.forEach(function (v) {
      if (v.unidad !== id) return;
      r.vales++;
      (v.renglones || []).forEach(function (x) {
        const t = tipoDe(x);
        if (t === 'combustible') { r.comb += num(x.monto) || 0; r.gal += num(x.galones) || 0; if (!x.mes_anterior) r.galTrans += num(x.gal_trans) || 0; }
        else if (t === 'viatico') r.viat += num(x.monto) || 0;
        else r.gasto += num(x.monto) || 0;
      });
    });
    return r;
  }

  function td(etq, contenido, clase) {
    return '<td data-etq="' + esc(etq) + '"' + (clase ? ' class="' + clase + '"' : '') + '>' + contenido + '</td>';
  }

  function tablaResumen() {
    const filas = UNIDADES.map(function (u) { return { u: u, r: resumenUnidad(u.id) }; }).filter(function (x) { return x.r.vales; });
    if (!filas.length) return '';
    const t = { vales: 0, comb: 0, gal: 0, viat: 0, gasto: 0, galTrans: 0 };
    filas.forEach(function (x) { Object.keys(t).forEach(function (k) { t[k] += x.r[k]; }); });
    const fila = function (nombre, r, pie) {
      return '<tr>' + td('Pipa', pie ? '<b>' + esc(nombre) + '</b>' : esc(nombre)) + td('Vales', String(r.vales), 'm-num col-sec') + td('Combustible', fmtQ(r.comb), 'm-num') + td('Galones cargados', fmtNum(r.gal), 'm-num col-sec') +
        td('Viáticos', fmtQ(r.viat), 'm-num') + td('Gastos', fmtQ(r.gasto), 'm-num') + td('Total', fmtQ(r.comb + r.viat + r.gasto), 'm-num') + td('Galones transportados', fmtNum(r.galTrans, 2), 'm-num') + '</tr>';
    };
    return '<div class="m-tabla-envoltura tabla-resumen"><div class="m-tabla-titulo"><b>Resumen por pipa</b><span>Lo mismo que suman las hojas TS01 a TACOMA del Excel</span></div>' +
      '<div class="tabla-desliza"><table class="m-tabla"><thead><tr><th>Pipa</th><th class="m-num col-sec">Vales</th><th class="m-num">Combustible</th><th class="m-num col-sec">Galones cargados</th><th class="m-num">Viáticos</th><th class="m-num">Gastos</th><th class="m-num">Total</th><th class="m-num">Galones transportados</th></tr></thead>' +
      '<tbody>' + filas.map(function (x) { return fila(x.u.nombre, x.r); }).join('') + '</tbody>' +
      '<tfoot>' + fila('Total del mes', t, true) + '</tfoot></table></div></div>';
  }

  function vistaVales() {
    const lista = valesFiltrados();
    const soloLee = E.usuario.rol === 'lector';
    const chips = [{ id: 'todas', nombre: 'Todas', n: E.vales.length }].concat(UNIDADES.map(function (u) {
      return { id: u.id, nombre: u.nombre, n: E.vales.filter(function (v) { return v.unidad === u.id; }).length };
    }));
    const conFalta = E.vales.filter(function (v) { return faltantes(v).length; }).length;
    let html = titulo('Vales', soloLee ? '' : '<button type="button" class="m-btn m-btn-primario" data-accion="vista" data-v="paquete" title="Subir los vales de una pipa con fotos">' + ico('paquete') + 'Subir paquete</button>');
    html += tablaResumen();
    html += '<div class="herramientas">' +
      '<div class="buscar-local">' + ico('buscar') + '<input type="search" class="m-entrada" data-campo="busca" value="' + esc(E.busca) + '" placeholder="Buscar por número, piloto, destino, detalle o proveedor" aria-label="Buscar vales"></div>' +
      '<div class="erp-chips" role="group" aria-label="Filtrar por pipa">' + chips.map(function (c) {
        return '<button type="button" class="m-chip" data-accion="filtro" data-f="' + c.id + '" aria-pressed="' + (E.filtro === c.id) + '" title="Mostrar solo ' + esc(c.nombre === 'Todas' ? 'todas las pipas' : c.nombre) + '">' + esc(c.nombre) + ' <span class="m-cifra">' + c.n + '</span></button>';
      }).join('') + '</div></div>';
    if (conFalta) html += '<div class="m-franja">' + conFalta + ' vale' + (conFalta === 1 ? ' tiene' : 's tienen') + ' datos por completar. Se guardaron igual; se marcan en la tabla.</div>';
    if (!lista.length) {
      return html + (E.vales.length ? vacio('Sin coincidencias', 'Ningún vale coincide con la búsqueda.') : vacio('Sin vales en ' + nombreMes(E.mes), 'Usa «Subir paquete» para empezar.'));
    }
    const todos = lista.every(function (v) { return E.marcados.has(v.id); });
    const suma = lista.reduce(function (a, v) { return a + (num(v.total) || 0); }, 0);
    html += '<div class="m-tabla-envoltura tabla-adapta"><div class="m-tabla-titulo"><b>' + lista.length + ' vale' + (lista.length === 1 ? '' : 's') + '</b>' +
      (!soloLee && E.marcados.size ? '<div class="erp-chips"><span>' + E.marcados.size + ' marcado' + (E.marcados.size === 1 ? '' : 's') + '</span><button type="button" class="m-btn m-btn-peligro m-btn-sm" data-accion="borrar-marcados" title="Borrar los vales marcados (pide confirmación)">' + ico('borrar') + 'Borrar marcados</button></div>' : '<span>Ordenados por fecha</span>') +
      '</div><table class="m-tabla tabla-vales"><thead><tr>' +
      (soloLee ? '' : '<th class="col-casilla"><input type="checkbox" data-accion="marcar-todos" title="Marcar o desmarcar todos los vales que se ven" aria-label="Marcar todos"' + (todos ? ' checked' : '') + '></th>') +
      '<th>No. vale</th><th>Fecha</th><th>Pipa</th><th>Renglones</th><th>Recorrido</th><th class="m-num">Total</th><th>Estado</th><th class="col-accion"></th></tr></thead><tbody>' +
      lista.map(function (v) { return filaVale(v, soloLee); }).join('') +
      '</tbody><tfoot><tr>' + (soloLee ? '' : '<td class="col-casilla"></td>') + '<td colspan="5" data-etq="">Total</td><td class="m-num" data-etq="Total">' + fmtQ(suma) + '</td><td colspan="2"></td></tr></tfoot></table></div>';
    return html;
  }

  function resumenRenglon(r) {
    const c = CON[r.concepto] || { nombre: r.concepto };
    let s = c.nombre;
    if (tipoDe(r) === 'combustible' && num(r.galones) != null) s += ' ' + fmtNum(r.galones) + ' gal';
    s += ' ' + fmtQ(r.monto);
    if (r.detalle && c.id !== 'arbitrio' && c.id !== 'peaje') s += ' · ' + r.detalle;
    if (r.mes_anterior) s += ' · del mes anterior';
    return s;
  }

  function filaVale(v, soloLee) {
    const f = faltantes(v);
    const u = UNI[v.unidad] || { nombre: v.unidad };
    const comb = (v.renglones || []).find(function (r) { return tipoDe(r) === 'combustible' && (r.destino || r.gal_trans); });
    const recorrido = comb ? [comb.gal_trans ? fmtNum(comb.gal_trans, 2) + ' gal' : '', comb.cargo ? 'cargó en ' + ((CARGOS.find(function (c) { return c.id === comb.cargo; }) || {}).nombre || comb.cargo) : '', comb.destino || ''].filter(Boolean).join(' · ') : '';
    return '<tr' + (f.length ? ' class="fila-falta"' : '') + '>' +
      (soloLee ? '' : '<td class="col-casilla"><input type="checkbox" data-accion="marcar" data-id="' + esc(v.id) + '" aria-label="Marcar el vale ' + esc(v.numero || '') + '"' + (E.marcados.has(v.id) ? ' checked' : '') + '></td>') +
      td('No. vale', '<b>' + esc(v.numero || '—') + '</b>', 'm-cifra') +
      td('Fecha', esc(fmtFecha(v.fecha)), 'm-cifra') +
      td('Pipa', esc(u.nombre)) +
      td('Renglones', (v.renglones || []).map(function (r) { return '<span class="renglon-linea">' + esc(resumenRenglon(r)) + '</span>'; }).join('') || '—') +
      td('Recorrido', esc(recorrido || '—'), recorrido ? '' : 'sin-dato') +
      td('Total', fmtQ(v.total), 'm-num') +
      td('Estado', f.length ? '<span class="m-estado pendiente" title="Falta: ' + esc(f.join(', ')) + '">Falta ' + f.length + '</span>' : '<span class="m-estado aprobado">Completo</span>') +
      '<td class="col-accion"><button type="button" class="m-icono-btn" data-accion="editar" data-id="' + esc(v.id) + '" title="' + (soloLee ? 'Ver este vale' : 'Corregir este vale') + '" aria-label="Editar vale">' + ico(soloLee ? 'ojo' : 'lapiz') + '</button></td>' +
      '</tr>';
  }

  const LOTE = 6;
  const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

  function prepararFoto(f) {
    if (f.prep) return f.prep;
    if (!f.archivo) return Promise.reject(new Error('Esta foto ya no está en pantalla. Vuelve a ponerla.'));
    f.prep = (async function () {
      let img;
      try { img = await createImageBitmap(f.archivo, { imageOrientation: 'from-image' }); } catch (e) {
        throw new Error('La foto ' + (f.nombre ? '«' + f.nombre + '» ' : '') + 'no se pudo abrir en este navegador. Si es HEIC, súbela desde el iPhone o desde Safari.');
      }
      const k = Math.min(1, 1568 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      if (img.close) img.close();
      const url = c.toDataURL('image/jpeg', 0.85);
      return { data: url.slice(url.indexOf(',') + 1), tipo: 'image/jpeg' };
    })();
    f.prep.catch(function () { f.prep = null; });
    return f.prep;
  }

  function pilotosConocidos() {
    return Array.from(new Set(E.vales.map(function (x) { return x.piloto; }).filter(Boolean)));
  }

  function nombreUnidad(id) { return UNI[id] ? UNI[id].nombre : id; }

  function resumenLectura(d) {
    if (!d) return '';
    const tipos = { ticket: 'Ticket', factura: 'Factura', recibo: 'Recibo', otro: 'Papel' };
    return [tipos[d.tipo] || '', d.numero ? 'No. ' + d.numero : '', d.fecha && FECHA_RE.test(d.fecha) ? fmtFecha(d.fecha) : '', d.total != null ? fmtQ(d.total) : ''].filter(Boolean).join(' · ');
  }

  function unirLecturas(a, b) {
    if (!a) return b ? JSON.parse(JSON.stringify(b)) : null;
    if (!b) return a;
    const x = JSON.parse(JSON.stringify(a));
    ['numero', 'fecha', 'unidad', 'placa', 'piloto'].forEach(function (k) { if (!x[k] && b[k]) x[k] = b[k]; });
    if (x.total == null && b.total != null) x.total = b.total;
    if (x.tipo !== 'vale' && b.tipo === 'vale') x.tipo = 'vale';
    (b.renglones || []).forEach(function (r) {
      const ya = (x.renglones || []).some(function (y) { return y.concepto === r.concepto && y.monto === r.monto; });
      if (!ya) (x.renglones = x.renglones || []).push(r);
    });
    x.recorrido = x.recorrido || {};
    const rb = b.recorrido || {};
    if (x.recorrido.gal_trans == null && rb.gal_trans != null) x.recorrido.gal_trans = rb.gal_trans;
    if (!x.recorrido.cargo && rb.cargo) x.recorrido.cargo = rb.cargo;
    if (!x.recorrido.destinos && rb.destinos) x.recorrido.destinos = rb.destinos;
    x.factura = x.factura || {};
    const fb = b.factura || {};
    ['fecha', 'serie', 'nit', 'proveedor'].forEach(function (k) { if (!x.factura[k] && fb[k]) x.factura[k] = fb[k]; });
    if (x.factura.monto == null && fb.monto != null) x.factura.monto = fb.monto;
    x.dudas = (x.dudas || []).concat(b.dudas || []);
    return x;
  }

  function valeDeLectura(d, unidad) {
    const u = UNI[unidad] || UNIDADES[0];
    const x = { renglones: [], dudas: [] };
    if (!d) return x;
    if (d.numero) x.numero = String(d.numero).replace(/^0+(?=\d)/, '');
    if (FECHA_RE.test(d.fecha || '')) x.fecha = d.fecha;
    if (d.total != null) x.total = d.total;
    if (d.piloto) x.piloto = d.piloto;
    if (d.placa) x.placa = String(d.placa).toUpperCase().replace(/\s+/g, '');
    (d.renglones || []).forEach(function (r) {
      const c = CON[r.concepto] ? r.concepto : 'otro';
      if (r.monto == null && c !== 'diesel') return;
      if (u.tipo === 'tacoma' && c !== 'diesel') { x.dudas.push('Se dejó fuera «' + (r.escrito || CON[c].nombre) + '»: la Tacoma solo lleva diésel.'); return; }
      const n = nuevoRenglon(c, unidad);
      n.monto = r.monto;
      if (CON[c].tipo === 'combustible') {
        n.galones = r.galones;
        if (r.galones > 0 && r.monto > 0) {
          const precio = r.monto / r.galones;
          if (precio < 20 || precio > 70) x.dudas.push('Revisa los galones de diésel: ' + fmtNum(r.galones, 3) + ' gal por ' + fmtQ(r.monto) + ' da ' + fmtQ(precio) + ' por galón.');
        }
      }
      if (CON[c].tipo === 'gasto') {
        const det = r.detalle || ((c === 'otro' || c === 'reparacion') ? r.escrito : '');
        if (det) n.detalle = det;
      }
      if (FECHA_RE.test(r.fecha || '') && r.fecha !== x.fecha) n.fecha = r.fecha;
      x.renglones.push(normalizarRenglon(n, unidad));
    });
    const rc = d.recorrido || {};
    const comb = x.renglones.find(function (r) { return tipoDe(r) === 'combustible'; });
    if (comb) {
      if (rc.gal_trans != null && (u.tipo === 'pipa' || u.tipo === 'tag')) comb.gal_trans = rc.gal_trans;
      if (rc.cargo && u.tipo === 'pipa') comb.cargo = rc.cargo;
      if (rc.destinos && u.tipo !== 'tacoma') comb.destino = rc.destinos;
    } else if (rc.gal_trans != null || rc.destinos) {
      x.dudas.push('Trae recorrido (' + [rc.gal_trans != null ? fmtNum(rc.gal_trans, 0) + ' gal' : '', rc.destinos || ''].filter(Boolean).join(', ') + ') pero no un renglón de diésel.');
    }
    const fa = d.factura || {};
    if (fa.serie || fa.nit || fa.proveedor || fa.monto != null) {
      const fac = { fecha: FECHA_RE.test(fa.fecha || '') ? fa.fecha : null, serie: fa.serie || null, nit: fa.nit || null, proveedor: fa.proveedor || null, monto: fa.monto };
      let g = x.renglones.find(function (r) { return r.concepto === 'reparacion' || r.concepto === 'otro'; }) || x.renglones.find(function (r) { return tipoDe(r) === 'gasto'; });
      if (!g && u.tipo !== 'tacoma') {
        g = normalizarRenglon(Object.assign(nuevoRenglon('reparacion', unidad), { monto: fa.monto, detalle: fa.proveedor || '' }), unidad);
        x.renglones.push(g);
      }
      if (g) g.factura = fac;
    }
    if (d.unidad && d.unidad !== unidad) x.dudas.unshift('La foto dice ' + nombreUnidad(d.unidad) + ', pero el paquete es de ' + u.nombre + '.');
    x.dudas = x.dudas.concat(d.dudas || []);
    return x;
  }

  function resumenParaSiguiente(it) {
    const d = it && it.lectura;
    if (!d) return '';
    return [d.numero ? 'No. ' + d.numero : '', d.fecha || '', d.total != null ? 'total ' + d.total : '', (d.renglones || []).map(function (r) { return r.concepto + ' ' + (r.monto == null ? '' : r.monto); }).join(', ')].filter(Boolean).join('; ');
  }

  function repintarPaquete() {
    if (E.vista === 'paquete') guardarScroll(pintar);
  }

  async function leerPaquete() {
    const p = E.paquete;
    if (!p || p.leyendo) return;
    p.leyendo = true;
    try {
      while (E.paquete === p) {
        const ini = p.items.findIndex(function (it) { return it.estado === 'cola'; });
        if (ini < 0) break;
        let fin = ini;
        let nf = p.items[ini].fotos.length;
        while (fin + 1 < p.items.length && p.items[fin + 1].estado === 'cola' && nf + p.items[fin + 1].fotos.length <= LOTE) { fin++; nf += p.items[fin].fotos.length; }
        const lote = p.items.slice(ini, fin + 1);
        lote.forEach(function (it) { it.estado = 'leyendo'; it.error = ''; });
        repintarPaquete();
        const lista = [];
        const malos = [];
        for (let k = 0; k < lote.length; k++) {
          const it = lote[k];
          try {
            const prep = [];
            for (const f of it.fotos) prep.push(await prepararFoto(f));
            it.fotos.forEach(function (f, j) { lista.push({ foto: f, prep: prep[j], pos: k + j / 100 }); });
          } catch (e) {
            it.estado = 'error';
            it.error = e.message;
            malos.push({ it: it, pos: k });
          }
        }
        let nuevos = [];
        if (lista.length) {
          try {
            const r = await Datos.leerFotos({
              fotos: lista.map(function (x) { return x.prep; }),
              unidad: p.unidad,
              pilotos: pilotosConocidos(),
              anterior: ini > 0 ? resumenParaSiguiente(p.items[ini - 1]) : ''
            });
            if (E.paquete !== p) break;
            const usadas = new Set();
            (r.documentos || []).forEach(function (d, k) {
              const mias = (d.fotos || []).map(function (n) { return lista[n - 1]; }).filter(function (x) {
                if (!x || usadas.has(x)) return false;
                usadas.add(x);
                return true;
              });
              if (!mias.length) return;
              const fotos = mias.map(function (x) { return x.foto; });
              const prev = p.items[ini - 1];
              if (k === 0 && d.sigue_del_anterior && prev && !prev.guardado && prev.estado === 'leido' && prev !== E.editor && !(E.editor && E.editor.itemObj === prev)) {
                prev.fotos = prev.fotos.concat(fotos);
                prev.lectura = unirLecturas(prev.lectura, d);
                return;
              }
              nuevos.push({ it: { fotos: fotos, guardado: false, estado: 'leido', lectura: d }, pos: Math.min.apply(null, mias.map(function (x) { return x.pos; })) });
            });
            lista.forEach(function (x) {
              if (!usadas.has(x)) nuevos.push({ it: { fotos: [x.foto], guardado: false, estado: 'leido', lectura: null, error: 'La lectura no tomó en cuenta esta foto: escribe sus datos o vuelve a leerla.' }, pos: x.pos });
            });
            p.quedan = r.quedan;
          } catch (e) {
            if (E.paquete !== p) break;
            nuevos = [];
            lote.forEach(function (it, k) { if (it.estado === 'leyendo') { it.estado = 'error'; it.error = e.message; nuevos.push({ it: it, pos: k }); } });
            const fila = nuevos.concat(malos).sort(function (a, b) { return a.pos - b.pos; }).map(function (x) { return x.it; });
            p.items.splice(p.items.indexOf(lote[0]), lote.length, ...fila);
            aviso(e.message, 'error');
            repintarPaquete();
            break;
          }
        }
        const fila = nuevos.concat(malos).sort(function (a, b) { return a.pos - b.pos; }).map(function (x) { return x.it; });
        p.items.splice(p.items.indexOf(lote[0]), lote.length, ...fila);
        repintarPaquete();
      }
    } finally {
      p.leyendo = false;
      repintarPaquete();
    }
  }

  function vistaPaquete() {
    const p = E.paquete;
    if (!p) {
      return titulo('Subir paquete') +
        '<p class="m-texto-suave">Escoge la pipa del paquete. Todos los vales que subas ahora quedan en esa pipa y en ' + esc(nombreMes(E.mes)) + '.</p>' +
        '<div class="rejilla-pipas">' + UNIDADES.map(function (u) {
          const r = resumenUnidad(u.id);
          return '<button type="button" class="m-kpi-tarjeta pipa-boton" data-accion="paquete" data-u="' + u.id + '" title="Subir vales de ' + esc(u.nombre) + '"><span class="m-etiqueta">Pipa</span><span class="m-kpi-valor">' + esc(u.nombre) + '</span><span class="m-kpi-pie">' + r.vales + ' vale' + (r.vales === 1 ? '' : 's') + ' en el mes</span></button>';
        }).join('') + '</div>';
    }
    const u = UNI[p.unidad];
    const pend = p.items.filter(function (i) { return !i.guardado; }).length;
    const leyendo = p.items.filter(function (i) { return i.estado === 'cola' || i.estado === 'leyendo'; }).length;
    const conError = p.items.filter(function (i) { return i.estado === 'error' && !i.guardado; }).length;
    let html = titulo('Paquete de ' + u.nombre, '<button type="button" class="m-btn m-btn-secundario" data-accion="cerrar-paquete" title="Terminar este paquete y escoger otra pipa">Terminar paquete</button>');
    html += '<div class="m-tarjeta tarjeta-paquete"><p class="m-texto-suave">Escoge todas las fotos del paquete a la vez: se leen solas y se juntan el frente, el reverso y los tickets de cada vale. Las fotos no se guardan. Si algo quedó separado, usa «Unir con el anterior».</p>' +
      '<div class="erp-chips">' +
      '<label class="m-btn m-btn-primario" title="Escoger varias fotos de la galería o tomar fotos con la cámara"><input type="file" accept="image/*" multiple data-accion="fotos" class="sr">' + ico('mas') + 'Agregar fotos</label>' +
      '<label class="m-btn m-btn-secundario" title="Abrir la cámara para tomar una foto"><input type="file" accept="image/*" capture="environment" data-accion="fotos" class="sr">' + ico('paquete') + 'Tomar foto</label>' +
      '<button type="button" class="m-btn m-btn-secundario" data-accion="sin-foto" title="Capturar un vale escribiendo los datos, sin foto">Vale sin foto</button>' +
      (conError && !leyendo ? '<button type="button" class="m-btn m-btn-secundario" data-accion="releer-todas" title="Volver a leer las fotos que no se pudieron leer">Volver a leer ' + conError + '</button>' : '') +
      '</div>' + (p.items.length ? '<p class="m-texto-suave" aria-live="polite">' + p.items.length + ' en el paquete · ' + pend + ' por revisar' + (leyendo ? ' · leyendo ' + leyendo + '…' : '') + (p.quedan != null ? ' · te quedan ' + p.quedan + ' lecturas hoy' : '') + '</p>' : '') + '</div>';
    if (!p.items.length) return html + vacio('Paquete vacío', 'Agrega las fotos de los vales de ' + u.nombre + '.');
    html += '<ul class="lista-paquete">' + p.items.map(function (it, i) {
      const ocupado = it.estado === 'cola' || it.estado === 'leyendo';
      const dudas = it.lectura ? valeDeLectura(it.lectura, p.unidad).dudas.length : 0;
      let tit;
      if (it.guardado) tit = '<span class="m-estado aprobado">Guardado</span> No. ' + esc(it.numero || '—') + ' · ' + fmtQ(it.total);
      else if (it.estado === 'leyendo') tit = '<span class="m-estado en-proceso">Leyendo…</span> Vale ' + (i + 1);
      else if (it.estado === 'cola') tit = '<span class="m-estado en-proceso">En espera</span> Vale ' + (i + 1);
      else if (it.estado === 'error') tit = '<span class="m-estado error">No se leyó</span> Vale ' + (i + 1);
      else tit = '<span class="m-estado pendiente">Por revisar</span> ' + esc(resumenLectura(it.lectura) || 'Vale ' + (i + 1)) + (dudas ? ' <span class="m-texto-suave nota-chica">' + dudas + ' duda' + (dudas === 1 ? '' : 's') + '</span>' : '');
      return '<li class="m-tarjeta item-paquete' + (it.guardado ? ' guardado' : '') + (it.estado === 'error' && !it.guardado ? ' con-error' : '') + '">' +
        '<div class="miniaturas">' + (it.fotos.length ? it.fotos.map(function (f) { return '<img src="' + f.url + '" alt="Foto del vale" loading="lazy">'; }).join('') : '<span class="sin-foto">Sin foto</span>') + '</div>' +
        '<div class="item-info"><div class="item-titulo">' + tit + '</div>' +
        (it.error && !it.guardado ? '<p class="m-texto-suave nota-chica item-error">' + esc(it.error) + '</p>' : '') +
        '<div class="erp-chips">' +
        (ocupado ? '' : '<button type="button" class="m-btn ' + (it.guardado ? 'm-btn-secundario' : 'm-btn-primario') + ' m-btn-sm" data-accion="revisar" data-i="' + i + '" title="' + (it.guardado ? 'Abrir el vale guardado para corregirlo' : 'Abrir la vista previa de este vale') + '">' + (it.guardado ? 'Corregir' : 'Revisar y guardar') + '</button>') +
        (!ocupado && !it.guardado && it.fotos.length && (it.estado === 'error' || it.error) ? '<button type="button" class="m-btn m-btn-secundario m-btn-sm" data-accion="releer" data-i="' + i + '" title="Volver a mandar estas fotos a leer">Volver a leer</button>' : '') +
        (i > 0 && !it.guardado && !ocupado ? '<button type="button" class="m-btn m-btn-secundario m-btn-sm" data-accion="unir" data-i="' + i + '" title="Pasar estas fotos al vale de arriba (por ejemplo, el reverso)">Unir con el anterior</button>' : '') +
        (!it.guardado && !ocupado ? '<button type="button" class="m-btn m-btn-fantasma m-btn-sm" data-accion="quitar-item" data-i="' + i + '" title="Quitar esta foto del paquete sin guardar nada">Quitar</button>' : '') +
        '</div></div></li>';
    }).join('') + '</ul>';
    return html;
  }

  function vistaFacturas() {
    const b = E.buscaFact.trim().toLowerCase();
    const lista = E.facturas.filter(function (f) {
      if (!b) return true;
      return [f.factura, f.nit, f.proveedor, f.descripcion, fmtFecha(f.fecha)].join(' ').toLowerCase().indexOf(b) >= 0;
    });
    const soloLee = E.usuario.rol === 'lector';
    let html = titulo('Facturas', soloLee ? '' : '<button type="button" class="m-btn m-btn-primario" data-accion="nueva-factura" title="Agregar una factura de compra del mes">' + ico('mas') + 'Agregar factura</button>');
    html += '<p class="m-texto-suave">Van a la hoja «Hoja1» del Excel y a «facturas del mes» en FINAL.</p>';
    if (E.facturas.length > 10) html += '<div class="herramientas"><div class="buscar-local">' + ico('buscar') + '<input type="search" class="m-entrada" data-campo="buscaFact" value="' + esc(E.buscaFact) + '" placeholder="Buscar por factura, NIT, proveedor o descripción" aria-label="Buscar facturas"></div></div>';
    if (!lista.length) return html + (E.facturas.length ? vacio('Sin coincidencias', 'Ninguna factura coincide.') : vacio('Sin facturas', 'No hay facturas en ' + nombreMes(E.mes) + '.'));
    const todos = lista.every(function (f) { return E.marcadasFact.has(f.id); });
    const total = lista.reduce(function (a, f) { return a + (num(f.monto) || 0); }, 0);
    html += '<div class="m-tabla-envoltura tabla-adapta"><div class="m-tabla-titulo"><b>' + lista.length + ' factura' + (lista.length === 1 ? '' : 's') + '</b>' +
      (!soloLee && E.marcadasFact.size ? '<button type="button" class="m-btn m-btn-peligro m-btn-sm" data-accion="borrar-facturas" title="Borrar las facturas marcadas (pide confirmación)">' + ico('borrar') + 'Borrar marcadas</button>' : '<span>Hoja1</span>') +
      '</div><table class="m-tabla"><thead><tr>' + (soloLee ? '' : '<th class="col-casilla"><input type="checkbox" data-accion="marcar-fact-todas" aria-label="Marcar todas" title="Marcar o desmarcar todas las facturas que se ven"' + (todos ? ' checked' : '') + '></th>') +
      '<th>No.</th><th>Fecha</th><th>Factura</th><th>NIT</th><th>Proveedor</th><th>Descripción</th><th class="m-num">Monto</th><th class="col-accion"></th></tr></thead><tbody>' +
      lista.map(function (f, i) {
        return '<tr>' + (soloLee ? '' : '<td class="col-casilla"><input type="checkbox" data-accion="marcar-fact" data-id="' + esc(f.id) + '" aria-label="Marcar factura"' + (E.marcadasFact.has(f.id) ? ' checked' : '') + '></td>') +
          td('No.', String(i + 1), 'm-cifra') + td('Fecha', esc(fmtFecha(f.fecha)), 'm-cifra') + td('Factura', esc(f.factura || '—'), 'm-cifra') + td('NIT', esc(f.nit || '—'), 'm-cifra') +
          td('Proveedor', esc(f.proveedor || '—')) + td('Descripción', esc(f.descripcion || '—')) + td('Monto', fmtQ(f.monto), 'm-num') +
          '<td class="col-accion"><button type="button" class="m-icono-btn" data-accion="editar-factura" data-id="' + esc(f.id) + '" title="' + (soloLee ? 'Ver esta factura' : 'Corregir esta factura') + '" aria-label="Editar factura">' + ico(soloLee ? 'ojo' : 'lapiz') + '</button></td></tr>';
      }).join('') + '</tbody><tfoot><tr>' + (soloLee ? '' : '<td class="col-casilla"></td>') + '<td colspan="6" data-etq="">Total</td><td class="m-num" data-etq="Total">' + fmtQ(total) + '</td><td></td></tr></tfoot></table></div>';
    return html;
  }

  function vistaDatos() {
    if (!E.datos) {
      cargarDatos();
      return '<div class="m-cargando"><span class="m-logo" aria-hidden="true"></span><div class="m-cargando-linea"></div><span>Cargando los datos del mes…</span></div>';
    }
    const d = E.datos;
    const b = E.buscaDatos.trim().toLowerCase();
    const grupos = {};
    d.lista.forEach(function (x) {
      if (b && (x.etiqueta + ' ' + x.hoja + ' ' + x.celda).toLowerCase().indexOf(b) < 0) return;
      (grupos[x.hoja] = grupos[x.hoja] || []).push(x);
    });
    const soloLee = E.usuario.rol === 'lector';
    let html = titulo('Datos del mes', soloLee ? '' : '<button type="button" class="m-btn m-btn-primario" data-accion="guardar-datos" title="Guardar estos datos para ' + esc(nombreMes(E.mes)) + '">Guardar datos</button>');
    html += '<p class="m-texto-suave">Son los números que en el Excel se escriben a mano: saldo del banco, IGSS, ISR, precios por empresa, galones según encargado y demás. ' + esc(d.origen) + '</p>';
    html += '<div class="herramientas"><div class="buscar-local">' + ico('buscar') + '<input type="search" class="m-entrada" data-campo="buscaDatos" value="' + esc(E.buscaDatos) + '" placeholder="Buscar un dato por nombre, hoja o celda" aria-label="Buscar dato"></div></div>';
    const orden = ['FINAL', 'GASTOS', 'TS01', 'TS02', 'TS03', 'TS04', 'Rastra', 'TACOMA', 'Vales', 'Hoja1'];
    const hojas = Object.keys(grupos).sort(function (a, c) { return orden.indexOf(a) - orden.indexOf(c); });
    if (!hojas.length) return html + vacio('Sin coincidencias', 'Ningún dato coincide con la búsqueda.');
    hojas.forEach(function (h) {
      html += '<div class="m-tabla-envoltura"><div class="m-tabla-titulo"><b>Hoja ' + esc(h) + '</b><span>' + grupos[h].length + ' dato' + (grupos[h].length === 1 ? '' : 's') + '</span></div>' +
        '<table class="m-tabla tabla-datos"><thead><tr><th>Dato</th><th>Celda</th><th class="m-num">Valor</th></tr></thead><tbody>' +
        grupos[h].map(function (x) {
          const v = d.valores[x.clave];
          return '<tr>' + td('Dato', esc(x.etiqueta || 'Sin nombre')) + td('Celda', esc(x.celda), 'm-codigo-cuenta') +
            '<td class="m-num" data-etq="Valor"><input type="text" class="m-entrada m-num" inputmode="' + (x.texto ? 'text' : 'decimal') + '" data-dato="' + esc(x.clave) + '" value="' + esc(v == null ? '' : v) + '" aria-label="' + esc(x.etiqueta) + '"' + (soloLee ? ' readonly' : '') + '></td></tr>';
        }).join('') + '</tbody></table></div>';
    });
    return html;
  }

  async function plantillaActual() {
    if (E._plantilla) return E._plantilla;
    const p = await Datos.leerPlantilla();
    E._plantilla = p;
    return p;
  }

  async function cargarDatos() {
    if (E._cargandoDatos) return;
    E._cargandoDatos = true;
    try {
      const p = await plantillaActual();
      if (!p) {
        E.datos = { lista: [], valores: {}, origen: 'Falta subir la plantilla del Excel (Excel del mes).' };
      } else {
        const lista = await ExcelPipas.listarDatos(p.datos, JSZip);
        const propio = await Datos.leerMes(E.mes);
        let valores = {};
        let origen;
        if (propio && propio.datos) {
          valores = Object.assign({}, propio.datos);
          origen = 'Guardados para este mes.';
        } else {
          const ant = await Datos.mesAnteriorConDatos(E.mes);
          if (ant && ant.datos) { valores = Object.assign({}, ant.datos); origen = 'Vienen de ' + nombreMes(ant.mes) + '; revísalos y guarda.'; }
          else origen = 'Vienen de la plantilla de septiembre 2026; revísalos y guarda.';
        }
        lista.forEach(function (x) { if (!(x.clave in valores)) valores[x.clave] = x.valor; });
        E.datos = { lista: lista, valores: valores, origen: origen, propio: !!(propio && propio.datos) };
      }
    } catch (e) {
      aviso(e.message, 'error');
      E.datos = { lista: [], valores: {}, origen: 'No se pudieron cargar.' };
    }
    E._cargandoDatos = false;
    if (E.vista === 'datos') guardarScroll(pintar);
  }

  function vistaExcel() {
    const admin = E.usuario.rol === 'admin';
    const n = E.vales.length;
    const conFalta = E.vales.filter(function (v) { return faltantes(v).length; }).length;
    let html = titulo('Excel del mes');
    html += '<div class="m-tarjeta excel-caja m-con-marca"><div><div class="m-etiqueta">Descargar</div><h2 class="m-titulo-3">PIPAS ' + esc(mesCorto(E.mes)) + '.xlsx</h2></div>' +
      '<p class="m-texto-suave">Sale con las mismas hojas, columnas, fórmulas, formatos y anchos que «PIPAS Sep26», con ' + n + ' vale' + (n === 1 ? '' : 's') + ' y ' + E.facturas.length + ' factura' + (E.facturas.length === 1 ? '' : 's') + ' de ' + esc(nombreMes(E.mes)) + '.</p>' +
      (conFalta ? '<div class="m-franja">' + conFalta + ' vale' + (conFalta === 1 ? ' tiene' : 's tienen') + ' datos por completar. El Excel sale igual con lo que haya.</div>' : '') +
      '<div class="erp-chips"><button type="button" class="m-btn m-btn-salida" data-accion="descargar" title="Generar y descargar PIPAS ' + esc(mesCorto(E.mes)) + '.xlsx">' + ico('bajar') + 'Descargar Excel</button></div></div>';
    html += tablaResumen();
    html += '<div class="m-tarjeta excel-caja"><h2 class="m-seccion-titulo">Plantilla</h2><p class="m-texto-suave">' + (E._plantilla ? 'Usando «' + esc(E._plantilla.nombre) + '»' + (E._plantilla.fecha ? ', subida el ' + esc(fmtFecha(E._plantilla.fecha.slice(0, 10))) : '') + '.' : 'Revisando la plantilla…') + '</p>' +
      (admin ? '<div class="erp-chips"><label class="m-btn m-btn-secundario" title="Subir otro Excel como plantilla (debe tener las mismas hojas que PIPAS Sep26)"><input type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" data-accion="subir-plantilla" class="sr">Cambiar plantilla</label></div>' : '') + '</div>';
    if (!E._plantilla) plantillaActual().then(function () { if (E.vista === 'excel') guardarScroll(pintar); }).catch(function (e) { aviso(e.message, 'error'); });
    return html;
  }

  function vistaUsuarios() {
    if (!E._usuarios) {
      Datos.listarUsuarios().then(function (l) { E._usuarios = l; if (E.vista === 'usuarios') guardarScroll(pintar); }).catch(function (e) { aviso(e.message, 'error'); });
      return '<div class="m-cargando"><span class="m-logo" aria-hidden="true"></span><div class="m-cargando-linea"></div><span>Cargando usuarios…</span></div>';
    }
    return '<div class="erp-titulo-fila"><h1 class="erp-titulo">Usuarios</h1></div>' +
      '<p class="m-texto-suave">Las cuentas nuevas se crean en Supabase (Authentication › Users). Aquí se escoge qué puede hacer cada una.</p>' +
      '<div class="m-tabla-envoltura"><div class="tabla-desliza"><table class="m-tabla"><thead><tr><th>Usuario</th><th>Correo</th><th>Permiso</th></tr></thead><tbody>' +
      E._usuarios.map(function (u) {
        return '<tr>' + td('Usuario', '<span class="usuario-celda"><span class="m-avatar">' + esc(iniciales(u.nombre || u.correo)) + '</span><b>' + esc(u.nombre || u.correo) + '</b></span>') + td('Correo', esc(u.correo || '')) +
          '<td data-etq="Permiso"><select class="m-entrada" data-accion="rol" data-id="' + esc(u.id) + '"' + (u.id === E.usuario.id ? ' disabled title="No puedes cambiar tu propio permiso"' : ' title="Cambiar el permiso de este usuario"') + '>' +
          Object.keys(ROLES).map(function (k) { return '<option value="' + k + '"' + (u.rol === k ? ' selected' : '') + '>' + ROLES[k] + '</option>'; }).join('') + '</select></td></tr>';
      }).join('') + '</tbody></table></div></div>';
  }

  function abrirPerfil() {
    const T = window.MonterrosoTema;
    const temas = (T.GRUPOS || [['', T.COLORES]]).map(function (g) {
      return (g[0] ? '<h4 class="erp-tema-grupo">' + esc(g[0]) + '</h4>' : '') + '<div class="erp-temas">' + g[1].filter(function (k) { return T.COLORES.indexOf(k) >= 0; }).map(function (k) {
        const c = T.version(k, 'claro'), o = T.version(k, 'oscuro');
        const sw = function (v) { return '<span style="background:' + esc(v.bg) + '"><i style="background:' + esc(v.primary) + '"></i><i style="background:' + esc(v.accent) + '"></i></span>'; };
        return '<button type="button" class="erp-tema' + (T.actual() === k ? ' activo' : '') + '" data-tema="' + esc(k) + '" aria-pressed="' + (T.actual() === k) + '" title="Usar ' + esc(c.par) + '"><span class="erp-tema-par" title="Claro · Oscuro">' + sw(c) + sw(o) + '</span>' + esc(c.par) + '</button>';
      }).join('') + '</div>';
    }).join('');
    const capa = abrirCapa(
      '<div class="hoja-cabeza"><div class="erp-perfil-cab"><span class="m-avatar erp-perfil-av">' + esc(iniciales(E.usuario.nombre)) + '</span><div><h2 class="hoja-titulo">' + esc(E.usuario.nombre) + '</h2><span class="m-texto-suave">' + esc(E.usuario.correo || '') + ' · ' + esc(ROLES[E.usuario.rol] || '') + '</span></div></div>' +
      '<button type="button" class="m-icono-btn" data-p="cerrar" title="Cerrar" aria-label="Cerrar">' + ico('cerrar') + '</button></div>' +
      '<div class="hoja-cuerpo"><section class="erp-ficha-sec"><h3>Apariencia</h3>' +
      '<div class="erp-modo-sel" role="radiogroup" aria-label="Claro u oscuro">' + [['claro', 'Claro'], ['oscuro', 'Oscuro'], ['auto', 'Automático']].map(function (m) { return '<button type="button" role="radio" data-modo-pref="' + m[0] + '" aria-checked="' + (T.modo() === m[0]) + '" title="Usar el modo ' + m[1].toLowerCase() + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<p class="m-texto-suave erp-modo-nota">Cada color tiene su versión clara y oscura. «Automático» sigue a tu equipo. Se guarda en tu usuario y te sigue a cualquier teléfono o computadora.</p>' +
      temas +
      '<h4 class="erp-tema-grupo">Tamaño de la letra</h4><div class="erp-modo-sel erp-letra-sel" role="radiogroup" aria-label="Tamaño de la letra">' + Object.keys(T.LETRAS).map(function (k) { return '<button type="button" role="radio" data-letra-pref="' + k + '" aria-checked="' + (T.letraActual() === k) + '" title="Letra ' + T.LETRAS[k].toLowerCase() + '">' + T.LETRAS[k] + '</button>'; }).join('') + '</div>' +
      '<p class="m-texto-suave erp-modo-nota">Solo en la pantalla: el Excel sale siempre con su formato.</p></section></div>' +
      '<div class="hoja-pie">' + (Datos.modo === 'local' ? '<span></span>' : '<button type="button" class="m-btn m-btn-fantasma m-btn-sm" data-accion-p="salir" title="Cerrar tu sesión en este equipo">Cerrar sesión</button>') + '<button type="button" class="m-btn m-btn-secundario m-btn-sm" data-p="cerrar" title="Cerrar">Cerrar</button></div>', 'capa-perfil');
    capa.addEventListener('click', async function (ev) {
      if (ev.target.classList.contains('capa-fondo') || ev.target.closest('[data-p="cerrar"]')) { if (T.vistaPrevia) T.vistaPrevia(null); cerrarCapa(capa); return; }
      const t = ev.target.closest('.erp-tema[data-tema]');
      if (t) {
        if (T.vistaPrevia) T.vistaPrevia(null);
        T.aplicar(t.dataset.tema);
        capa.querySelectorAll('.erp-tema[data-tema]').forEach(function (x) { const on = x === t; x.classList.toggle('activo', on); x.setAttribute('aria-pressed', String(on)); });
        return;
      }
      const m = ev.target.closest('[data-modo-pref]');
      if (m) {
        T.aplicar(T.actual(), m.dataset.modoPref);
        capa.querySelectorAll('[data-modo-pref]').forEach(function (x) { x.setAttribute('aria-checked', String(x === m)); });
        return;
      }
      const l = ev.target.closest('[data-letra-pref]');
      if (l) {
        T.letra(l.dataset.letraPref);
        capa.querySelectorAll('[data-letra-pref]').forEach(function (x) { x.setAttribute('aria-checked', String(x === l)); });
        return;
      }
      if (ev.target.closest('[data-accion-p="salir"]')) { cerrarCapa(capa); await Datos.salir(); E.usuario = null; pintar(); }
    });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      capa.addEventListener('mouseover', function (ev) { const t = ev.target.closest('.erp-tema[data-tema]'); if (t && T.vistaPrevia) T.vistaPrevia(t.dataset.tema); });
      capa.addEventListener('mouseout', function (ev) { const t = ev.target.closest('.erp-tema[data-tema]'); if (t && T.vistaPrevia && !t.contains(ev.relatedTarget)) T.vistaPrevia(null); });
    }
  }

  function nuevoRenglon(concepto, unidad) {
    return normalizarRenglon({ concepto: concepto, monto: null, detalle: '', destino: '', cargo: null, mes_anterior: false, viajes: null, factura: null }, unidad);
  }

  function abrirEditor(vale, extra) {
    const v = JSON.parse(JSON.stringify(vale));
    v.renglones = (v.renglones || []).map(function (r) { return Object.assign({}, r); });
    E.editor = Object.assign({ vale: v, fotos: [], fotoActual: 0, zoom: 1, giro: 0, texto: '', item: null, itemObj: null, dudas: [], leyendo: false, original: JSON.stringify(v) }, extra || {});
    const capa = abrirCapa('<div class="editor" id="editor"></div>', 'capa-editor');
    E.editor.capa = capa;
    pintarEditor();
    capa.addEventListener('click', clicEditor);
    capa.addEventListener('input', escribirEditor);
    capa.addEventListener('change', cambiarEditor);
  }

  function campo(etiqueta, nombre, valor, o) {
    o = o || {};
    const ro = E.usuario.rol === 'lector' ? ' readonly' : '';
    return '<label class="erp-campo"><span>' + esc(etiqueta) + '</span>' +
      '<input class="m-entrada' + (o.cifra ? ' m-cifra' : '') + '" type="' + (o.tipo || 'text') + '"' + (o.modo ? ' inputmode="' + o.modo + '"' : '') + ' data-e="' + esc(nombre) + '" value="' + esc(valor == null ? '' : valor) + '"' + (o.lista ? ' list="' + o.lista + '"' : '') + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + ro + ' autocomplete="off"></label>';
  }

  function pintarEditor() {
    const ed = E.editor;
    if (!ed) return;
    const v = ed.vale;
    const u = UNI[v.unidad] || UNIDADES[0];
    const soloLee = E.usuario.rol === 'lector';
    const caja = ed.capa.querySelector('#editor');
    const desplazado = caja.querySelector('.editor-form') ? caja.querySelector('.editor-form').scrollTop : 0;
    const suma = v.renglones.reduce(function (a, r) { return a + (num(r.monto) || 0); }, 0);
    const f = faltantes(v);
    const pilotos = Array.from(new Set(E.vales.map(function (x) { return x.piloto; }).filter(Boolean)));
    let fotos = '';
    if (ed.fotos.length) {
      const actual = ed.fotos[ed.fotoActual] || ed.fotos[0];
      fotos = '<div class="visor"><div class="visor-marco"><img src="' + actual.url + '" alt="Foto del vale" style="transform: rotate(' + ed.giro + 'deg) scale(' + ed.zoom + ')"></div>' +
        '<div class="visor-botones">' +
        (ed.fotos.length > 1 ? '<div class="erp-chips" role="group" aria-label="Fotos del vale">' + ed.fotos.map(function (x, i) { return '<button type="button" class="m-chip" data-ed="foto" data-i="' + i + '" aria-pressed="' + (i === ed.fotoActual) + '" title="Ver la foto ' + (i + 1) + ' de este vale">Foto ' + (i + 1) + '</button>'; }).join('') + '</div>' : '') +
        '<button type="button" class="m-icono-btn" data-ed="zoom" data-d="-1" title="Alejar la foto" aria-label="Alejar">' + ico('alejar') + '</button>' +
        '<button type="button" class="m-icono-btn" data-ed="zoom" data-d="1" title="Acercar la foto" aria-label="Acercar">' + ico('acercar') + '</button>' +
        '<button type="button" class="m-icono-btn" data-ed="girar" title="Girar la foto un cuarto de vuelta" aria-label="Girar">' + ico('girar') + '</button>' +
        (soloLee ? '' : '<label class="m-btn m-btn-secundario m-btn-sm" title="Agregar otra foto a este vale, por ejemplo el reverso"><input type="file" accept="image/*" multiple data-ed="mas-fotos" class="sr">Otra foto</label>') +
        (soloLee ? '' : '<button type="button" class="m-btn m-btn-secundario m-btn-sm" data-ed="ia"' + (ed.leyendo ? ' disabled' : '') + ' title="Mandar las fotos de este vale a leer y llenar lo que esté vacío">' + (ed.leyendo ? 'Leyendo…' : 'Leer las fotos') + '</button>') +
        '</div></div>';
    } else if (!soloLee) {
      fotos = '<div class="visor visor-vacio"><p class="m-texto-suave">Este vale no tiene foto en pantalla (las fotos no se guardan).</p><label class="m-btn m-btn-secundario m-btn-sm" title="Poner una foto para leer el vale"><input type="file" accept="image/*" multiple data-ed="mas-fotos" class="sr">Poner foto</label></div>';
    }
    let html = '<div class="hoja-cabeza"><div><div class="m-etiqueta">' + esc(u.nombre) + ' · ' + esc(nombreMes(E.mes)) + '</div><h2 class="hoja-titulo">' + (v.id ? (soloLee ? 'Vale No. ' + esc(v.numero || '—') : 'Corregir vale No. ' + esc(v.numero || '—')) : 'Vista previa del vale') + '</h2></div>' +
      '<button type="button" class="m-icono-btn" data-ed="cerrar" title="Cerrar sin guardar" aria-label="Cerrar">' + ico('cerrar') + '</button></div>' +
      '<div class="editor-cuerpo">' + fotos + '<div class="editor-form">';
    if (!soloLee) {
      if (ed.dudas && ed.dudas.length) html += '<div class="m-franja franja-dudas"><strong>Revisa:</strong> ' + ed.dudas.map(esc).join(' · ') + '</div>';
      html += '<details class="texto-vale"' + (ed.texto ? ' open' : '') + '><summary>Pegar texto a mano (si hace falta)</summary>' +
        '<textarea class="m-entrada" data-e="texto" rows="4" placeholder="Pega aquí el texto copiado de la foto">' + esc(ed.texto) + '</textarea>' +
        '<button type="button" class="m-btn m-btn-secundario m-btn-sm" data-ed="leer" title="Repartir el texto pegado en los campos vacíos">Llenar con este texto</button></details>';
    }
    html += '<section class="erp-ficha-sec"><h3>Datos del vale</h3><div class="rejilla-campos">' +
      campo('No. de vale', 'numero', v.numero, { modo: 'numeric', cifra: true }) +
      campo('Fecha', 'fecha', v.fecha, { tipo: 'date' }) +
      '<label class="erp-campo"><span>Pipa</span><select class="m-entrada" data-e="unidad"' + (soloLee ? ' disabled' : '') + '>' + UNIDADES.map(function (x) { return '<option value="' + x.id + '"' + (x.id === v.unidad ? ' selected' : '') + '>' + esc(x.nombre) + '</option>'; }).join('') + '</select></label>' +
      campo('Total del vale (Por Q.)', 'total', v.total, { modo: 'decimal', cifra: true }) +
      campo('Piloto', 'piloto', v.piloto, { lista: 'listaPilotos' }) +
      campo('Placa', 'placa', v.placa) +
      '</div><datalist id="listaPilotos">' + pilotos.map(function (p) { return '<option value="' + esc(p) + '">'; }).join('') + '</datalist></section>';
    html += '<section class="erp-ficha-sec"><h3>Renglones</h3><p class="m-texto-suave nota-chica">El vale trae impreso GRASAS, ACEITES y demás, pero muchas veces lo tachan y escriben otra cosa. Escoge lo que de verdad dice.</p>';
    html += v.renglones.map(function (r, i) { return renglonHtml(r, i, u, soloLee); }).join('');
    if (!soloLee) {
      html += '<div class="erp-chips agregar-renglon">' + CONCEPTOS.filter(function (c) { return u.tipo !== 'tacoma' || c.id === 'diesel'; }).map(function (c) {
        return '<button type="button" class="m-chip-accion" data-ed="agregar" data-c="' + c.id + '" title="Agregar un renglón de ' + esc(c.nombre.toLowerCase()) + '">+ ' + esc(c.nombre) + '</button>';
      }).join('') + '</div>';
    }
    html += '</section>';
    const cuadra = num(v.total) == null || !v.renglones.length || Math.abs(suma - num(v.total)) < 0.01;
    html += '<div class="cuadre' + (cuadra ? '' : ' no-cuadra') + '">' + cuadreHtml(suma, v.total, cuadra) + '</div>';
    html += '<label class="erp-campo"><span>Notas</span><textarea class="m-entrada" data-e="notas" rows="2"' + (soloLee ? ' readonly' : '') + '>' + esc(v.notas || '') + '</textarea></label>';
    html += '<div class="m-franja" id="faltaEditor"' + (f.length ? '' : ' hidden') + '>' + (f.length ? 'Falta: ' + esc(f.join(', ')) + '. Se puede guardar igual.' : '') + '</div>';
    html += '</div></div>';
    if (!soloLee) {
      const conSiguiente = idxEditor(ed) >= 0 && siguientePendiente(idxEditor(ed)) >= 0;
      html += '<div class="hoja-pie">' +
        (v.id ? '<button type="button" class="m-btn m-btn-fantasma m-btn-sm boton-borrar" data-ed="borrar" title="Borrar este vale (pide confirmación)">' + ico('borrar') + 'Borrar</button>' : '<span></span>') +
        '<div class="erp-chips">' +
        '<button type="button" class="m-btn m-btn-secundario" data-ed="cerrar" title="Cerrar sin guardar">Cancelar</button>' +
        (conSiguiente ? '<button type="button" class="m-btn m-btn-secundario" data-ed="guardar" title="Guardar este vale en ' + esc(nombreMes(E.mes)) + '">Guardar</button><button type="button" class="m-btn m-btn-primario" data-ed="guardar" data-sig="1" title="Guardar este vale y abrir el siguiente del paquete">Guardar y siguiente</button>' : '<button type="button" class="m-btn m-btn-primario" data-ed="guardar" title="Guardar este vale en ' + esc(nombreMes(E.mes)) + '">Guardar</button>') +
        '</div></div>';
    }
    caja.innerHTML = html;
    const form = caja.querySelector('.editor-form');
    if (form) form.scrollTop = desplazado;
  }

  function cuadreHtml(suma, total, cuadra) {
    return '<span>Suma de renglones <strong class="m-cifra">' + fmtQ(suma) + '</strong></span><span>Total del vale <strong class="m-cifra">' + fmtQ(total) + '</strong></span>' +
      (cuadra ? '<span class="m-estado aprobado">Cuadra</span>' : '<span class="m-estado pendiente">No cuadra por ' + fmtQ(Math.abs(suma - (num(total) || 0))) + '</span>');
  }

  function renglonHtml(r, i, u, soloLee) {
    const c = CON[r.concepto] || CON.otro;
    const ro = soloLee ? ' readonly' : '';
    const dis = soloLee ? ' disabled' : '';
    const ic = function (etq, campo2, valor, modo, ph) {
      return '<label class="erp-campo"><span>' + esc(etq) + '</span><input class="m-entrada' + (modo === 'decimal' ? ' m-cifra' : '') + '" type="text"' + (modo ? ' inputmode="' + modo + '"' : '') + ' data-r="' + i + '" data-rc="' + campo2 + '" value="' + esc(valor == null ? '' : valor) + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ro + ' autocomplete="off"></label>';
    };
    let h = '<div class="renglon"><div class="renglon-cabeza">' +
      '<select class="m-entrada" data-r="' + i + '" data-rc="concepto"' + dis + ' aria-label="Concepto">' +
      CONCEPTOS.filter(function (x) { return u.tipo !== 'tacoma' || x.id === 'diesel'; }).map(function (x) { return '<option value="' + x.id + '"' + (x.id === r.concepto ? ' selected' : '') + '>' + esc(x.nombre) + '</option>'; }).join('') +
      '</select>' +
      (soloLee ? '' : '<button type="button" class="m-icono-btn" data-ed="quitar" data-i="' + i + '" title="Quitar este renglón" aria-label="Quitar renglón">' + ico('cerrar') + '</button>') +
      '</div><div class="rejilla-campos">';
    if (c.tipo === 'combustible') {
      h += ic('Galones cargados', 'galones', r.galones, 'decimal', '54.37') + ic('Monto', 'monto', r.monto, 'decimal');
      if (u.tipo === 'pipa' || u.tipo === 'tag') h += ic('Galones transportados', 'gal_trans', r.gal_trans, 'decimal', '7000');
      if (u.tipo === 'pipa') {
        h += '<label class="erp-campo"><span>Cargó en</span><select class="m-entrada" data-r="' + i + '" data-rc="cargo"' + dis + '><option value="">Sin dato</option>' + CARGOS.map(function (x) { return '<option value="' + x.id + '"' + (r.cargo === x.id ? ' selected' : '') + '>' + esc(x.nombre) + '</option>'; }).join('') + '</select></label>';
      }
      if (u.tipo === 'rastra') {
        const vj = r.viajes || {};
        const clave = Object.keys(vj)[0] || '';
        h += '<label class="erp-campo"><span>Tipo de viaje</span><select class="m-entrada" data-r="' + i + '" data-rc="viaje_tipo"' + dis + '><option value="">Sin dato</option>' + ExcelPipas.VIAJES_RASTRA.map(function (x) { return '<option value="' + x.clave + '"' + (clave === x.clave ? ' selected' : '') + '>' + esc(x.nombre) + '</option>'; }).join('') + '</select></label>' +
          ic(clave === 'fert250' ? 'Quintales' : 'Viajes', 'viaje_cant', clave ? vj[clave] : '', 'decimal', '1');
      }
      if (u.tipo !== 'tacoma') h += ic('Recorrido o destino', 'destino', r.destino, null, 'Reu, Acapán, Champerico');
    } else if (c.tipo === 'viatico') {
      h += ic('Monto', 'monto', r.monto, 'decimal');
    } else {
      h += ic('Monto', 'monto', r.monto, 'decimal') + ic('Detalle', 'detalle', r.detalle, null, c.id === 'sueldo' ? 'Pago de quincena del 1 al 15' : '');
    }
    h += ic('Fecha (si es otra)', 'fecha', r.fecha, null, 'aaaa-mm-dd');
    h += '</div>';
    if (c.tipo === 'combustible' && u.tipo === 'pipa') {
      h += '<label class="casilla" title="Marcar si este viaje se cobró el mes anterior: no suma a Puma, Santander ni Camo"><input type="checkbox" data-r="' + i + '" data-rc="mes_anterior"' + (r.mes_anterior ? ' checked' : '') + dis + '><span>Viene del mes anterior (no se cobra este mes)</span></label>';
    }
    if (c.tipo === 'gasto') {
      const fa = r.factura || {};
      const tiene = !!(fa.serie || fa.nit || fa.proveedor || fa.monto);
      h += '<details class="factura-renglon"' + (tiene ? ' open' : '') + '><summary>Tiene factura</summary><div class="rejilla-campos">' +
        ic('Fecha de factura', 'f_fecha', fa.fecha, null, 'aaaa-mm-dd') + ic('Serie y número', 'f_serie', fa.serie) + ic('NIT', 'f_nit', fa.nit, 'numeric') + ic('Proveedor', 'f_proveedor', fa.proveedor) + ic('Monto de factura', 'f_monto', fa.monto, 'decimal') +
        '</div></details>';
    }
    return h + '</div>';
  }

  function idxEditor(ed) {
    if (!ed || !E.paquete || !ed.itemObj) return -1;
    return E.paquete.items.indexOf(ed.itemObj);
  }

  function siguientePendiente(desde) {
    if (!E.paquete) return -1;
    const libre = function (it) { return !it.guardado && it.estado !== 'cola' && it.estado !== 'leyendo'; };
    for (let i = desde + 1; i < E.paquete.items.length; i++) if (libre(E.paquete.items[i])) return i;
    for (let i = 0; i < desde; i++) if (libre(E.paquete.items[i])) return i;
    return -1;
  }

  function escribirEditor(ev) {
    const ed = E.editor;
    if (!ed) return;
    const t = ev.target;
    const v = ed.vale;
    if (t.dataset.e) {
      if (t.dataset.e === 'texto') { ed.texto = t.value; return; }
      if (t.dataset.e === 'unidad') return;
      v[t.dataset.e] = t.value;
      if (t.dataset.e === 'total') refrescarCuadre();
      else refrescarFaltantes();
      return;
    }
    if (t.dataset.r != null && t.tagName !== 'SELECT' && t.type !== 'checkbox') {
      const r = v.renglones[+t.dataset.r];
      const c = t.dataset.rc;
      if (c.indexOf('f_') === 0) {
        r.factura = Object.assign({}, r.factura || {});
        r.factura[c.slice(2)] = t.value;
      } else if (c === 'viaje_cant') {
        const clave = Object.keys(r.viajes || {})[0];
        if (clave) { r.viajes = {}; r.viajes[clave] = t.value; }
        else r._cant = t.value;
      } else {
        r[c] = t.value;
      }
      if (c === 'monto') refrescarCuadre();
      else refrescarFaltantes();
    }
  }

  function refrescarCuadre() {
    const ed = E.editor;
    const caja = ed.capa.querySelector('.cuadre');
    if (!caja) return;
    const v = ed.vale;
    const suma = v.renglones.reduce(function (a, r) { return a + (num(r.monto) || 0); }, 0);
    const cuadra = num(v.total) == null || !v.renglones.length || Math.abs(suma - num(v.total)) < 0.01;
    caja.className = 'cuadre' + (cuadra ? '' : ' no-cuadra');
    caja.innerHTML = cuadreHtml(suma, v.total, cuadra);
    refrescarFaltantes();
  }

  function refrescarFaltantes() {
    const ed = E.editor;
    const nota = ed && ed.capa.querySelector('#faltaEditor');
    if (!nota) return;
    const f = faltantes(ed.vale);
    nota.hidden = !f.length;
    nota.textContent = f.length ? 'Falta: ' + f.join(', ') + '. Se puede guardar igual.' : '';
  }

  function cambiarEditor(ev) {
    const ed = E.editor;
    if (!ed) return;
    const t = ev.target;
    const v = ed.vale;
    if (t.dataset.ed === 'mas-fotos') {
      agregarFotosEditor(t.files);
      t.value = '';
      return;
    }
    if (t.dataset.e === 'unidad') {
      v.unidad = t.value;
      v.renglones = v.renglones.map(function (r) { return normalizarRenglon(r, v.unidad); });
      pintarEditor();
      return;
    }
    if (t.dataset.r != null && (t.tagName === 'SELECT' || t.type === 'checkbox')) {
      const i = +t.dataset.r;
      const r = v.renglones[i];
      const c = t.dataset.rc;
      if (c === 'concepto') {
        const antes = CON[r.concepto];
        r.concepto = t.value;
        if (antes && antes.detalle && r.detalle === antes.detalle) r.detalle = '';
        v.renglones[i] = normalizarRenglon(r, v.unidad);
        pintarEditor();
      } else if (c === 'mes_anterior') {
        r.mes_anterior = t.checked;
      } else if (c === 'viaje_tipo') {
        const cant = r.viajes ? r.viajes[Object.keys(r.viajes)[0]] : (r._cant || 1);
        r.viajes = t.value ? {} : null;
        if (t.value) r.viajes[t.value] = cant || 1;
        pintarEditor();
      } else {
        r[c] = t.value || null;
        refrescarFaltantes();
      }
    }
  }

  function agregarFotosEditor(files) {
    const ed = E.editor;
    Array.from(files || []).forEach(function (f) { ed.fotos.push({ url: URL.createObjectURL(f), nombre: f.name, archivo: f }); });
    if (idxEditor(ed) >= 0) ed.itemObj.fotos = ed.fotos.slice();
    ed.fotoActual = ed.fotos.length - 1;
    ed.zoom = 1;
    ed.giro = 0;
    pintarEditor();
  }

  async function clicEditor(ev) {
    const ed = E.editor;
    if (!ed) return;
    if (ev.target.classList.contains('capa-fondo')) return;
    const b = ev.target.closest('[data-ed]');
    if (!b || b.tagName === 'INPUT') return;
    const v = ed.vale;
    const a = b.dataset.ed;
    if (a === 'cerrar') { await cerrarEditor(); return; }
    if (a === 'foto') { ed.fotoActual = +b.dataset.i; ed.zoom = 1; ed.giro = 0; pintarEditor(); return; }
    if (a === 'zoom') { ed.zoom = Math.min(4, Math.max(1, ed.zoom + (+b.dataset.d) * 0.5)); pintarEditor(); return; }
    if (a === 'girar') { ed.giro = (ed.giro + 90) % 360; pintarEditor(); return; }
    if (a === 'agregar') { v.renglones.push(nuevoRenglon(b.dataset.c, v.unidad)); pintarEditor(); return; }
    if (a === 'quitar') { v.renglones.splice(+b.dataset.i, 1); pintarEditor(); return; }
    if (a === 'leer') { aplicarTexto(); return; }
    if (a === 'ia') { await leerEnEditor(); return; }
    if (a === 'borrar') {
      const ok = await preguntar({ titulo: 'Borrar el vale No. ' + (v.numero || 'sin número'), texto: 'Se borra de ' + nombreMes(E.mes) + ' con todos sus renglones. No se puede deshacer.', si: 'Borrar', peligro: true, siAyuda: 'Borrar este vale para siempre' });
      if (!ok) return;
      try {
        await Datos.borrarVales([v.id]);
        E.vales = E.vales.filter(function (x) { return x.id !== v.id; });
        E.marcados.delete(v.id);
        cerrarCapa(ed.capa);
        E.editor = null;
        aviso('Vale borrado.');
        guardarScroll(pintar);
      } catch (e) { aviso(e.message, 'error'); }
      return;
    }
    if (a === 'guardar') { await guardarEditor(b.dataset.sig === '1'); }
  }

  async function leerEnEditor() {
    const ed = E.editor;
    if (!ed || ed.leyendo || !ed.fotos.length) return;
    const v = ed.vale;
    const fotos = ed.fotos.slice(0, LOTE);
    ed.leyendo = true;
    pintarEditor();
    try {
      const prep = [];
      for (const f of fotos) prep.push(await prepararFoto(f));
      const r = await Datos.leerFotos({ fotos: prep, unidad: v.unidad, pilotos: pilotosConocidos(), anterior: '' });
      if (E.editor !== ed) return;
      const d = (r.documentos || []).reduce(function (a, b) { return unirLecturas(a, b); }, null);
      const x = valeDeLectura(d, v.unidad);
      const llenos = [];
      ['numero', 'fecha', 'total', 'piloto', 'placa'].forEach(function (k) {
        if (x[k] != null && x[k] !== '' && (v[k] == null || v[k] === '')) { v[k] = x[k]; llenos.push(k === 'numero' ? 'número' : k); }
      });
      const vacios = !v.renglones.some(function (y) { return num(y.monto) != null; });
      if (vacios && x.renglones.length) { v.renglones = x.renglones; llenos.push(x.renglones.length + ' renglón' + (x.renglones.length === 1 ? '' : 'es')); }
      else {
        let nuevos = 0;
        x.renglones.forEach(function (y) {
          if (!v.renglones.some(function (z) { return z.concepto === y.concepto && num(z.monto) === num(y.monto); })) { v.renglones.push(y); nuevos++; }
        });
        if (nuevos) llenos.push(nuevos + ' renglón' + (nuevos === 1 ? '' : 'es'));
      }
      ed.dudas = x.dudas;
      if (ed.itemObj) ed.itemObj.lectura = d;
      aviso(llenos.length ? 'Se llenó: ' + llenos.join(', ') + '. Revísalo antes de guardar.' : 'La lectura no trajo nada nuevo para los campos vacíos.', llenos.length ? 'ok' : 'alerta');
    } catch (e) {
      aviso(e.message, 'error');
    } finally {
      ed.leyendo = false;
      if (E.editor === ed) pintarEditor();
    }
  }

  function aplicarTexto() {
    const ed = E.editor;
    const v = ed.vale;
    const pilotos = Array.from(new Set(E.vales.map(function (x) { return x.piloto; }).filter(Boolean)));
    const r = LectorVale.leer(ed.texto, { pilotos: pilotos });
    const llenos = [];
    ['numero', 'fecha', 'total', 'piloto', 'placa'].forEach(function (k) {
      if (r[k] != null && (v[k] == null || v[k] === '')) { v[k] = r[k]; llenos.push(k === 'numero' ? 'número' : k); }
    });
    if (r.unidad && r.unidad !== v.unidad) aviso('El texto dice ' + (UNI[r.unidad] ? UNI[r.unidad].nombre : r.unidad) + ', pero el vale está en ' + UNI[v.unidad].nombre + '. Revisa la pipa.', 'alerta');
    let nuevos = 0;
    r.renglones.forEach(function (x) {
      const ya = v.renglones.find(function (y) { return y.concepto === x.concepto && (num(y.monto) === num(x.monto) || num(y.monto) == null); });
      if (ya) {
        if (num(ya.monto) == null && x.monto != null) ya.monto = x.monto;
        if (x.galones != null && num(ya.galones) == null) ya.galones = x.galones;
        if (x.detalle && !ya.detalle) ya.detalle = x.detalle;
        return;
      }
      v.renglones.push(normalizarRenglon(Object.assign(nuevoRenglon(x.concepto, v.unidad), x), v.unidad));
      nuevos++;
    });
    if (r.cargo || r.gal_trans != null || r.destino) {
      const comb = v.renglones.find(function (y) { return tipoDe(y) === 'combustible'; });
      if (comb) {
        if (r.cargo && !comb.cargo && UNI[v.unidad].tipo === 'pipa') { comb.cargo = r.cargo; llenos.push('dónde cargó'); }
        if (r.gal_trans != null && num(comb.gal_trans) == null && UNI[v.unidad].tipo !== 'tacoma' && UNI[v.unidad].tipo !== 'rastra') { comb.gal_trans = r.gal_trans; llenos.push('galones transportados'); }
        if (r.destino && !comb.destino) { comb.destino = r.destino; llenos.push('recorrido'); }
      }
    }
    if (nuevos) llenos.push(nuevos + ' renglón' + (nuevos === 1 ? '' : 'es'));
    aviso(llenos.length ? 'Se llenó: ' + llenos.join(', ') + '. Revísalo antes de guardar.' : 'No encontré datos nuevos en el texto. Puedes escribirlos a mano.', llenos.length ? 'ok' : 'alerta');
    pintarEditor();
  }

  async function cerrarEditor() {
    const ed = E.editor;
    if (!ed) return;
    if (E.usuario.rol !== 'lector' && JSON.stringify(ed.vale) !== ed.original) {
      const ok = await preguntar({ titulo: 'Cerrar sin guardar', texto: 'Hay cambios en este vale que no se han guardado.', si: 'Cerrar sin guardar', no: 'Seguir editando', peligro: true });
      if (!ok) return;
    }
    cerrarCapa(ed.capa);
    E.editor = null;
  }

  async function guardarEditor(siguiente) {
    const ed = E.editor;
    const v = ed.vale;
    v.mes = E.mes;
    v.total = num(v.total);
    v.renglones = v.renglones.map(function (r) {
      const x = normalizarRenglon(r, v.unidad);
      delete x._cant;
      ['monto', 'galones', 'gal_trans'].forEach(function (k) { x[k] = num(x[k]); });
      if (x.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(x.fecha)) x.fecha = null;
      if (x.viajes) Object.keys(x.viajes).forEach(function (k) { x.viajes[k] = num(x.viajes[k]); });
      if (x.factura) {
        const fa = x.factura;
        if (!(fa.serie || fa.nit || fa.proveedor || fa.monto)) x.factura = null;
        else { fa.monto = num(fa.monto); if (fa.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fa.fecha)) fa.fecha = null; }
      }
      return x;
    });
    const repetido = v.numero && E.vales.find(function (x) { return x.id !== v.id && x.numero && String(x.numero) === String(v.numero) && x.unidad === v.unidad; });
    if (repetido) {
      const ok = await preguntar({ titulo: 'Vale repetido', texto: 'Ya hay un vale No. ' + v.numero + ' de ' + UNI[v.unidad].nombre + ' en ' + nombreMes(E.mes) + ' (' + fmtQ(repetido.total) + '). ¿Guardar este también?', si: 'Guardar los dos', no: 'Revisar' });
      if (!ok) return;
    }
    const botones = ed.capa.querySelectorAll('[data-ed="guardar"]');
    botones.forEach(function (x) { x.disabled = true; });
    try {
      const id = await Datos.guardarVale(v);
      v.id = id;
      E.vales = await Datos.listarVales(E.mes);
      const f = faltantes(v);
      aviso('Vale No. ' + (v.numero || 'sin número') + ' guardado' + (f.length ? '. Falta: ' + f.join(', ') : '.'), f.length ? 'alerta' : 'ok');
      const item = idxEditor(ed);
      if (item >= 0) {
        Object.assign(E.paquete.items[item], { guardado: true, id: id, numero: v.numero, total: v.total });
      }
      cerrarCapa(ed.capa);
      E.editor = null;
      guardarScroll(pintar);
      if (siguiente && item >= 0) {
        const s = siguientePendiente(item);
        if (s >= 0) setTimeout(function () { revisarItem(s); }, 200);
      }
    } catch (e) {
      aviso(e.message, 'error');
      botones.forEach(function (x) { x.disabled = false; });
    }
  }

  function revisarItem(i) {
    const it = E.paquete.items[i];
    if (it.estado === 'cola' || it.estado === 'leyendo') return;
    if (it.guardado) {
      const v = E.vales.find(function (x) { return x.id === it.id; });
      if (v) abrirEditor(v, { fotos: it.fotos.slice(), item: i, itemObj: it });
      return;
    }
    const u = E.paquete.unidad;
    const previo = E.vales.filter(function (x) { return x.unidad === u && x.piloto; }).slice(-1)[0];
    const base = {
      mes: E.mes, unidad: u, numero: '', fecha: '', total: null,
      piloto: previo ? previo.piloto : '', placa: previo ? previo.placa : '', notas: '',
      renglones: u === 'TACOMA' ? [nuevoRenglon('diesel', u)] : []
    };
    const x = valeDeLectura(it.lectura, u);
    ['numero', 'fecha', 'total', 'piloto', 'placa'].forEach(function (k) { if (x[k] != null && x[k] !== '') base[k] = x[k]; });
    if (x.renglones.length) base.renglones = x.renglones;
    abrirEditor(base, { fotos: it.fotos.slice(), item: i, itemObj: it, dudas: x.dudas });
  }

  function editarFactura(f) {
    const soloLee = E.usuario.rol === 'lector';
    const x = Object.assign({ mes: E.mes, fecha: '', factura: '', nit: '', proveedor: '', monto: null, descripcion: '', orden: E.facturas.length }, f || {});
    const ro = soloLee ? ' readonly' : '';
    const c = function (etq, k, modo, tipo) { return '<label class="erp-campo"><span>' + esc(etq) + '</span><input class="m-entrada' + (modo === 'decimal' ? ' m-cifra' : '') + '" type="' + (tipo || 'text') + '"' + (modo ? ' inputmode="' + modo + '"' : '') + ' name="' + k + '" value="' + esc(x[k] == null ? '' : x[k]) + '"' + ro + ' autocomplete="off"></label>'; };
    const capa = abrirCapa('<form class="form-factura"><div class="hoja-cabeza"><h2 class="hoja-titulo">' + (f ? 'Factura' : 'Nueva factura') + '</h2><button type="button" class="m-icono-btn" data-f="cerrar" title="Cerrar sin guardar" aria-label="Cerrar">' + ico('cerrar') + '</button></div>' +
      '<div class="hoja-cuerpo"><div class="rejilla-campos">' + c('Fecha', 'fecha', null, 'date') + c('Factura (serie y número)', 'factura') + c('NIT', 'nit', 'numeric') + c('Proveedor', 'proveedor') + c('Monto', 'monto', 'decimal') + '</div>' +
      '<label class="erp-campo"><span>Descripción</span><textarea class="m-entrada" name="descripcion" rows="2"' + ro + '>' + esc(x.descripcion || '') + '</textarea></label></div>' +
      (soloLee ? '' : '<div class="hoja-pie"><span></span><div class="erp-chips"><button type="button" class="m-btn m-btn-secundario" data-f="cerrar" title="Cerrar sin guardar">Cancelar</button><button type="submit" class="m-btn m-btn-primario" title="Guardar esta factura en ' + esc(nombreMes(E.mes)) + '">Guardar</button></div></div>') +
      '</form>', 'capa-chica');
    capa.addEventListener('click', function (ev) { if (ev.target.closest('[data-f="cerrar"]') || ev.target.classList.contains('capa-fondo')) cerrarCapa(capa); });
    capa.querySelector('form').addEventListener('submit', async function (ev) {
      ev.preventDefault();
      const fd = new FormData(ev.target);
      ['fecha', 'factura', 'nit', 'proveedor', 'descripcion'].forEach(function (k) { x[k] = (fd.get(k) || '').trim() || null; });
      x.monto = num(fd.get('monto'));
      try {
        await Datos.guardarFactura(x);
        E.facturas = await Datos.listarFacturas(E.mes);
        cerrarCapa(capa);
        aviso('Factura guardada.');
        guardarScroll(pintar);
      } catch (e) { aviso(e.message, 'error'); }
    });
  }

  async function descargar(boton) {
    boton.disabled = true;
    const texto = boton.innerHTML;
    boton.textContent = 'Armando el Excel…';
    try {
      const p = await plantillaActual();
      if (!p) throw new Error('Falta subir la plantilla del Excel.');
      const datosMes = await Datos.leerMes(E.mes);
      let datos = datosMes && datosMes.datos;
      if (!datos) {
        const ant = await Datos.mesAnteriorConDatos(E.mes);
        datos = ant && ant.datos ? ant.datos : {};
        if (ant && ant.datos) aviso('Este mes no tiene «Datos del mes» guardados; usé los de ' + nombreMes(ant.mes) + '.', 'alerta');
        else aviso('Este mes no tiene «Datos del mes» guardados; quedan los de la plantilla.', 'alerta');
      }
      const m = /^(\d{4})-(\d{2})/.exec(E.mes);
      const mes = {
        anio: +m[1], mes: +m[2],
        renglones: aRenglonesExcel(E.vales),
        facturas: E.facturas.map(function (f) { return { fecha: f.fecha, factura: f.factura, nit: f.nit, proveedor: f.proveedor, monto: f.monto, descripcion: f.descripcion }; }),
        datos: datos
      };
      const r = await ExcelPipas.generar(p.datos, JSZip, mes);
      const blob = await r.libro.guardar('blob');
      const nombre = 'PIPAS ' + mesCorto(E.mes) + '.xlsx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      aviso('Listo: ' + nombre + ' descargado.');
    } catch (e) {
      aviso(e.message, 'error');
    }
    boton.disabled = false;
    boton.innerHTML = texto;
  }

  $app.addEventListener('submit', async function (ev) {
    if (ev.target.id !== 'formEntrar') return;
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const b = ev.target.querySelector('button[type="submit"]');
    b.disabled = true;
    try {
      await Datos.entrar(String(fd.get('correo')).trim(), String(fd.get('clave')));
      E.usuario = await Datos.sesion();
      if (E.usuario) aplicarTemaUsuario(E.usuario.tema);
      await cargarMes();
      pintar();
    } catch (e) {
      aviso(e.message, 'error');
      b.disabled = false;
    }
  });

  $app.addEventListener('input', function (ev) {
    const t = ev.target;
    if (t.dataset.campo) {
      E[t.dataset.campo] = t.value;
      const pos = t.selectionStart;
      const campoNombre = t.dataset.campo;
      guardarScroll(pintar);
      const nuevo = $app.querySelector('[data-campo="' + campoNombre + '"]');
      if (nuevo) { nuevo.focus(); try { nuevo.setSelectionRange(pos, pos); } catch (e) { return; } }
      return;
    }
    if (t.dataset.dato && E.datos) E.datos.valores[t.dataset.dato] = t.value;
  });

  $app.addEventListener('change', async function (ev) {
    const t = ev.target;
    const a = t.dataset.accion;
    if (a === 'marcar') { if (t.checked) E.marcados.add(t.dataset.id); else E.marcados.delete(t.dataset.id); guardarScroll(pintar); return; }
    if (a === 'marcar-todos') { valesFiltrados().forEach(function (v) { if (t.checked) E.marcados.add(v.id); else E.marcados.delete(v.id); }); guardarScroll(pintar); return; }
    if (a === 'marcar-fact') { if (t.checked) E.marcadasFact.add(t.dataset.id); else E.marcadasFact.delete(t.dataset.id); guardarScroll(pintar); return; }
    if (a === 'marcar-fact-todas') { E.facturas.forEach(function (f) { if (t.checked) E.marcadasFact.add(f.id); else E.marcadasFact.delete(f.id); }); guardarScroll(pintar); return; }
    if (a === 'fotos') {
      const files = Array.from(t.files || []);
      files.forEach(function (f) { E.paquete.items.push({ fotos: [{ url: URL.createObjectURL(f), nombre: f.name, archivo: f }], guardado: false, estado: 'cola' }); });
      t.value = '';
      guardarScroll(pintar);
      if (files.length) aviso(files.length + ' foto' + (files.length === 1 ? '' : 's') + ' en el paquete. Se están leyendo; cuando digan «Por revisar», ábrelas.');
      leerPaquete();
      return;
    }
    if (a === 'subir-plantilla') {
      const f = t.files && t.files[0];
      t.value = '';
      if (!f) return;
      try {
        const buf = await f.arrayBuffer();
        const prueba = await MotorXlsx.abrir(buf, JSZip);
        ['FINAL', 'GASTOS', 'TS01', 'TS02', 'TS03', 'TS04', 'Rastra', 'TACOMA', 'Vales', 'Hoja1'].forEach(function (h) { prueba.hoja(h); });
        const ok = await preguntar({ titulo: 'Cambiar la plantilla', texto: 'Desde ahora los Excel salen con el formato de «' + f.name + '». ¿Seguir?', si: 'Usar esta plantilla' });
        if (!ok) return;
        await Datos.subirPlantilla(f);
        E._plantilla = null;
        E.datos = null;
        await plantillaActual();
        aviso('Plantilla cambiada.');
        guardarScroll(pintar);
      } catch (e) {
        aviso(/No existe la hoja/.test(e.message) ? 'Ese Excel no tiene las hojas de PIPAS (' + e.message.replace('No existe la hoja ', '') + ').' : e.message, 'error');
      }
      return;
    }
    if (a === 'rol') {
      try {
        await Datos.cambiarUsuario(t.dataset.id, { rol: t.value });
        aviso('Permiso cambiado.');
      } catch (e) { aviso(e.message, 'error'); }
    }
  });

  $app.addEventListener('click', async function (ev) {
    const b = ev.target.closest('[data-accion]');
    if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return;
    const a = b.dataset.accion;
    if (a === 'menu-movil') {
      if (document.getElementById('vApp').hasAttribute('data-menu-abierto')) cerrarMenuMovil(); else abrirMenuMovil();
      return;
    }
    if (a === 'vista') {
      ev.preventDefault();
      cerrarMenuMovil();
      E.vista = b.dataset.v;
      recordar('vista', E.vista);
      pintar();
      window.scrollTo(0, 0);
      return;
    }
    if (a === 'ver-clave') {
      const i = document.getElementById('aClave');
      i.type = i.type === 'password' ? 'text' : 'password';
      b.setAttribute('aria-label', i.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
      return;
    }
    if (a === 'tema') { MonterrosoTema.alternarModo(); return; }
    if (a === 'perfil') { cerrarMenuMovil(); abrirPerfil(); return; }
    if (a === 'contraer') {
      const app = document.getElementById('vApp');
      const compacto = app.dataset.lateral !== 'compacto';
      app.dataset.lateral = compacto ? 'compacto' : '';
      recordar('compacto', compacto);
      b.title = compacto ? 'Abrir el menú' : 'Contraer el menú a íconos';
      return;
    }
    if (a === 'mes') {
      if (E.paquete && E.paquete.items.some(function (i) { return !i.guardado; })) {
        const ok = await preguntar({ titulo: 'Cambiar de mes', texto: 'El paquete tiene fotos sin guardar. Si cambias de mes se pierden.', si: 'Cambiar de mes', peligro: true });
        if (!ok) return;
      }
      E.paquete = null;
      E.mes = moverMes(E.mes, +b.dataset.d);
      recordar('mes', E.mes);
      await cargarMes();
      pintar();
      return;
    }
    if (a === 'salir') { await Datos.salir(); E.usuario = null; pintar(); return; }
    if (a === 'filtro') { E.filtro = b.dataset.f; recordar('filtro', E.filtro); guardarScroll(pintar); return; }
    if (a === 'editar') {
      const v = E.vales.find(function (x) { return x.id === b.dataset.id; });
      if (v) abrirEditor(v);
      return;
    }
    if (a === 'borrar-marcados') {
      const ids = Array.from(E.marcados);
      const ok = await preguntar({ titulo: 'Borrar ' + ids.length + ' vale' + (ids.length === 1 ? '' : 's'), texto: 'Se borran de ' + nombreMes(E.mes) + ' con todos sus renglones. No se puede deshacer.', si: 'Borrar', peligro: true });
      if (!ok) return;
      try {
        await Datos.borrarVales(ids);
        E.vales = E.vales.filter(function (v) { return ids.indexOf(v.id) < 0; });
        E.marcados.clear();
        aviso('Vales borrados.');
        guardarScroll(pintar);
      } catch (e) { aviso(e.message, 'error'); }
      return;
    }
    if (a === 'paquete') { E.paquete = { unidad: b.dataset.u, items: [] }; pintar(); return; }
    if (a === 'cerrar-paquete') {
      const pend = E.paquete.items.filter(function (i) { return !i.guardado; }).length;
      if (pend) {
        const ok = await preguntar({ titulo: 'Terminar el paquete', texto: pend + ' foto' + (pend === 1 ? '' : 's') + ' sin guardar se quitarán del paquete.', si: 'Terminar', peligro: true });
        if (!ok) return;
      }
      E.paquete = null;
      pintar();
      return;
    }
    if (a === 'sin-foto') { E.paquete.items.push({ fotos: [], guardado: false, estado: 'leido', lectura: null }); revisarItem(E.paquete.items.length - 1); guardarScroll(pintar); return; }
    if (a === 'releer') {
      const it = E.paquete.items[+b.dataset.i];
      if (it && !it.guardado) { it.estado = 'cola'; it.error = ''; it.lectura = null; guardarScroll(pintar); leerPaquete(); }
      return;
    }
    if (a === 'releer-todas') {
      E.paquete.items.forEach(function (it) { if (it.estado === 'error' && !it.guardado && it.fotos.length) { it.estado = 'cola'; it.error = ''; } });
      guardarScroll(pintar);
      leerPaquete();
      return;
    }
    if (a === 'revisar') { revisarItem(+b.dataset.i); return; }
    if (a === 'unir') {
      const i = +b.dataset.i;
      const it = E.paquete.items[i];
      const ant = E.paquete.items[i - 1];
      ant.fotos = ant.fotos.concat(it.fotos);
      ant.lectura = unirLecturas(ant.lectura, it.lectura);
      if (ant.estado === 'error' && it.estado !== 'error') { ant.estado = 'leido'; ant.error = ''; }
      E.paquete.items.splice(i, 1);
      aviso('Fotos unidas al vale de arriba.');
      guardarScroll(pintar);
      return;
    }
    if (a === 'quitar-item') { E.paquete.items.splice(+b.dataset.i, 1); guardarScroll(pintar); return; }
    if (a === 'nueva-factura') { editarFactura(null); return; }
    if (a === 'editar-factura') { editarFactura(E.facturas.find(function (f) { return f.id === b.dataset.id; })); return; }
    if (a === 'borrar-facturas') {
      const ids = Array.from(E.marcadasFact);
      const ok = await preguntar({ titulo: 'Borrar ' + ids.length + ' factura' + (ids.length === 1 ? '' : 's'), texto: 'No se puede deshacer.', si: 'Borrar', peligro: true });
      if (!ok) return;
      try {
        await Datos.borrarFacturas(ids);
        E.facturas = E.facturas.filter(function (f) { return ids.indexOf(f.id) < 0; });
        E.marcadasFact.clear();
        aviso('Facturas borradas.');
        guardarScroll(pintar);
      } catch (e) { aviso(e.message, 'error'); }
      return;
    }
    if (a === 'guardar-datos') {
      const valores = {};
      E.datos.lista.forEach(function (x) {
        const v = E.datos.valores[x.clave];
        valores[x.clave] = x.texto ? (v == null ? '' : String(v)) : num(v);
      });
      try {
        await Datos.guardarMes(E.mes, valores);
        E.datos.propio = true;
        E.datos.origen = 'Guardados para este mes.';
        aviso('Datos de ' + nombreMes(E.mes) + ' guardados.');
        guardarScroll(pintar);
      } catch (e) { aviso(e.message, 'error'); }
      return;
    }
    if (a === 'descargar') { descargar(b); }
  });

  const velo = document.createElement('div');
  velo.className = 'erp-menu-velo';
  document.body.appendChild(velo);
  velo.addEventListener('click', cerrarMenuMovil);

  function abrirMenuMovil() {
    const app = document.getElementById('vApp');
    if (!app) return;
    app.setAttribute('data-menu-abierto', '');
    velo.classList.add('ver');
    const b = document.getElementById('bmMenu');
    if (b) b.setAttribute('aria-expanded', 'true');
    const a = app.querySelector('#menu a[aria-current="page"]') || app.querySelector('#menu a');
    if (a) a.focus({ preventScroll: true });
  }

  function cerrarMenuMovil() {
    const app = document.getElementById('vApp');
    if (!app || !app.hasAttribute('data-menu-abierto')) return;
    app.removeAttribute('data-menu-abierto');
    velo.classList.remove('ver');
    const b = document.getElementById('bmMenu');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  let anchoPrevio = window.matchMedia('(max-width: 860px)').matches;
  window.addEventListener('resize', function () {
    const ahora = window.matchMedia('(max-width: 860px)').matches;
    if (ahora !== anchoPrevio) { cerrarMenuMovil(); if (E.usuario && !E.editor) guardarScroll(pintar); }
    anchoPrevio = ahora;
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && E.editor && $capas.lastElementChild === E.editor.capa) cerrarEditor();
    else if (ev.key === 'Escape') cerrarMenuMovil();
  });

  iniciar();
})();
