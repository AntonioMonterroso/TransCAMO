import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODELO = "claude-haiku-5-5";
const MAX_FOTOS = 8;
const MAX_FOTO = 4_500_000;
const ORIGENES = [
  "https://studiomonterroso.com",
  "http://localhost:8977",
  "http://127.0.0.1:8977",
];

const UNIDADES = ["TS01", "TS02", "TS03", "TS04", "Rastra", "TACOMA", ""];
const CONCEPTOS = ["diesel", "super", "regular", "viatico", "arbitrio", "peaje", "reparacion", "sueldo", "otro"];
const CARGOS = ["santander", "puma", "camo", ""];

const numONulo = { anyOf: [{ type: "number" }, { type: "null" }] };
const texto = { type: "string" };

const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: ["documentos"],
  properties: {
    documentos: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["fotos", "sigue_del_anterior", "tipo", "numero", "fecha", "unidad", "placa", "piloto", "total", "renglones", "recorrido", "factura", "dudas"],
        properties: {
          fotos: { type: "array", items: { type: "integer" } },
          sigue_del_anterior: { type: "boolean" },
          tipo: { type: "string", enum: ["vale", "ticket", "factura", "recibo", "otro"] },
          numero: texto,
          fecha: texto,
          unidad: { type: "string", enum: UNIDADES },
          placa: texto,
          piloto: texto,
          total: numONulo,
          renglones: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["concepto", "escrito", "monto", "galones", "detalle", "fecha"],
              properties: {
                concepto: { type: "string", enum: CONCEPTOS },
                escrito: texto,
                monto: numONulo,
                galones: numONulo,
                detalle: texto,
                fecha: texto,
              },
            },
          },
          recorrido: {
            type: "object",
            additionalProperties: false,
            required: ["gal_trans", "productos", "cargo", "destinos"],
            properties: {
              gal_trans: numONulo,
              productos: {
                type: "object",
                additionalProperties: false,
                required: ["super", "regular", "diesel"],
                properties: { super: numONulo, regular: numONulo, diesel: numONulo },
              },
              cargo: { type: "string", enum: CARGOS },
              destinos: texto,
            },
          },
          factura: {
            type: "object",
            additionalProperties: false,
            required: ["fecha", "serie", "nit", "proveedor", "monto"],
            properties: {
              fecha: texto,
              serie: texto,
              nit: texto,
              proveedor: texto,
              monto: numONulo,
            },
          },
          dudas: { type: "array", items: texto },
        },
      },
    },
  },
};

const SISTEMA = `Lees fotos de papeles de una empresa de transporte de combustible de Guatemala (pipas TS-01, TS-02, TS-03, TS-04 o TAG, una Rastra y una Tacoma). Devuelves solo lo que de verdad está escrito; nunca inventas datos.

Papeles que llegan:
- Vale «VALE A: ESTACIÓN SANTANDER 1» con número impreso en rojo (No.03832 → numero "3832", sin ceros a la izquierda), «Por Q.» (total), DIA/MES/AÑO (fecha), una tabla CANTIDAD / CONCEPTO / VALOR y «TOTAL Q.». Los conceptos impresos (GASOLINA SUPER, GASOLINA REGULAR, DIESEL, LUBRICANTES, GRASAS, ACEITES, FILTROS) muchas veces están tachados y encima escribieron otra cosa: usa lo escrito a mano, no lo impreso. Abajo o al lado suelen escribir la pipa (TS-02), el piloto y la placa (C-775BSS).
- Reverso de un vale: a mano, «Cargó en Puma», «Cargó en Santander» o «Cargó en Camo», destinos (Reu, Acapán, Champerico, Ayutía, Nuevo San Carlos, Puerto Quetzal…), galones por producto con su letra (1,000 S = super, 1,000 R = regular, 2,000 D = diésel, B) y «Total = 7,000 Gls» (galones transportados). Se ve el frente al revés, en espejo: no lo leas como datos.
- Reverso tipo «Recorrido» (sobre todo de la TS-04 o TAG): una lista de traslados de varios días, con fechas (01-10-26, 02-10-26) y líneas como «Traslado 2,000 gls Diésel Ayutía para Reu», «500 gls Regular / 200 gls Diésel Gasolinera A.G.». Muchas veces NO trae total: gal_trans es la SUMA de todos los galones de todas las líneas y de todos los días (en ese ejemplo 2,000 + 500 + 200 = 2,700). Destinos: todos los lugares que aparecen (de dónde y para dónde, y gasolineras), sin repetir, en el orden en que salen.
- Las fotos pueden venir de cabeza o de lado: léelas igual.
- Ticket o comprobante de arbitrio, peaje o parqueo (municipalidad, impreso).
- Factura o recibo de un taller, repuestos o lubricantes, a veces engrapada detrás de un vale.

Conceptos de cada renglón (escoge el más cercano a lo escrito; en «escrito» copia el texto tal cual):
- diesel, super, regular: compras de combustible, según la fila del vale donde está (DIESEL, GASOLINA SUPER, GASOLINA REGULAR) o lo escrito. Un vale puede traer varias: cada una es su propio renglón. «galones» = la CANTIDAD (por ejemplo 54.37) y «monto» = el VALOR en quetzales. Si la fila impresa está tachada y escribieron otro combustible, usa lo escrito.
- viatico: viático, comida, alimentación del piloto.
- arbitrio: arbitrio o tasa municipal.
- peaje: peaje.
- reparacion: repuestos, llantas, aceites, filtros, lubricantes, servicios de taller, lavado.
- sueldo: sueldo, quincena, pago al piloto o ayudante.
- otro: cualquier otra cosa; pon en «detalle» lo que dice.
Cuidado con la tabla del vale:
- En las filas de CONCEPTO a veces escriben la pipa (TS-02), el nombre del piloto o la placa, sin nada en VALOR: eso NO es un renglón; va en unidad, piloto y placa.
- Un renglón siempre tiene su monto en la columna VALOR. Si el vale es de un solo concepto y solo trae el total, ese total es el monto del renglón.
- En los vales de combustible, la fila escrita a mano con Q 400 o una cifra parecida casi siempre es «viático» (lo escriben Viático, Viatico o con letra difícil). Escoge viatico salvo que claramente diga otra cosa.
- Las placas son C- o P- más 3 números y 3 letras (C-775BSS); a mano la B parece 1 o 13 y la S parece 5: corrige a ese formato.
- El diésel cuesta entre Q 30 y Q 50 por galón: si la CANTIDAD que lees da un precio muy distinto, vuelve a mirar los números (un 4 a mano parece 1 o 7).
- En el reverso, suma todas las líneas de galones (incluye la del primer destino) y compara con el total escrito; si no cuadra, dilo en dudas.
En «detalle» de reparación u otro, resume lo escrito (por ejemplo «2 balancines»). «fecha» del renglón solo si trae una distinta a la del vale, en formato aaaa-mm-dd; si no, "".

Agrupa: cada documento junta todas las fotos de un mismo vale (frente, reverso y los tickets o facturas que respaldan sus renglones). Las fotos llegan en el orden en que se tomaron: el reverso y los tickets casi siempre vienen junto a su vale. Un ticket o factura que no corresponde a ningún vale del lote va como documento propio. «fotos» lleva los números de foto (empiezan en 1). Si la primera foto del lote parece reverso o respaldo del último vale del lote anterior, pon «sigue_del_anterior» en true en ese documento y no repitas datos que no se ven.

Reglas:
- Fecha en aaaa-mm-dd; año de dos cifras 26 = 2026. Si no se lee, "".
- Montos como número sin Q ni comas (2,730.- → 2730; 2,610.19 → 2610.19). Si no se lee, null.
- unidad: TS01, TS02, TS03, TS04 (TAG), Rastra, TACOMA o "" si no lo dice.
- Para un ticket de arbitrio o peaje suelto: tipo "ticket" y un renglón con su monto.
- Para una factura: llena «factura» (serie y número juntos, NIT, proveedor, fecha, monto). Si respalda un vale, va dentro de ese documento. Si no hay factura, todo "" y monto null.
- recorrido: solo en vales de combustible; gal_trans = el total de galones transportados; si no hay, null, cargo "" y destinos "" (destinos separados por coma).
- recorrido.productos: galones transportados de cada producto sumando todas las líneas del reverso (S = super, R = regular, D = diesel). En el ejemplo 1,000 S, 1,000 R, 1,000 S, 1,000 R, 2,000 D, 1,000 S → super 3000, regular 2000, diesel 2000. Si no dice el producto, null.
- dudas: frases cortas en español de lo que no se leyó bien o no cuadra (por ejemplo «El 400 del viático está borroso» o «La suma de renglones no da el total»). Vacío si todo está claro.`;

function cors(origen: string | null) {
  const ok = origen && ORIGENES.includes(origen) ? origen : ORIGENES[0];
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function respuesta(cuerpo: unknown, estado: number, origen: string | null) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { ...cors(origen), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const origen = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origen) });
  if (req.method !== "POST") return respuesta({ error: "Método no permitido." }, 405, origen);
  if (origen && !ORIGENES.includes(origen)) return respuesta({ error: "Origen no permitido." }, 403, origen);

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const llavePublica = req.headers.get("apikey") || "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  const llaveIA = Deno.env.get("ANTHROPIC_API_KEY") || "";
  if (!token || !llavePublica) return respuesta({ error: "Entra con tu usuario de TransCAMO." }, 401, origen);

  const sb = createClient(url, llavePublica, {
    global: { headers: { Authorization: "Bearer " + token } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const quien = await sb.auth.getUser(token);
  if (quien.error || !quien.data.user) return respuesta({ error: "Tu sesión venció. Vuelve a entrar." }, 401, origen);
  if (!llaveIA) return respuesta({ error: "Falta la llave de la IA en Supabase (secreto ANTHROPIC_API_KEY)." }, 500, origen);

  let cuerpo: { fotos?: { data?: string; tipo?: string }[]; unidad?: string; pilotos?: string[]; anterior?: string };
  try {
    cuerpo = await req.json();
  } catch {
    return respuesta({ error: "Pedido mal armado." }, 400, origen);
  }
  const fotos = Array.isArray(cuerpo.fotos) ? cuerpo.fotos : [];
  if (!fotos.length || fotos.length > MAX_FOTOS) return respuesta({ error: "Manda de 1 a " + MAX_FOTOS + " fotos por vez." }, 400, origen);
  for (const f of fotos) {
    if (typeof f.data !== "string" || !f.data || f.data.length > MAX_FOTO) return respuesta({ error: "Una foto no llegó bien o es muy grande." }, 400, origen);
    if (f.tipo !== "image/jpeg" && f.tipo !== "image/png" && f.tipo !== "image/webp") return respuesta({ error: "Formato de foto no permitido." }, 400, origen);
  }

  const uso = await sb.rpc("usar_lecturas", { p_n: fotos.length });
  if (uso.error) {
    const m = uso.error.message || "";
    if (m.includes("tope_diario")) {
      const quedan = Number(m.split(":").pop()) || 0;
      return respuesta({ error: "Llegaste al tope de 300 lecturas de hoy" + (quedan > 0 ? " (te quedan " + quedan + ")" : "") + ". Mañana se puede seguir o escribe los datos a mano.", tope: true }, 429, origen);
    }
    if (m.includes("sin_permiso")) return respuesta({ error: "Tu usuario solo puede ver: no puede leer fotos." }, 403, origen);
    return respuesta({ error: "No se pudo revisar tu permiso." }, 403, origen);
  }

  const unidad = UNIDADES.includes(String(cuerpo.unidad)) ? String(cuerpo.unidad) : "";
  const pilotos = (Array.isArray(cuerpo.pilotos) ? cuerpo.pilotos : []).filter((p) => typeof p === "string").slice(0, 30).map((p) => p.slice(0, 60));
  const anterior = typeof cuerpo.anterior === "string" ? cuerpo.anterior.slice(0, 300) : "";

  const contenido: Anthropic.ContentBlockParam[] = [];
  fotos.forEach((f, i) => {
    contenido.push({ type: "text", text: "Foto " + (i + 1) + ":" });
    contenido.push({ type: "image", source: { type: "base64", media_type: f.tipo as "image/jpeg", data: f.data as string } });
  });
  contenido.push({
    type: "text",
    text: [
      "Este lote es del paquete de la pipa " + (unidad || "sin escoger") + ".",
      pilotos.length ? "Pilotos conocidos: " + pilotos.join(", ") + "." : "",
      anterior ? "Último vale del lote anterior: " + anterior + "." : "Es el primer lote del paquete.",
      "Lee las " + fotos.length + " fotos y devuelve los documentos.",
    ].filter(Boolean).join("\n"),
  });

  const ia = new Anthropic({ apiKey: llaveIA });
  try {
    const r = await ia.messages.create({
      model: MODELO,
      max_tokens: 16000,
      system: SISTEMA,
      messages: [{ role: "user", content: contenido }],
      output_config: { effort: "high", format: { type: "json_schema", schema: ESQUEMA } },
    });
    if (r.stop_reason === "refusal") return respuesta({ error: "La IA no quiso leer estas fotos. Escribe los datos a mano." }, 502, origen);
    if (r.stop_reason === "max_tokens") return respuesta({ error: "Las fotos traían demasiado texto. Prueba con menos fotos." }, 502, origen);
    const bloque = r.content.find((b) => b.type === "text");
    if (!bloque || bloque.type !== "text") return respuesta({ error: "La IA no devolvió datos." }, 502, origen);
    const datos = JSON.parse(bloque.text);
    return respuesta({ documentos: datos.documentos || [], quedan: uso.data, tokens: { entrada: r.usage.input_tokens, salida: r.usage.output_tokens } }, 200, origen);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return respuesta({ error: "La IA está ocupada. Intenta en un minuto." }, 503, origen);
    if (e instanceof Anthropic.AuthenticationError) return respuesta({ error: "La llave de la IA no sirve. Revísala en Supabase." }, 500, origen);
    if (e instanceof Anthropic.APIError) return respuesta({ error: "La IA respondió con un error (" + e.status + ")." }, 502, origen);
    return respuesta({ error: "No se pudo leer: " + (e instanceof Error ? e.message : "error") }, 502, origen);
  }
});
