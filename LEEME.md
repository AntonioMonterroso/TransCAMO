# TransCAMO · Control de pipas

Sistema web para el cliente TransCAMO. Lee solas las fotos de los vales «Santander 1», tickets y facturas con la IA (Claude Haiku 5.5), guarda los vales en su propia base de Supabase y descarga el Excel del mes con el mismo formato que «PIPAS Sep26.xlsx».

No es parte del ERP de la firma: tiene su propia base y se publica aparte.

## Partes

- `index.html`, `css/`, `js/`, `vendor/`: la página. No necesita Node ni compilar.
- `marca/`: el diseño del ERP copiado tal cual: tokens, hoja base, motor de temas, logo, fuentes y `erp.css` (la hoja del ERP con su letra, casillas, botones y menú de celular). Si cambia en el ERP, se vuelve a copiar; `css/app.css` solo agrega lo propio de TransCAMO.
- `js/motor-xlsx.js`: abre la plantilla, cambia datos, inserta filas y recalcula las fórmulas sin tocar formatos.
- `js/excel-pipas.js`: dónde va cada dato en cada hoja (TS01–TS04, Rastra, TACOMA, GASTOS, Vales, Hoja1, FINAL).
- `js/lector.js`: reparte un texto pegado a mano (respaldo si la lectura falla).
- `supabase/functions/leer-vale/index.ts`: función de Supabase que manda las fotos a Claude Haiku 5.5 y devuelve los vales agrupados (frente, reverso y tickets). No guarda las fotos. Solo contesta a usuarios con sesión y rol Administrador o Captura, desde studiomonterroso.com o localhost:8977. La llave va en el secreto `ANTHROPIC_API_KEY` de Supabase (vence 19/11/2027).
- `sql/03-lectura-ia.sql`: tabla `lecturas_ia` y función `usar_lecturas` (tope de 300 fotos por usuario al día, hora de Guatemala).
- Subir la función: `supabase functions deploy leer-vale --project-ref qbcysmomueqrqwyaqkvc --no-verify-jwt --use-api` (con un token de acceso temporal).
- `js/datos.js`: guarda en Supabase; si `js/config.js` está vacío, trabaja en «modo de prueba» dentro del navegador.
- `sql/01-esquema.sql`: tablas, permisos y la bodega privada de la plantilla.
- `plantilla/` y `pruebas/`: solo en esta Mac. No se publican (tienen datos del cliente).

## Poner en marcha (lo hace Antonio)

1. Crear un proyecto nuevo en Supabase solo para TransCAMO (no el del ERP ni el de AuditOS).
2. En Authentication › Sign In / Providers: dejar Email activo y apagar «Allow new users to sign up».
3. Crear primero el usuario de Antonio en Authentication › Users (queda como administrador) y después los de captura.
4. Correr `sql/01-esquema.sql` y después `sql/02-tema.sql` (color de cada usuario) en el SQL Editor del proyecto nuevo.
5. Poner la URL del proyecto y la llave «anon public» en `js/config.js`. Esa llave es pública por diseño: lo que protege los datos son los permisos del SQL.
6. Entrar a la página, pestaña Excel › «Cambiar plantilla» y subir `PIPAS Sep26.xlsx`. Queda guardada en la bodega privada `plantillas`.

## Permisos

- Administrador: todo, más usuarios y plantilla.
- Captura: sube, corrige y borra vales, facturas y datos del mes.
- Solo ver: consulta y descarga el Excel.
