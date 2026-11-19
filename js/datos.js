(function (raiz) {
  'use strict';

  const cfg = raiz.TRANSCAMO_CONFIG || {};
  const conSupabase = !!(cfg.supabaseUrl && cfg.supabaseAnon && raiz.supabase);
  let sb = null;
  if (conSupabase) sb = raiz.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnon, { auth: { persistSession: true, autoRefreshToken: true } });

  function uuid() {
    if (raiz.crypto && raiz.crypto.randomUUID) return raiz.crypto.randomUUID();
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  const Local = {
    leer: function (clave, defecto) {
      try {
        const t = raiz.localStorage.getItem('transcamo:' + clave);
        return t ? JSON.parse(t) : defecto;
      } catch (e) { return defecto; }
    },
    escribir: function (clave, valor) {
      try { raiz.localStorage.setItem('transcamo:' + clave, JSON.stringify(valor)); return true; } catch (e) { return false; }
    }
  };

  function fallo(error, que) {
    if (!error) return;
    const msg = error.message || String(error);
    throw new Error(que + ': ' + msg);
  }

  function base64ABuffer(b64) {
    const bin = raiz.atob(b64);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u.buffer;
  }

  function bufferABase64(buf) {
    const u = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    return raiz.btoa(s);
  }

  const Datos = {
    modo: conSupabase ? 'supabase' : 'local',

    async sesion() {
      if (!conSupabase) return { correo: 'modo de prueba', nombre: 'Modo de prueba', rol: 'admin', id: 'local', tema: Local.leer('tema', null) };
      const r = await sb.auth.getSession();
      const s = r.data && r.data.session;
      if (!s) return null;
      const p = await sb.from('perfiles').select('id,nombre,correo,rol,tema').eq('id', s.user.id).maybeSingle();
      fallo(p.error, 'No se pudo leer tu perfil');
      if (!p.data) return { id: s.user.id, correo: s.user.email, nombre: s.user.email, rol: null };
      return { id: p.data.id, correo: p.data.correo || s.user.email, nombre: p.data.nombre || s.user.email, rol: p.data.rol, tema: p.data.tema };
    },

    async entrar(correo, clave) {
      if (!conSupabase) return true;
      const r = await sb.auth.signInWithPassword({ email: correo, password: clave });
      if (r.error) {
        if (/invalid/i.test(r.error.message)) throw new Error('Correo o contraseña incorrectos.');
        fallo(r.error, 'No se pudo entrar');
      }
      return true;
    },

    async salir() {
      if (conSupabase) await sb.auth.signOut();
    },

    async listarVales(mes) {
      if (!conSupabase) {
        return Local.leer('vales', []).filter(function (v) { return v.mes === mes; });
      }
      const r = await sb.from('vales').select('id,mes,unidad,numero,fecha,total,piloto,placa,notas,creado_en,editado_en,renglones(id,orden,concepto,tipo,clase,fecha,monto,galones,gal_trans,cargo,destino,detalle,mes_anterior,viajes,factura)').eq('mes', mes).order('creado_en');
      fallo(r.error, 'No se pudieron leer los vales');
      return r.data.map(function (v) {
        v.renglones = (v.renglones || []).sort(function (a, b) { return a.orden - b.orden; });
        return v;
      });
    },

    async guardarVale(vale) {
      const limpio = Object.assign({}, vale);
      const renglones = (vale.renglones || []).map(function (r, i) {
        const x = Object.assign({}, r);
        delete x.id;
        x.orden = i;
        return x;
      });
      delete limpio.renglones;
      if (!conSupabase) {
        const todos = Local.leer('vales', []);
        if (!limpio.id) { limpio.id = uuid(); limpio.creado_en = new Date().toISOString(); }
        else limpio.editado_en = new Date().toISOString();
        limpio.renglones = renglones;
        const i = todos.findIndex(function (v) { return v.id === limpio.id; });
        if (i >= 0) { limpio.creado_en = todos[i].creado_en; todos[i] = limpio; } else todos.push(limpio);
        if (!Local.escribir('vales', todos)) throw new Error('El navegador no dejó guardar.');
        return limpio.id;
      }
      const r = await sb.rpc('guardar_vale', { p_vale: limpio, p_renglones: renglones });
      fallo(r.error, 'No se pudo guardar el vale');
      return r.data;
    },

    async borrarVales(ids) {
      if (!ids.length) return;
      if (!conSupabase) {
        Local.escribir('vales', Local.leer('vales', []).filter(function (v) { return ids.indexOf(v.id) < 0; }));
        return;
      }
      const r = await sb.from('vales').delete().in('id', ids);
      fallo(r.error, 'No se pudieron borrar los vales');
    },

    async leerMes(mes) {
      if (!conSupabase) return Local.leer('mes:' + mes, null);
      const r = await sb.from('meses').select('mes,datos,actualizado_en').eq('mes', mes).maybeSingle();
      fallo(r.error, 'No se pudieron leer los datos del mes');
      return r.data;
    },

    async mesAnteriorConDatos(mes) {
      if (!conSupabase) {
        const claves = [];
        try {
          for (let i = 0; i < raiz.localStorage.length; i++) {
            const k = raiz.localStorage.key(i);
            if (/^transcamo:mes:/.test(k)) claves.push(k.slice('transcamo:mes:'.length));
          }
        } catch (e) { return null; }
        const previos = claves.filter(function (m) { return m < mes; }).sort();
        return previos.length ? Local.leer('mes:' + previos[previos.length - 1], null) : null;
      }
      const r = await sb.from('meses').select('mes,datos').lt('mes', mes).order('mes', { ascending: false }).limit(1).maybeSingle();
      fallo(r.error, 'No se pudo leer el mes anterior');
      return r.data;
    },

    async guardarMes(mes, datos) {
      if (!conSupabase) {
        if (!Local.escribir('mes:' + mes, { mes: mes, datos: datos, actualizado_en: new Date().toISOString() })) throw new Error('El navegador no dejó guardar.');
        return;
      }
      const r = await sb.from('meses').upsert({ mes: mes, datos: datos, actualizado_en: new Date().toISOString() });
      fallo(r.error, 'No se pudieron guardar los datos del mes');
    },

    async listarFacturas(mes) {
      if (!conSupabase) return Local.leer('facturas', []).filter(function (f) { return f.mes === mes; }).sort(function (a, b) { return a.orden - b.orden; });
      const r = await sb.from('facturas').select('*').eq('mes', mes).order('orden').order('creado_en');
      fallo(r.error, 'No se pudieron leer las facturas');
      return r.data;
    },

    async guardarFactura(f) {
      const x = Object.assign({}, f);
      if (!conSupabase) {
        const todas = Local.leer('facturas', []);
        if (!x.id) { x.id = uuid(); x.creado_en = new Date().toISOString(); }
        const i = todas.findIndex(function (y) { return y.id === x.id; });
        if (i >= 0) todas[i] = x; else todas.push(x);
        if (!Local.escribir('facturas', todas)) throw new Error('El navegador no dejó guardar.');
        return x.id;
      }
      if (!x.id) delete x.id;
      delete x.creado_en;
      delete x.creado_por;
      const r = await sb.from('facturas').upsert(x).select('id').single();
      fallo(r.error, 'No se pudo guardar la factura');
      return r.data.id;
    },

    async borrarFacturas(ids) {
      if (!ids.length) return;
      if (!conSupabase) {
        Local.escribir('facturas', Local.leer('facturas', []).filter(function (f) { return ids.indexOf(f.id) < 0; }));
        return;
      }
      const r = await sb.from('facturas').delete().in('id', ids);
      fallo(r.error, 'No se pudieron borrar las facturas');
    },

    async leerPlantilla() {
      if (!conSupabase) {
        const b64 = Local.leer('plantilla', null);
        if (b64) return { datos: base64ABuffer(b64.datos), nombre: b64.nombre, fecha: b64.fecha };
        try {
          const r = await raiz.fetch('plantilla/PIPAS%20Sep26.xlsx');
          if (r.ok) return { datos: await r.arrayBuffer(), nombre: 'PIPAS Sep26.xlsx', fecha: null };
        } catch (e) { return null; }
        return null;
      }
      const info = await sb.storage.from('plantillas').list('', { search: 'PIPAS.xlsx' });
      fallo(info.error, 'No se pudo revisar la plantilla');
      const meta = (info.data || []).find(function (x) { return x.name === 'PIPAS.xlsx'; });
      if (!meta) return null;
      const r = await sb.storage.from('plantillas').download('PIPAS.xlsx');
      if (r.error) fallo({ message: r.error.message && r.error.message !== '{}' ? r.error.message : 'la bodega no respondió' }, 'No se pudo bajar la plantilla');
      return { datos: await r.data.arrayBuffer(), nombre: (meta && meta.metadata && meta.metadata.nombre) || 'PIPAS.xlsx', fecha: meta ? meta.updated_at : null };
    },

    async subirPlantilla(archivo) {
      const buf = await archivo.arrayBuffer();
      if (!conSupabase) {
        if (!Local.escribir('plantilla', { datos: bufferABase64(buf), nombre: archivo.name, fecha: new Date().toISOString() })) throw new Error('La plantilla no cupo en el navegador.');
        return;
      }
      const r = await sb.storage.from('plantillas').upload('PIPAS.xlsx', archivo, { upsert: true, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', metadata: { nombre: archivo.name } });
      fallo(r.error, 'No se pudo subir la plantilla');
    },

    async listarUsuarios() {
      if (!conSupabase) return [{ id: 'local', nombre: 'Modo de prueba', correo: '', rol: 'admin' }];
      const r = await sb.from('perfiles').select('id,nombre,correo,rol,creado_en').order('creado_en');
      fallo(r.error, 'No se pudieron leer los usuarios');
      return r.data;
    },

    async cambiarUsuario(id, cambios) {
      if (!conSupabase) return;
      const r = await sb.from('perfiles').update(cambios).eq('id', id);
      fallo(r.error, 'No se pudo cambiar el usuario');
    },

    async guardarTema(tema) {
      if (!conSupabase) { Local.escribir('tema', tema); return; }
      const r = await sb.rpc('guardar_tema', { p_tema: tema });
      fallo(r.error, 'No se pudo guardar tu color');
    },

    alCambiarSesion(fn) {
      if (conSupabase) sb.auth.onAuthStateChange(function (evento) { if (evento === 'SIGNED_OUT' || evento === 'SIGNED_IN') fn(evento); });
    }
  };

  raiz.Datos = Datos;
})(typeof self !== 'undefined' ? self : this);
