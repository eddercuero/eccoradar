import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Users, CalendarDays, ShieldCheck, Link2, Plus,
  Clock, AlertTriangle, CheckCircle2, Radio, Mail, Trash2, Twitter,
  Facebook, Instagram, Music2, ChevronLeft, ChevronRight, Trophy,
  Target, Search, Building2, Eye, ArrowLeft, Youtube, Linkedin,
  X as IconCerrar, Heart, MessageCircle, Share2, Repeat2, Play
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

/* ---------- empresas y áreas ---------- */

const EMPRESAS = [
  { id: "nitidomkt", nombre: "NitidoMKT", tipo: "Agencia de marketing" },
  { id: "promoexito", nombre: "PromoÉxito", tipo: "Agencia de marketing" },
  { id: "gad_santana", nombre: "GAD Santana", tipo: "Gobierno autónomo descentralizado" },
  { id: "ventanas", nombre: "Ventanas", tipo: "Municipio" },
  { id: "107_mejor_ciudad", nombre: "107 Mejor Ciudad", tipo: "Programa institucional" },
  { id: "comunicacion_gad", nombre: "Comunicación GAD", tipo: "Dirección de comunicación" },
];

const AREAS = ["Institucional", "Empresa Pública", "Patronato", "Bomberos", "Comunicación Externa", "Distribución", "ATL", "BTL"];

const NAV = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "equipo", label: "Equipo y tareas", icon: Users },
  { id: "metas", label: "Metas y objetivos", icon: Target },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "redes", label: "Monitoreo de redes", icon: Radio },
  { id: "calendario", label: "Calendario", icon: CalendarDays },
  { id: "roles", label: "Roles y accesos", icon: ShieldCheck },
];

const ROLES_VISTA = {
  jefe: { label: "Jefe/a de Comunicación", acceso: ["resumen", "equipo", "metas", "ranking", "redes", "calendario", "roles"] },
  directora: { label: "Directora General", acceso: ["resumen", "equipo", "metas", "ranking", "redes", "calendario"] },
  miembro: { label: "Miembro del equipo", acceso: ["equipo", "metas", "ranking", "redes"] },
};

/* ---------- plantillas de datos (una por empresa, en un sistema real vendrían de la base de datos) ---------- */

const EQUIPO_BASE = [
  { id: 1, nombre: "Ana Torres", rol: "Community Manager", estado: "En turno", tarea: "Respondiendo comentarios FB", avatar: "AT" },
  { id: 2, nombre: "Luis Peña", rol: "Diseñador", estado: "En turno", tarea: "Piezas campaña institucional", avatar: "LP" },
  { id: 3, nombre: "Marta Ríos", rol: "Redactora", estado: "Descanso", tarea: "—", avatar: "MR" },
  { id: 4, nombre: "Carlos Gómez", rol: "Analista de monitoreo", estado: "En turno", tarea: "Revisando cuentas críticas", avatar: "CG" },
  { id: 5, nombre: "Sofía Duarte", rol: "Editor de video", estado: "Ausente", tarea: "—", avatar: "SD" },
];

const TENDENCIA_BASE = [
  { dia: "Lun", propias: 120, ataques: 8 },
  { dia: "Mar", propias: 98, ataques: 14 },
  { dia: "Mié", propias: 140, ataques: 6 },
  { dia: "Jue", propias: 132, ataques: 22 },
  { dia: "Vie", propias: 175, ataques: 11 },
  { dia: "Sáb", propias: 90, ataques: 4 },
  { dia: "Dom", propias: 76, ataques: 3 },
];

const TAREAS_BASE = [
  { id: 1, tarea: "Boletín de prensa - jornada vial", responsable: "Marta Ríos", prioridad: "Alta", estado: "En progreso", vence: "Hoy 17:00", area: "Empresa Pública" },
  { id: 2, tarea: "Cobertura foto inauguración", responsable: "Sofía Duarte", prioridad: "Alta", estado: "Pendiente", vence: "Hoy 14:00", area: "Institucional" },
  { id: 3, tarea: "Diseño post institucional", responsable: "Luis Peña", prioridad: "Media", estado: "En progreso", vence: "Mañana", area: "Institucional" },
  { id: 4, tarea: "Reporte semanal de menciones", responsable: "Carlos Gómez", prioridad: "Alta", estado: "Pendiente", vence: "Viernes", area: "Comunicación Externa" },
  { id: 5, tarea: "Campaña de vacunación - vallas", responsable: "Luis Peña", prioridad: "Media", estado: "Pendiente", vence: "Jueves", area: "ATL" },
  { id: 6, tarea: "Entrega de volantes en ferias", responsable: "Ana Torres", prioridad: "Baja", estado: "Completado", vence: "Hoy", area: "BTL" },
];

const METAS_BASE = [
  { id: 1, persona: "Luis Peña", rol: "Diseñador", entregable: "Infografías", metaHoy: 2, avanceHoy: 1, metaSemana: 10, avanceSemana: 6, area: "Institucional" },
  { id: 2, persona: "Sofía Duarte", rol: "Editor de video", entregable: "Videos", metaHoy: 3, avanceHoy: 3, metaSemana: 15, avanceSemana: 9, area: "Comunicación Externa" },
  { id: 3, persona: "Marta Ríos", rol: "Redactora", entregable: "Boletines", metaHoy: 1, avanceHoy: 0, metaSemana: 5, avanceSemana: 2, area: "Empresa Pública" },
  { id: 4, persona: "Ana Torres", rol: "Community Manager", entregable: "Publicaciones", metaHoy: 5, avanceHoy: 5, metaSemana: 30, avanceSemana: 24, area: "Distribución" },
  { id: 5, persona: "Carlos Gómez", rol: "Analista", entregable: "Reportes", metaHoy: 1, avanceHoy: 1, metaSemana: 3, avanceSemana: 3, area: "Patronato" },
];

const CUENTAS_BASE = [
  { id: 1, tipo: "Propia", plataforma: "X", handle: "@ComunicacionOficial", estado: "Activa", sentimiento: 78, menciones: 214, revisado: "hace 6 min" },
  { id: 2, tipo: "Propia", plataforma: "Facebook", handle: "Institución Oficial", estado: "Activa", sentimiento: 71, menciones: 189, revisado: "hace 12 min" },
  { id: 3, tipo: "Propia", plataforma: "Instagram", handle: "@institucionoficial", estado: "Activa", sentimiento: 83, menciones: 96, revisado: "hace 20 min" },
  { id: 4, tipo: "Atacante", plataforma: "X", handle: "@VozCritica_", estado: "Alerta", sentimiento: 22, menciones: 47, revisado: "hace 4 min" },
  { id: 5, tipo: "Atacante", plataforma: "Facebook", handle: "Denuncia Ciudadana Anónima", estado: "Crítica", sentimiento: 9, menciones: 63, revisado: "hace 2 min" },
  { id: 6, tipo: "Atacante", plataforma: "TikTok", handle: "@datososcuros", estado: "Alerta", sentimiento: 18, menciones: 31, revisado: "hace 9 min" },
];

const COBERTURA_BASE = [
  { id: 1, red: "Facebook", icono: "Facebook", cargada: true },
  { id: 2, red: "Instagram", icono: "Instagram", cargada: true },
  { id: 3, red: "X (Twitter)", icono: "X", cargada: true },
  { id: 4, red: "TikTok", icono: "TikTok", cargada: false },
  { id: 5, red: "YouTube", icono: "YouTube", cargada: false },
  { id: 6, red: "LinkedIn", icono: "LinkedIn", cargada: true },
];

const WEB_BASE = [
  { id: 1, tipo: "Palabra clave Google", texto: "obras públicas denuncia", resultados: 3, revisado: "hace 1 h" },
  { id: 2, tipo: "Foro / página web", texto: "forocomunidad.com/hilo-vialidad", resultados: 5, revisado: "hace 3 h" },
  { id: 3, tipo: "Palabra clave Google", texto: "institución corrupción", resultados: 1, revisado: "hace 40 min" },
];

const ROLES_BASE = [
  { id: 1, nombre: "Ana Torres", rol: "Community Manager", modulos: { resumen: true, equipo: true, metas: true, redes: true, calendario: false } },
  { id: 2, nombre: "Luis Peña", rol: "Diseñador", modulos: { resumen: true, equipo: true, metas: true, redes: false, calendario: false } },
  { id: 3, nombre: "Marta Ríos", rol: "Redactora", modulos: { resumen: true, equipo: true, metas: true, redes: false, calendario: false } },
  { id: 4, nombre: "Carlos Gómez", rol: "Analista de monitoreo", modulos: { resumen: true, equipo: true, metas: true, redes: true, calendario: false } },
  { id: 5, nombre: "Sofía Duarte", rol: "Editor de video", modulos: { resumen: true, equipo: true, metas: true, redes: false, calendario: false } },
  { id: 6, nombre: "Elena Vásquez", rol: "Directora", modulos: { resumen: true, equipo: true, metas: true, redes: true, calendario: true } },
];

const EVENTOS_BASE = {
  "2026-08-31": [{ h: "10:00", t: "Comité de crisis - respuesta a ataques" }],
  "2026-09-02": [{ h: "09:00", t: "Rueda de prensa - obra vial" }],
  "2026-09-04": [{ h: "15:00", t: "Entrega reporte semanal a Directora" }],
  "2026-09-09": [{ h: "11:00", t: "Reunión de planificación mensual" }],
};

const PLATAFORMA_ICONO = { X: Twitter, Facebook: Facebook, Instagram: Instagram, TikTok: Music2 };
const COBERTURA_ICONO = { Facebook: Facebook, Instagram: Instagram, X: Twitter, TikTok: Music2, YouTube: Youtube, LinkedIn: Linkedin };

/* ---------- utilidades ---------- */

function claseEstadoPersona(estado) {
  if (estado === "En turno") return "estado-ok";
  if (estado === "Descanso") return "estado-medio";
  return "estado-off";
}
function claseSentimiento(v) {
  if (v >= 60) return "sent-alto";
  if (v >= 30) return "sent-medio";
  return "sent-bajo";
}
function detectarPlataforma(url) {
  const u = url.toLowerCase();
  if (u.includes("twitter.com") || u.includes("x.com")) return "X";
  if (u.includes("facebook.com")) return "Facebook";
  if (u.includes("instagram.com")) return "Instagram";
  if (u.includes("tiktok.com")) return "TikTok";
  return "X";
}
function pad(n) { return n.toString().padStart(2, "0"); }
function claveFecha(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function pct(a, b) { return b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0; }
function cumplimiento(m) { return Math.round((pct(m.avanceHoy, m.metaHoy) + pct(m.avanceSemana, m.metaSemana)) / 2); }
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 1000;
  return h / 1000;
}

/* ---------- publicaciones simuladas por cuenta ---------- */

const TEMAS_PROPIA = [
  "Avance de obra en el sector norte: 70% completado.",
  "Capacitación a funcionarios sobre atención ciudadana.",
  "Campaña de vacunación este fin de semana en el parque central.",
  "Rendición de cuentas 2026: invitación abierta a la ciudadanía.",
  "Mejoras en el alumbrado público de tres barrios.",
  "Feria de emprendedores locales este sábado.",
  "Nuevo punto de recolección de reciclaje inaugurado.",
  "Mantenimiento vial en la avenida principal.",
];
const TEMAS_ATACANTE = [
  "¿Y la promesa de la obra del puente? Ya pasó un año.",
  "Vecinos denuncian falta de respuesta a reclamos por el agua potable.",
  "Nueva denuncia ciudadana por manejo de fondos públicos.",
  "¿Por qué no informan sobre el contrato de la vía?",
  "Otra vez sin recolección de basura en el sector.",
  "Piden explicaciones por gasto en publicidad institucional.",
];

function generarPublicaciones(cuenta) {
  const temas = cuenta.tipo === "Propia" ? TEMAS_PROPIA : TEMAS_ATACANTE;
  const posts = [];
  for (let i = 0; i < 6; i++) {
    const seed = hashSeed(cuenta.id + "-" + i);
    posts.push({
      id: i,
      texto: temas[(cuenta.id + i) % temas.length],
      likes: Math.round(10 + seed * 300),
      comentarios: Math.round(1 + seed * 40),
      compartidos: Math.round(seed * 25),
      vistas: Math.round(500 + seed * 15000),
      fecha: i === 0 ? "hace 3 h" : i === 1 ? "hace 1 día" : `hace ${i + 1} días`,
      tono: seed,
    });
  }
  return posts;
}

function FeedFacebook({ cuenta, posts }) {
  return (
    <div className="fb-feed">
      <div className="fb-perfil-cab">
        <div className="fb-avatar"><Facebook /></div>
        <div>
          <div className="fb-nombre">{cuenta.handle}</div>
          <div className="fb-seguidores">{(1000 + Math.round(hashSeed(cuenta.id + "f") * 9000)).toLocaleString("es-ES")} seguidores</div>
        </div>
      </div>
      {posts.map(p => (
        <div className="fb-post" key={p.id}>
          <div className="fb-post-cab">
            <div className="fb-avatar-sm"><Facebook /></div>
            <div><div className="fb-post-nombre">{cuenta.handle}</div><div className="fb-post-fecha">{p.fecha}</div></div>
          </div>
          <div className="fb-post-texto">{p.texto}</div>
          <div className="fb-post-imagen" style={{ background: `hsl(${Math.round(p.tono * 360)}, 35%, 88%)` }} />
          <div className="fb-post-metricas">
            <span><Heart /> {p.likes}</span>
            <span><MessageCircle /> {p.comentarios}</span>
            <span><Share2 /> {p.compartidos}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedX({ cuenta, posts }) {
  return (
    <div className="x-feed">
      {posts.map(p => (
        <div className="x-post" key={p.id}>
          <div className="x-avatar"><Twitter /></div>
          <div className="x-post-contenido">
            <div className="x-post-cab"><span className="x-nombre">{cuenta.handle}</span><span className="x-usuario">{cuenta.handle} · {p.fecha}</span></div>
            <div className="x-post-texto">{p.texto}</div>
            <div className="x-post-metricas">
              <span><MessageCircle /> {p.comentarios}</span>
              <span><Repeat2 /> {p.compartidos}</span>
              <span><Heart /> {p.likes}</span>
              <span><Eye /> {p.vistas.toLocaleString("es-ES")}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedInstagram({ cuenta, posts }) {
  return (
    <div className="ig-feed">
      <div className="ig-perfil-cab">
        <div className="ig-avatar"><Instagram /></div>
        <div>
          <div className="ig-nombre">{cuenta.handle}</div>
          <div className="ig-seguidores">{(800 + Math.round(hashSeed(cuenta.id + "i") * 5000)).toLocaleString("es-ES")} seguidores · {posts.length} publicaciones</div>
        </div>
      </div>
      <div className="ig-grid">
        {posts.map(p => (
          <div className="ig-item" key={p.id} style={{ background: `hsl(${Math.round(p.tono * 360)}, 55%, 70%)` }}>
            <div className="ig-item-overlay"><span><Heart /> {p.likes}</span><span><MessageCircle /> {p.comentarios}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedTikTok({ cuenta, posts }) {
  return (
    <div className="tt-feed">
      <div className="tt-perfil-cab">
        <div className="tt-avatar"><Music2 /></div>
        <div>
          <div className="tt-nombre">{cuenta.handle}</div>
          <div className="tt-seguidores">{(2000 + Math.round(hashSeed(cuenta.id + "t") * 20000)).toLocaleString("es-ES")} seguidores</div>
        </div>
      </div>
      <div className="tt-grid">
        {posts.map(p => (
          <div className="tt-item" key={p.id} style={{ background: `hsl(${Math.round(p.tono * 360)}, 30%, 20%)` }}>
            <Play className="tt-play" />
            <div className="tt-vistas"><Eye /> {p.vistas.toLocaleString("es-ES")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- componente principal ---------- */

export default function EcoRadar() {
  const [vista, setVista] = useState("selector"); // selector | asesor | empresa
  const [empresaActual, setEmpresaActual] = useState(null);
  const [modoAsesor, setModoAsesor] = useState(false);

  const [modulo, setModulo] = useState("resumen");
  const [rolVista, setRolVista] = useState("jefe");
  const [reloj, setReloj] = useState(new Date());

  const [tareas, setTareas] = useState(TAREAS_BASE);
  const [nuevaTarea, setNuevaTarea] = useState({ tarea: "", responsable: EQUIPO_BASE[0].nombre, prioridad: "Media", area: AREAS[0] });
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const [filtroArea, setFiltroArea] = useState("Todas");

  const [metas, setMetas] = useState(METAS_BASE);
  const [nuevaMeta, setNuevaMeta] = useState({ persona: EQUIPO_BASE[0].nombre, rol: EQUIPO_BASE[0].rol, entregable: "", metaHoy: 1, metaSemana: 5, area: AREAS[0] });
  const [mostrarFormMeta, setMostrarFormMeta] = useState(false);

  const [cuentas, setCuentas] = useState(CUENTAS_BASE);
  const [linkNuevo, setLinkNuevo] = useState("");
  const [tipoNuevaCuenta, setTipoNuevaCuenta] = useState("Atacante");
  const [cuentaAbierta, setCuentaAbierta] = useState(null);

  const [cobertura, setCobertura] = useState(COBERTURA_BASE);
  const [web, setWeb] = useState(WEB_BASE);
  const [nuevoWeb, setNuevoWeb] = useState({ tipo: "Palabra clave Google", texto: "" });

  const [roles, setRoles] = useState(ROLES_BASE);
  const [eventos, setEventos] = useState(EVENTOS_BASE);
  const [mesActual, setMesActual] = useState(new Date(2026, 7, 1));
  const [diaSeleccionado, setDiaSeleccionado] = useState(claveFecha(new Date(2026, 7, 31)));
  const [nuevoEvento, setNuevoEvento] = useState({ h: "", t: "" });
  const [correoEnviado, setCorreoEnviado] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setReloj(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  // al entrar a una empresa, se cargan sus datos (en producción vendrían de la base de datos por empresa)
  useEffect(() => {
    if (!empresaActual) return;
    setTareas(TAREAS_BASE.map(t => ({ ...t })));
    setMetas(METAS_BASE.map(m => ({ ...m })));
    setCuentas(CUENTAS_BASE.map(c => ({ ...c })));
    setCobertura(COBERTURA_BASE.map(c => ({ ...c })));
    setWeb(WEB_BASE.map(w => ({ ...w })));
    setRoles(ROLES_BASE.map(r => ({ ...r, modulos: { ...r.modulos } })));
    setEventos(JSON.parse(JSON.stringify(EVENTOS_BASE)));
    setModulo("resumen");
    setRolVista("jefe");
  }, [empresaActual]);

  const accesoPermitido = ROLES_VISTA[rolVista].acceso;
  useEffect(() => {
    if (!accesoPermitido.includes(modulo)) setModulo(accesoPermitido[0]);
    // eslint-disable-next-line
  }, [rolVista]);

  const totalMenciones = TENDENCIA_BASE.reduce((a, d) => a + d.propias, 0);
  const tareasCompletadasHoy = tareas.filter(t => t.estado === "Completado").length;
  const cuentasEnAlerta = cuentas.filter(c => c.estado !== "Activa").length;
  const rankingOrdenado = useMemo(() => [...metas].sort((a, b) => cumplimiento(b) - cumplimiento(a)), [metas]);
  const tareasFiltradas = filtroArea === "Todas" ? tareas : tareas.filter(t => t.area === filtroArea);
  const metasFiltradas = filtroArea === "Todas" ? metas : metas.filter(m => m.area === filtroArea);

  function agregarTarea() {
    if (!nuevaTarea.tarea.trim()) return;
    setTareas([{ id: Date.now(), tarea: nuevaTarea.tarea, responsable: nuevaTarea.responsable, prioridad: nuevaTarea.prioridad, estado: "Pendiente", vence: "Sin definir", area: nuevaTarea.area }, ...tareas]);
    setNuevaTarea({ tarea: "", responsable: EQUIPO_BASE[0].nombre, prioridad: "Media", area: AREAS[0] });
    setMostrarFormTarea(false);
  }
  function cambiarEstadoTarea(id) {
    setTareas(tareas.map(t => {
      if (t.id !== id) return t;
      const orden = ["Pendiente", "En progreso", "Completado"];
      return { ...t, estado: orden[(orden.indexOf(t.estado) + 1) % orden.length] };
    }));
  }
  function eliminarTarea(id) { setTareas(tareas.filter(t => t.id !== id)); }

  function agregarMeta() {
    if (!nuevaMeta.entregable.trim()) return;
    setMetas([{ id: Date.now(), persona: nuevaMeta.persona, rol: nuevaMeta.rol, entregable: nuevaMeta.entregable, metaHoy: Number(nuevaMeta.metaHoy) || 1, avanceHoy: 0, metaSemana: Number(nuevaMeta.metaSemana) || 1, avanceSemana: 0, area: nuevaMeta.area }, ...metas]);
    setNuevaMeta({ persona: EQUIPO_BASE[0].nombre, rol: EQUIPO_BASE[0].rol, entregable: "", metaHoy: 1, metaSemana: 5, area: AREAS[0] });
    setMostrarFormMeta(false);
  }
  function alimentarMeta(id, campo) {
    setMetas(metas.map(m => m.id === id ? { ...m, [campo]: m[campo] + 1 } : m));
  }
  function eliminarMeta(id) { setMetas(metas.filter(m => m.id !== id)); }

  function agregarCuenta() {
    if (!linkNuevo.trim()) return;
    const plataforma = detectarPlataforma(linkNuevo);
    const handleGenerado = "@" + (linkNuevo.split("/").filter(Boolean).pop() || "cuenta_nueva").slice(0, 20);
    const idNueva = Date.now();
    setCuentas([{ id: idNueva, tipo: tipoNuevaCuenta, plataforma, handle: handleGenerado, estado: "Analizando", sentimiento: 0, menciones: 0, revisado: "ahora" }, ...cuentas]);
    setLinkNuevo("");
    setTimeout(() => {
      setCuentas(prev => prev.map(c => c.id === idNueva ? {
        ...c,
        estado: tipoNuevaCuenta === "Atacante" ? "Alerta" : "Activa",
        sentimiento: tipoNuevaCuenta === "Atacante" ? 15 + Math.round(Math.random() * 20) : 60 + Math.round(Math.random() * 30),
        menciones: 10 + Math.round(Math.random() * 80),
        revisado: "hace instantes",
      } : c));
    }, 1600);
  }
  function eliminarCuenta(id) { setCuentas(cuentas.filter(c => c.id !== id)); }
  function alternarCobertura(id) { setCobertura(cobertura.map(c => c.id === id ? { ...c, cargada: !c.cargada } : c)); }

  function agregarWeb() {
    if (!nuevoWeb.texto.trim()) return;
    const idNueva = Date.now();
    setWeb([{ id: idNueva, tipo: nuevoWeb.tipo, texto: nuevoWeb.texto, resultados: 0, revisado: "analizando…" }, ...web]);
    setNuevoWeb({ tipo: "Palabra clave Google", texto: "" });
    setTimeout(() => {
      setWeb(prev => prev.map(w => w.id === idNueva ? { ...w, resultados: Math.round(Math.random() * 8), revisado: "hace instantes" } : w));
    }, 1600);
  }
  function eliminarWeb(id) { setWeb(web.filter(w => w.id !== id)); }

  function alternarModuloRol(id, mod) {
    setRoles(roles.map(r => r.id === id ? { ...r, modulos: { ...r.modulos, [mod]: !r.modulos[mod] } } : r));
  }

  const diasDelMes = useMemo(() => {
    const year = mesActual.getFullYear(), month = mesActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const inicioOffset = (primerDia.getDay() + 6) % 7;
    const celdas = [];
    for (let i = 0; i < inicioOffset; i++) celdas.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(new Date(year, month, d));
    return celdas;
  }, [mesActual]);

  function agregarEvento() {
    if (!nuevoEvento.t.trim()) return;
    setEventos(prev => {
      const lista = prev[diaSeleccionado] || [];
      return { ...prev, [diaSeleccionado]: [...lista, { h: nuevoEvento.h || "—", t: nuevoEvento.t }] };
    });
    setNuevoEvento({ h: "", t: "" });
  }

  const tareasPendientesTexto = tareas.filter(t => t.estado !== "Completado");
  const empresaInfo = EMPRESAS.find(e => e.id === empresaActual);

  function volverDesdeEmpresa() {
    setEmpresaActual(null);
    setVista(modoAsesor ? "asesor" : "selector");
  }
  function entrarComoAsesor() { setModoAsesor(true); setVista("asesor"); }
  function elegirEmpresa(id) { setEmpresaActual(id); setVista("empresa"); }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

        .app {
          --bg: #0B1220; --bg-alt: #0E1728; --surface: #121C31; --surface-2: #17233B;
          --border: rgba(255,255,255,0.09); --border-gold: rgba(201,162,39,0.4);
          --gold: #C9A227; --gold-soft: rgba(201,162,39,0.14);
          --steel: #4FA3C7; --danger: #E2543D; --danger-soft: rgba(226,84,61,0.15);
          --success: #4F9D69; --success-soft: rgba(79,157,105,0.15);
          --text: #EDEFF3; --muted: #93A2B8; --dim: #5C6B85;
          font-family: 'IBM Plex Sans', sans-serif; background: var(--bg); color: var(--text);
          display: flex; min-height: 720px; height: 100%; border-radius: 10px; overflow: hidden;
          border: 1px solid var(--border); position: relative;
        }
        .app * { box-sizing: border-box; }
        .app h1, .app h2, .app h3, .app .display { font-family: 'Newsreader', serif; }

        /* ---- selector de empresa / asesor ---- */
        .selector-screen { width: 100%; padding: 60px 40px; display: flex; flex-direction: column; align-items: center; overflow-y: auto; }
        .selector-marca { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .selector-marca .punto { width: 9px; height: 9px; border-radius: 50%; background: var(--danger); box-shadow: 0 0 0 3px var(--danger-soft); }
        .selector-titulo { font-family: 'Newsreader', serif; font-size: 34px; }
        .selector-sub { color: var(--muted); font-size: 14px; margin-bottom: 40px; text-align: center; max-width: 480px; }
        .selector-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; max-width: 780px; }
        .empresa-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 20px 18px; cursor: pointer; text-align: left; }
        .empresa-card:hover { border-color: var(--border-gold); background: var(--surface-2); }
        .empresa-card .icono { width: 34px; height: 34px; border-radius: 7px; background: var(--surface-2); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .empresa-card .icono svg { width: 17px; height: 17px; color: var(--gold); }
        .empresa-card .nombre { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
        .empresa-card .tipo { font-size: 11.5px; color: var(--dim); }
        .asesor-franja { margin-top: 34px; width: 100%; max-width: 780px; border: 1px solid var(--border-gold); background: var(--gold-soft); border-radius: 8px; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .asesor-franja:hover { background: rgba(201,162,39,0.22); }
        .asesor-franja-texto .titulo { font-size: 14.5px; font-weight: 600; color: var(--gold); margin-bottom: 3px; }
        .asesor-franja-texto .sub { font-size: 12px; color: var(--muted); }

        /* ---- vista asesor ---- */
        .asesor-vista { width: 100%; padding: 40px 48px; overflow-y: auto; }
        .asesor-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .asesor-titulo { font-family: 'Newsreader', serif; font-size: 26px; }
        .asesor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .asesor-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 18px; }
        .asesor-card .nombre { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
        .asesor-card .tipo { font-size: 11px; color: var(--dim); margin-bottom: 14px; }
        .asesor-metricas { display: flex; gap: 16px; margin-bottom: 14px; }
        .asesor-metrica .valor { font-family: 'Newsreader', serif; font-size: 22px; }
        .asesor-metrica .etiqueta { font-size: 10.5px; color: var(--dim); }
        .btn-volver { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 12.5px; cursor: pointer; }
        .btn-volver svg { width: 14px; height: 14px; }

        /* ---- sidebar ---- */
        .sidebar { width: 216px; flex-shrink: 0; background: var(--bg-alt); border-right: 1px solid var(--border); padding: 22px 14px; display: flex; flex-direction: column; gap: 18px; }
        .marca { display: flex; align-items: center; gap: 10px; padding: 0 8px; }
        .marca .punto { width: 9px; height: 9px; border-radius: 50%; background: var(--danger); box-shadow: 0 0 0 3px var(--danger-soft); }
        .marca-texto { font-family: 'Newsreader', serif; font-size: 20px; letter-spacing: 0.3px; }
        .marca-sub { font-size: 10.5px; color: var(--dim); margin-top: -2px; }
        .empresa-actual { padding: 9px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; }
        .empresa-actual .nombre { font-size: 12.5px; font-weight: 600; }
        .empresa-actual .cambiar { font-size: 10.5px; color: var(--dim); cursor: pointer; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .empresa-actual .cambiar svg { width: 11px; height: 11px; }
        .asesor-badge { font-size: 9.5px; background: var(--gold-soft); color: var(--gold); padding: 2px 7px; border-radius: 20px; margin-left: 6px; }
        .navlist { display: flex; flex-direction: column; gap: 3px; }
        .navitem { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; color: var(--muted); font-size: 13.5px; cursor: pointer; border-left: 2px solid transparent; background: transparent; }
        .navitem:hover { background: var(--surface); color: var(--text); }
        .navitem.activo { background: var(--surface-2); color: var(--text); border-left: 2px solid var(--gold); }
        .navitem svg { width: 16px; height: 16px; flex-shrink: 0; }
        .sidebar-footer { margin-top: auto; padding: 10px 8px; border-top: 1px solid var(--border); }
        .rol-select { width: 100%; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: 12px; padding: 7px 8px; border-radius: 6px; font-family: inherit; }
        .rol-label { font-size: 10.5px; color: var(--dim); margin-bottom: 6px; letter-spacing: 0.2px; }

        /* ---- main ---- */
        .main { flex: 1; overflow-y: auto; padding: 26px 32px 40px; }
        .topbar { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 18px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
        .titulo-modulo { font-size: 26px; font-weight: 500; }
        .subtitulo-modulo { color: var(--muted); font-size: 13px; margin-top: 3px; }
        .reloj { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 13px; }
        .reloj svg { width: 14px; height: 14px; }

        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
        .kpi { background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 16px 18px; }
        .kpi-valor { font-family: 'Newsreader', serif; font-size: 32px; line-height: 1; }
        .kpi-label { color: var(--muted); font-size: 12px; margin-top: 8px; }
        .kpi.acento-oro { border-top: 2px solid var(--gold); }
        .kpi.acento-peligro { border-top: 2px solid var(--danger); }
        .kpi.acento-exito { border-top: 2px solid var(--success); }
        .kpi.acento-acero { border-top: 2px solid var(--steel); }

        .grid-dos { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; align-items: start; }
        .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 18px 20px; margin-bottom: 18px; }
        .panel-titulo { font-size: 15px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .panel-titulo .ver-mas { font-size: 11.5px; color: var(--dim); font-weight: 400; }

        .fila-persona { display: flex; align-items: center; gap: 11px; padding: 9px 0; border-bottom: 1px solid var(--border); }
        .fila-persona:last-child { border-bottom: none; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--surface-2); display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 600; color: var(--muted); flex-shrink: 0; }
        .persona-nombre { font-size: 13.5px; font-weight: 500; }
        .persona-tarea { font-size: 12px; color: var(--muted); }
        .estado-punto { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .estado-ok { background: var(--success); box-shadow: 0 0 0 3px var(--success-soft); }
        .estado-medio { background: var(--gold); box-shadow: 0 0 0 3px var(--gold-soft); }
        .estado-off { background: var(--dim); }
        .estado-texto { font-size: 11px; color: var(--muted); margin-left: auto; white-space: nowrap; }

        .alerta { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .alerta:last-child { border-bottom: none; }
        .alerta svg { width: 15px; height: 15px; color: var(--danger); flex-shrink: 0; margin-top: 1px; }
        .alerta-texto { font-size: 12.5px; }
        .alerta-hora { font-size: 11px; color: var(--dim); }

        .barra-fila { margin-bottom: 13px; }
        .barra-cab { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; }
        .barra-cab .num { color: var(--muted); font-variant-numeric: tabular-nums; }
        .barra-fondo { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; }
        .barra-relleno { height: 100%; background: var(--gold); border-radius: 3px; }

        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 5px; font-size: 12.5px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); font-family: inherit; }
        .btn svg { width: 13px; height: 13px; }
        .btn:hover { border-color: var(--border-gold); }
        .btn-primario { background: var(--gold-soft); border-color: var(--border-gold); color: var(--gold); }
        .btn-primario:hover { background: rgba(201,162,39,0.24); }
        .btn-sm { padding: 5px 10px; font-size: 11.5px; }

        table.tabla { width: 100%; border-collapse: collapse; font-size: 12.8px; }
        table.tabla th { text-align: left; color: var(--dim); font-weight: 500; font-size: 11px; letter-spacing: 0.3px; padding: 0 10px 8px; border-bottom: 1px solid var(--border); }
        table.tabla td { padding: 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        table.tabla tr:last-child td { border-bottom: none; }
        .etiqueta { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .etq-alta { background: var(--danger-soft); color: var(--danger); }
        .etq-media { background: var(--gold-soft); color: var(--gold); }
        .etq-baja { background: var(--surface-2); color: var(--muted); }
        .etq-pendiente { background: var(--surface-2); color: var(--muted); }
        .etq-progreso { background: rgba(79,163,199,0.15); color: var(--steel); }
        .etq-completado { background: var(--success-soft); color: var(--success); }
        .etq-cuenta-atacante { background: var(--danger-soft); color: var(--danger); }
        .fila-clic { cursor: pointer; }

        .sent-alto { color: var(--success); }
        .sent-medio { color: var(--gold); }
        .sent-bajo { color: var(--danger); }

        .form-inline { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .form-inline input, .form-inline select { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); font-size: 12.5px; padding: 8px 10px; border-radius: 5px; font-family: inherit; }
        .form-inline input[type=text] { flex: 1; min-width: 160px; }
        .form-inline input[type=number] { width: 70px; }

        .chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 18px; }
        .chip { padding: 5px 12px; border-radius: 20px; font-size: 11.5px; border: 1px solid var(--border); color: var(--muted); cursor: pointer; background: var(--surface); }
        .chip.activo { background: var(--gold-soft); border-color: var(--border-gold); color: var(--gold); }

        .tarjeta-cuenta { display: flex; align-items: center; gap: 12px; padding: 13px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; margin-bottom: 10px; }
        .tarjeta-cuenta .icono-plat { width: 30px; height: 30px; border-radius: 6px; background: var(--surface-2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tarjeta-cuenta .icono-plat svg { width: 15px; height: 15px; color: var(--muted); }
        .cuenta-handle { font-size: 13.5px; font-weight: 500; }
        .cuenta-meta { font-size: 11.5px; color: var(--dim); margin-top: 2px; }
        .cuenta-metricas { display: flex; gap: 20px; align-items: center; margin-left: auto; }
        .cuenta-metrica { text-align: right; }
        .cuenta-metrica .valor { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
        .cuenta-metrica .etiqueta-metrica { font-size: 10px; color: var(--dim); }

        .cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .cal-mes { font-family: 'Newsreader', serif; font-size: 18px; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
        .cal-diasemana { text-align: center; font-size: 10.5px; color: var(--dim); padding-bottom: 6px; }
        .cal-celda { aspect-ratio: 1; border-radius: 6px; border: 1px solid transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12.5px; cursor: pointer; color: var(--muted); gap: 3px; }
        .cal-celda:hover { background: var(--surface-2); }
        .cal-celda.hoy { border-color: var(--border-gold); color: var(--gold); }
        .cal-celda.seleccionado { background: var(--gold-soft); color: var(--gold); border-color: var(--border-gold); }
        .cal-punto-evento { width: 4px; height: 4px; border-radius: 50%; background: var(--steel); }
        .evento-fila { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; }
        .evento-hora { color: var(--gold); font-variant-numeric: tabular-nums; width: 40px; flex-shrink: 0; }

        .switch { width: 30px; height: 17px; border-radius: 20px; background: var(--surface-2); border: 1px solid var(--border); position: relative; cursor: pointer; flex-shrink: 0; }
        .switch.on { background: var(--gold-soft); border-color: var(--border-gold); }
        .switch .bolita { width: 12px; height: 12px; border-radius: 50%; background: var(--dim); position: absolute; top: 1px; left: 1px; transition: left 0.15s; }
        .switch.on .bolita { left: 14px; background: var(--gold); }

        .toast { position: fixed; bottom: 20px; right: 20px; background: var(--surface-2); border: 1px solid var(--border-gold); padding: 12px 16px; border-radius: 6px; font-size: 12.5px; display: flex; align-items: center; gap: 8px; color: var(--text); }
        .toast svg { width: 15px; height: 15px; color: var(--success); }
        .aviso-simulado { font-size: 11px; color: var(--dim); margin-top: 8px; font-style: italic; }
        .campo-vacio { color: var(--dim); font-size: 12.5px; padding: 14px 0; text-align: center; }

        /* ---- metas y ranking ---- */
        .meta-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; margin-bottom: 10px; }
        .meta-cab { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .meta-persona { font-size: 13.5px; font-weight: 600; }
        .meta-rol { font-size: 11.5px; color: var(--dim); }
        .meta-entregable { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .meta-progresos { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .meta-progreso-fila { display: flex; align-items: center; gap: 8px; }
        .meta-progreso-fila .barra-fondo { flex: 1; }
        .meta-boton-mas { width: 22px; height: 22px; border-radius: 5px; background: var(--surface-2); border: 1px solid var(--border); color: var(--gold); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; flex-shrink: 0; }
        .meta-boton-mas:hover { border-color: var(--border-gold); }

        .ranking-fila { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .ranking-fila:last-child { border-bottom: none; }
        .ranking-pos { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; background: var(--surface-2); color: var(--muted); flex-shrink: 0; }
        .ranking-pos.top1 { background: var(--gold-soft); color: var(--gold); }
        .ranking-fila-info { flex: 1; }
        .ranking-nombre { font-size: 13.5px; font-weight: 500; }
        .ranking-detalle { font-size: 11.5px; color: var(--dim); }
        .ranking-cumplimiento { font-family: 'Newsreader', serif; font-size: 22px; width: 60px; text-align: right; }

        .cobertura-fila { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .cobertura-fila:last-child { border-bottom: none; }
        .cobertura-icono { width: 28px; height: 28px; border-radius: 6px; background: var(--surface-2); display: flex; align-items: center; justify-content: center; }
        .cobertura-icono svg { width: 14px; height: 14px; color: var(--muted); }
        .cobertura-nombre { font-size: 13px; font-weight: 500; flex: 1; }

        .web-fila { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
        .web-fila:last-child { border-bottom: none; }
        .web-fila svg { width: 15px; height: 15px; color: var(--steel); flex-shrink: 0; }
        .web-texto { font-size: 13px; font-weight: 500; }
        .web-tipo { font-size: 11px; color: var(--dim); }

        /* ---- modal visor de perfil ---- */
        .modal-overlay { position: absolute; inset: 0; background: rgba(3,6,12,0.72); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 30px; }
        .modal-feed { width: 100%; max-width: 480px; height: 100%; max-height: 640px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
        .modal-feed-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .modal-feed-header-info { display: flex; align-items: center; gap: 10px; }
        .modal-feed-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--surface-2); display: flex; align-items: center; justify-content: center; }
        .modal-feed-avatar svg { width: 15px; height: 15px; color: var(--muted); }
        .modal-feed-nombre { font-size: 13.5px; font-weight: 600; }
        .modal-feed-sub { font-size: 11px; color: var(--dim); }
        .modal-feed-cerrar { width: 17px; height: 17px; color: var(--muted); cursor: pointer; }
        .modal-feed-body { flex: 1; overflow-y: auto; }
        .modal-feed-footer { padding: 10px 18px; border-top: 1px solid var(--border); font-size: 10.5px; color: var(--dim); font-style: italic; flex-shrink: 0; }

        /* Facebook */
        .fb-feed { background: #F0F2F5; color: #050505; padding-bottom: 10px; }
        .fb-perfil-cab { display: flex; align-items: center; gap: 10px; padding: 16px; background: #fff; border-bottom: 8px solid #F0F2F5; }
        .fb-avatar { width: 44px; height: 44px; border-radius: 50%; background: #E4E6EB; display: flex; align-items: center; justify-content: center; }
        .fb-avatar svg { width: 20px; height: 20px; color: #1877F2; }
        .fb-nombre { font-size: 15px; font-weight: 700; }
        .fb-seguidores { font-size: 12px; color: #65676B; }
        .fb-post { background: #fff; margin-top: 8px; padding: 12px 14px 6px; }
        .fb-post-cab { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .fb-avatar-sm { width: 30px; height: 30px; border-radius: 50%; background: #E4E6EB; display: flex; align-items: center; justify-content: center; }
        .fb-avatar-sm svg { width: 14px; height: 14px; color: #1877F2; }
        .fb-post-nombre { font-size: 12.5px; font-weight: 600; }
        .fb-post-fecha { font-size: 10.5px; color: #65676B; }
        .fb-post-texto { font-size: 13px; line-height: 1.4; margin-bottom: 10px; }
        .fb-post-imagen { width: 100%; height: 160px; border-radius: 6px; margin-bottom: 6px; }
        .fb-post-metricas { display: flex; gap: 16px; padding: 8px 0; border-top: 1px solid #E4E6EB; font-size: 12px; color: #65676B; }
        .fb-post-metricas span { display: flex; align-items: center; gap: 4px; }
        .fb-post-metricas svg { width: 13px; height: 13px; }

        /* X */
        .x-feed { background: #fff; color: #0F1419; }
        .x-post { display: flex; gap: 10px; padding: 13px 15px; border-bottom: 1px solid #EFF3F4; }
        .x-avatar { width: 36px; height: 36px; border-radius: 50%; background: #EFF3F4; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .x-avatar svg { width: 16px; height: 16px; color: #0F1419; }
        .x-post-cab { display: flex; gap: 6px; align-items: baseline; margin-bottom: 3px; flex-wrap: wrap; }
        .x-nombre { font-size: 13px; font-weight: 700; }
        .x-usuario { font-size: 12px; color: #536471; }
        .x-post-texto { font-size: 13.5px; line-height: 1.4; margin-bottom: 8px; }
        .x-post-metricas { display: flex; gap: 22px; font-size: 11.5px; color: #536471; }
        .x-post-metricas span { display: flex; align-items: center; gap: 4px; }
        .x-post-metricas svg { width: 13px; height: 13px; }

        /* Instagram */
        .ig-feed { background: #fff; color: #262626; }
        .ig-perfil-cab { display: flex; align-items: center; gap: 12px; padding: 16px; }
        .ig-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7); display: flex; align-items: center; justify-content: center; }
        .ig-avatar svg { width: 20px; height: 20px; color: #fff; }
        .ig-nombre { font-size: 14px; font-weight: 700; }
        .ig-seguidores { font-size: 11.5px; color: #8e8e8e; }
        .ig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .ig-item { aspect-ratio: 1; position: relative; display: flex; align-items: flex-end; }
        .ig-item-overlay { width: 100%; padding: 5px 6px; display: flex; justify-content: space-between; font-size: 10px; color: #fff; background: linear-gradient(to top, rgba(0,0,0,0.45), transparent); }
        .ig-item-overlay span { display: flex; align-items: center; gap: 3px; }
        .ig-item-overlay svg { width: 11px; height: 11px; }

        /* TikTok */
        .tt-feed { background: #000; color: #fff; }
        .tt-perfil-cab { display: flex; align-items: center; gap: 12px; padding: 16px; }
        .tt-avatar { width: 46px; height: 46px; border-radius: 50%; background: #1a1a1a; display: flex; align-items: center; justify-content: center; }
        .tt-avatar svg { width: 20px; height: 20px; color: #fff; }
        .tt-nombre { font-size: 14px; font-weight: 700; }
        .tt-seguidores { font-size: 11.5px; color: #a8a8a8; }
        .tt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .tt-item { aspect-ratio: 9/16; position: relative; display: flex; align-items: center; justify-content: center; }
        .tt-play { width: 20px; height: 20px; color: rgba(255,255,255,0.85); }
        .tt-vistas { position: absolute; bottom: 5px; left: 5px; font-size: 10px; display: flex; align-items: center; gap: 3px; color: #fff; }
        .tt-vistas svg { width: 10px; height: 10px; }
      `}</style>

      {/* -------- pantalla selector de empresa -------- */}
      {vista === "selector" && (
        <div className="selector-screen">
          <div className="selector-marca">
            <span className="punto" />
            <div className="selector-titulo">ECO RADAR</div>
          </div>
          <div className="selector-sub">Elige la empresa que vas a gestionar. Cada equipo alimenta su propio panel de trabajo y monitoreo.</div>
          <div className="selector-grid">
            {EMPRESAS.map(e => (
              <button key={e.id} className="empresa-card" onClick={() => elegirEmpresa(e.id)}>
                <div className="icono"><Building2 /></div>
                <div className="nombre">{e.nombre}</div>
                <div className="tipo">{e.tipo}</div>
              </button>
            ))}
          </div>
          <div className="asesor-franja" onClick={entrarComoAsesor}>
            <div className="asesor-franja-texto">
              <div className="titulo">Entrar como Asesor</div>
              <div className="sub">Ver el trabajo y el cumplimiento de todas las empresas que usan el sistema</div>
            </div>
            <Eye style={{ width: 20, height: 20, color: "var(--gold)" }} />
          </div>
        </div>
      )}

      {/* -------- vista asesor: todas las empresas -------- */}
      {vista === "asesor" && (
        <div className="asesor-vista">
          <div className="asesor-top">
            <div>
              <div className="asesor-titulo">Vista de Asesor</div>
              <div className="subtitulo-modulo">Cumplimiento y alertas de todas las empresas</div>
            </div>
            <div className="btn-volver" onClick={() => { setModoAsesor(false); setVista("selector"); }}><ArrowLeft /> Salir del modo asesor</div>
          </div>
          <div className="asesor-grid">
            {EMPRESAS.map(e => {
              const s = hashSeed(e.id);
              const cumplimientoPct = Math.round(55 + s * 42);
              const pendientes = Math.round(2 + s * 8);
              const alertas = Math.round(s * 5);
              return (
                <div className="asesor-card" key={e.id}>
                  <div className="nombre">{e.nombre}</div>
                  <div className="tipo">{e.tipo}</div>
                  <div className="asesor-metricas">
                    <div className="asesor-metrica"><div className="valor" style={{ color: cumplimientoPct >= 75 ? "var(--success)" : cumplimientoPct >= 50 ? "var(--gold)" : "var(--danger)" }}>{cumplimientoPct}%</div><div className="etiqueta">cumplimiento</div></div>
                    <div className="asesor-metrica"><div className="valor">{pendientes}</div><div className="etiqueta">tareas pend.</div></div>
                    <div className="asesor-metrica"><div className="valor" style={{ color: alertas > 2 ? "var(--danger)" : "var(--text)" }}>{alertas}</div><div className="etiqueta">alertas</div></div>
                  </div>
                  <button className="btn btn-primario btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => elegirEmpresa(e.id)}><Eye /> Entrar a esta empresa</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------- app de una empresa -------- */}
      {vista === "empresa" && (
        <>
          <aside className="sidebar">
            <div className="marca">
              <span className="punto" />
              <div>
                <div className="marca-texto">ECO RADAR</div>
                <div className="marca-sub">Comunicación integral</div>
              </div>
            </div>

            <div className="empresa-actual">
              <div className="nombre">{empresaInfo?.nombre}{modoAsesor && <span className="asesor-badge">Asesor</span>}</div>
              <div className="cambiar" onClick={volverDesdeEmpresa}><ArrowLeft /> Cambiar de empresa</div>
            </div>

            <nav className="navlist">
              {NAV.filter(n => accesoPermitido.includes(n.id)).map(item => (
                <div key={item.id} className={"navitem" + (modulo === item.id ? " activo" : "")} onClick={() => setModulo(item.id)}>
                  <item.icon />{item.label}
                </div>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div className="rol-label">Viendo como</div>
              <select className="rol-select" value={rolVista} onChange={e => setRolVista(e.target.value)}>
                {Object.entries(ROLES_VISTA).map(([key, r]) => <option key={key} value={key}>{r.label}</option>)}
              </select>
            </div>
          </aside>

          <main className="main">
            <div className="topbar">
              <div>
                <h1 className="titulo-modulo">{NAV.find(n => n.id === modulo)?.label}</h1>
                <div className="subtitulo-modulo">{empresaInfo?.nombre} · {ROLES_VISTA[rolVista].label}</div>
              </div>
              <div className="reloj">
                <Clock />
                {reloj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} · {reloj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {modulo === "resumen" && (
              <>
                <div className="kpis">
                  <div className="kpi acento-exito"><div className="kpi-valor">{tareasCompletadasHoy}/{tareas.length}</div><div className="kpi-label">Tareas completadas hoy</div></div>
                  <div className="kpi acento-oro"><div className="kpi-valor">{rankingOrdenado.length ? cumplimiento(rankingOrdenado[0]) : 0}%</div><div className="kpi-label">Mejor cumplimiento del equipo</div></div>
                  <div className="kpi acento-acero"><div className="kpi-valor">{totalMenciones}</div><div className="kpi-label">Menciones propias (7 días)</div></div>
                  <div className="kpi acento-peligro"><div className="kpi-valor">{cuentasEnAlerta}</div><div className="kpi-label">Cuentas en alerta ahora</div></div>
                </div>

                <div className="grid-dos">
                  <div>
                    <div className="panel">
                      <div className="panel-titulo">Menciones: cuentas propias vs. cuentas que atacan</div>
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={TENDENCIA_BASE} margin={{ left: -18 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                          <XAxis dataKey="dia" tick={{ fill: "#93A2B8", fontSize: 11.5 }} axisLine={{ stroke: "rgba(255,255,255,0.09)" }} tickLine={false} />
                          <YAxis tick={{ fill: "#93A2B8", fontSize: 11.5 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#17233B", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 6, fontSize: 12.5 }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Line type="monotone" dataKey="propias" name="Menciones propias" stroke="#4FA3C7" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="ataques" name="Menciones de ataque" stroke="#E2543D" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="panel">
                      <div className="panel-titulo">Equipo en este momento <span className="ver-mas" onClick={() => setModulo("equipo")} style={{ cursor: "pointer" }}>ver equipo →</span></div>
                      {EQUIPO_BASE.map(p => (
                        <div className="fila-persona" key={p.id}>
                          <div className="avatar">{p.avatar}</div>
                          <div><div className="persona-nombre">{p.nombre}</div><div className="persona-tarea">{p.tarea}</div></div>
                          <div className="estado-texto"><span className={"estado-punto " + claseEstadoPersona(p.estado)} style={{ display: "inline-block", marginRight: 6 }} />{p.estado}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="panel">
                      <div className="panel-titulo">Alertas recientes</div>
                      {cuentas.filter(c => c.tipo === "Atacante").slice(0, 4).map(c => (
                        <div className="alerta" key={c.id}>
                          <AlertTriangle />
                          <div><div className="alerta-texto">Nueva actividad en <strong>{c.handle}</strong> ({c.plataforma})</div><div className="alerta-hora">Revisado {c.revisado}</div></div>
                        </div>
                      ))}
                    </div>
                    <div className="panel">
                      <div className="panel-titulo">Top 3 del ranking <span className="ver-mas" onClick={() => setModulo("ranking")} style={{ cursor: "pointer" }}>ver todo →</span></div>
                      {rankingOrdenado.slice(0, 3).map((m, i) => (
                        <div className="fila-persona" key={m.id}>
                          <div className={"ranking-pos" + (i === 0 ? " top1" : "")}>{i + 1}</div>
                          <div><div className="persona-nombre">{m.persona}</div><div className="persona-tarea">{m.entregable}</div></div>
                          <div className="estado-texto" style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{cumplimiento(m)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {modulo === "equipo" && (
              <>
                <div className="panel">
                  <div className="panel-titulo">Turnos de la semana</div>
                  <table className="tabla">
                    <thead><tr><th>Persona</th><th>Lun</th><th>Mar</th><th>Mié</th><th>Jue</th><th>Vie</th><th>Sáb</th><th>Dom</th></tr></thead>
                    <tbody>
                      {EQUIPO_BASE.map((p, i) => (
                        <tr key={p.id}>
                          <td>{p.nombre}</td>
                          {["Mañana", "Mañana", "Tarde", "Tarde", "Mañana", i % 2 === 0 ? "Tarde" : "Libre", "Libre"].map((turno, j) => (
                            <td key={j}><span className={"etiqueta " + (turno === "Libre" ? "etq-baja" : turno === "Tarde" ? "etq-media" : "etq-progreso")}>{turno}</span></td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="chips">
                  <div className={"chip" + (filtroArea === "Todas" ? " activo" : "")} onClick={() => setFiltroArea("Todas")}>Todas las áreas</div>
                  {AREAS.map(a => <div key={a} className={"chip" + (filtroArea === a ? " activo" : "")} onClick={() => setFiltroArea(a)}>{a}</div>)}
                </div>

                <div className="panel">
                  <div className="panel-titulo">
                    Tareas del equipo
                    <button className="btn btn-primario btn-sm" onClick={() => setMostrarFormTarea(!mostrarFormTarea)}><Plus /> Asignar tarea</button>
                  </div>
                  {mostrarFormTarea && (
                    <div className="form-inline">
                      <input type="text" placeholder="Descripción de la tarea" value={nuevaTarea.tarea} onChange={e => setNuevaTarea({ ...nuevaTarea, tarea: e.target.value })} />
                      <select value={nuevaTarea.responsable} onChange={e => setNuevaTarea({ ...nuevaTarea, responsable: e.target.value })}>
                        {EQUIPO_BASE.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                      </select>
                      <select value={nuevaTarea.area} onChange={e => setNuevaTarea({ ...nuevaTarea, area: e.target.value })}>
                        {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <select value={nuevaTarea.prioridad} onChange={e => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}>
                        <option>Alta</option><option>Media</option><option>Baja</option>
                      </select>
                      <button className="btn btn-primario btn-sm" onClick={agregarTarea}>Guardar</button>
                    </div>
                  )}
                  <table className="tabla">
                    <thead><tr><th>Tarea</th><th>Área</th><th>Responsable</th><th>Prioridad</th><th>Estado</th><th>Vence</th><th></th></tr></thead>
                    <tbody>
                      {tareasFiltradas.map(t => (
                        <tr key={t.id}>
                          <td>{t.tarea}</td>
                          <td><span className="etiqueta etq-baja">{t.area}</span></td>
                          <td>{t.responsable}</td>
                          <td><span className={"etiqueta " + (t.prioridad === "Alta" ? "etq-alta" : t.prioridad === "Media" ? "etq-media" : "etq-baja")}>{t.prioridad}</span></td>
                          <td><span className={"etiqueta fila-clic " + (t.estado === "Completado" ? "etq-completado" : t.estado === "En progreso" ? "etq-progreso" : "etq-pendiente")} onClick={() => cambiarEstadoTarea(t.id)} title="Clic para cambiar de estado">{t.estado}</span></td>
                          <td style={{ color: "var(--muted)" }}>{t.vence}</td>
                          <td><Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarTarea(t.id)} /></td>
                        </tr>
                      ))}
                      {tareasFiltradas.length === 0 && <tr><td colSpan={7} className="campo-vacio">No hay tareas en esta área.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {modulo === "metas" && (
              <>
                <div className="panel">
                  <div className="panel-titulo">
                    Objetivos con meta diaria y semanal
                    <button className="btn btn-primario btn-sm" onClick={() => setMostrarFormMeta(!mostrarFormMeta)}><Plus /> Asignar objetivo</button>
                  </div>
                  {mostrarFormMeta && (
                    <div className="form-inline">
                      <select value={nuevaMeta.persona} onChange={e => {
                        const persona = EQUIPO_BASE.find(p => p.nombre === e.target.value);
                        setNuevaMeta({ ...nuevaMeta, persona: e.target.value, rol: persona?.rol || "" });
                      }}>
                        {EQUIPO_BASE.map(p => <option key={p.id} value={p.nombre}>{p.nombre} — {p.rol}</option>)}
                      </select>
                      <input type="text" placeholder="Entregable (ej. Infografías, Videos)" value={nuevaMeta.entregable} onChange={e => setNuevaMeta({ ...nuevaMeta, entregable: e.target.value })} />
                      <input type="number" min="1" placeholder="Meta hoy" value={nuevaMeta.metaHoy} onChange={e => setNuevaMeta({ ...nuevaMeta, metaHoy: e.target.value })} />
                      <input type="number" min="1" placeholder="Meta semana" value={nuevaMeta.metaSemana} onChange={e => setNuevaMeta({ ...nuevaMeta, metaSemana: e.target.value })} />
                      <select value={nuevaMeta.area} onChange={e => setNuevaMeta({ ...nuevaMeta, area: e.target.value })}>
                        {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <button className="btn btn-primario btn-sm" onClick={agregarMeta}>Guardar</button>
                    </div>
                  )}
                  <div className="aviso-simulado" style={{ marginTop: -6, marginBottom: 14 }}>Ejemplo: Diseñador → 2 infografías hoy / 10 en la semana. Editor de video → 3 videos hoy / 15 en la semana. Cada persona puede sumar su propio avance con el botón "+".</div>

                  <div className="chips">
                    <div className={"chip" + (filtroArea === "Todas" ? " activo" : "")} onClick={() => setFiltroArea("Todas")}>Todas las áreas</div>
                    {AREAS.map(a => <div key={a} className={"chip" + (filtroArea === a ? " activo" : "")} onClick={() => setFiltroArea(a)}>{a}</div>)}
                  </div>

                  {metasFiltradas.map(m => (
                    <div className="meta-card" key={m.id}>
                      <div className="meta-cab">
                        <div>
                          <div className="meta-persona">{m.persona} <span className="meta-rol">· {m.rol}</span></div>
                          <div className="meta-entregable">{m.entregable} · {m.area}</div>
                        </div>
                        <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarMeta(m.id)} />
                      </div>
                      <div className="meta-progresos">
                        <div>
                          <div className="barra-cab"><span>Hoy</span><span className="num">{m.avanceHoy}/{m.metaHoy}</span></div>
                          <div className="meta-progreso-fila">
                            <div className="barra-fondo"><div className="barra-relleno" style={{ width: pct(m.avanceHoy, m.metaHoy) + "%" }} /></div>
                            <div className="meta-boton-mas" onClick={() => alimentarMeta(m.id, "avanceHoy")}>+</div>
                          </div>
                        </div>
                        <div>
                          <div className="barra-cab"><span>Semana</span><span className="num">{m.avanceSemana}/{m.metaSemana}</span></div>
                          <div className="meta-progreso-fila">
                            <div className="barra-fondo"><div className="barra-relleno" style={{ width: pct(m.avanceSemana, m.metaSemana) + "%" }} /></div>
                            <div className="meta-boton-mas" onClick={() => alimentarMeta(m.id, "avanceSemana")}>+</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {metasFiltradas.length === 0 && <div className="campo-vacio">No hay objetivos en esta área.</div>}
                </div>
              </>
            )}

            {modulo === "ranking" && (
              <div className="panel">
                <div className="panel-titulo">Quién cumple primero y quién se atrasa</div>
                {rankingOrdenado.map((m, i) => (
                  <div className="ranking-fila" key={m.id}>
                    <div className={"ranking-pos" + (i === 0 ? " top1" : "")}>{i + 1}</div>
                    <div className="ranking-fila-info">
                      <div className="ranking-nombre">{m.persona} <span className="meta-rol">· {m.rol}</span></div>
                      <div className="ranking-detalle">{m.entregable} — hoy {m.avanceHoy}/{m.metaHoy} · semana {m.avanceSemana}/{m.metaSemana}</div>
                    </div>
                    <span className={"etiqueta " + (cumplimiento(m) >= 90 ? "etq-completado" : cumplimiento(m) >= 60 ? "etq-media" : "etq-alta")}>{cumplimiento(m) >= 90 ? "Al día" : cumplimiento(m) >= 60 ? "En curso" : "Atrasado"}</span>
                    <div className="ranking-cumplimiento">{cumplimiento(m)}%</div>
                  </div>
                ))}
              </div>
            )}

            {modulo === "redes" && (
              <>
                <div className="panel">
                  <div className="panel-titulo">Agregar cuenta a monitorear</div>
                  <div className="form-inline">
                    <input type="text" placeholder="Pega el link del perfil (X, Facebook, Instagram, TikTok)" value={linkNuevo} onChange={e => setLinkNuevo(e.target.value)} />
                    <select value={tipoNuevaCuenta} onChange={e => setTipoNuevaCuenta(e.target.value)}>
                      <option value="Propia">Cuenta propia</option>
                      <option value="Atacante">Cuenta que ataca</option>
                    </select>
                    <button className="btn btn-primario" onClick={agregarCuenta}><Link2 /> Analizar y monitorear</button>
                  </div>
                  <div className="aviso-simulado">Prototipo con datos de ejemplo — para leer cuentas reales cada día hace falta conectar esto a las APIs de cada red social o a un servicio de monitoreo.</div>
                </div>

                <div className="grid-dos">
                  <div>
                    <div className="panel">
                      <div className="panel-titulo">Cuentas propias</div>
                      {cuentas.filter(c => c.tipo === "Propia").map(c => {
                        const Icono = PLATAFORMA_ICONO[c.plataforma];
                        return (
                          <div className="tarjeta-cuenta fila-clic" key={c.id} onClick={() => c.estado !== "Analizando" && setCuentaAbierta(c.id)}>
                            <div className="icono-plat"><Icono /></div>
                            <div><div className="cuenta-handle">{c.handle}</div><div className="cuenta-meta">{c.plataforma} · revisado {c.revisado}</div></div>
                            <div className="cuenta-metricas">
                              <div className="cuenta-metrica"><div className={"valor " + claseSentimiento(c.sentimiento)}>{c.estado === "Analizando" ? "…" : c.sentimiento}</div><div className="etiqueta-metrica">sentimiento</div></div>
                              <div className="cuenta-metrica"><div className="valor">{c.estado === "Analizando" ? "…" : c.menciones}</div><div className="etiqueta-metrica">menciones</div></div>
                              <span className={"etiqueta " + (c.estado === "Analizando" ? "etq-media" : "etq-completado")}>{c.estado}</span>
                              <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); eliminarCuenta(c.id); }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="panel">
                      <div className="panel-titulo">Cuentas que nos atacan</div>
                      {cuentas.filter(c => c.tipo === "Atacante").map(c => {
                        const Icono = PLATAFORMA_ICONO[c.plataforma];
                        return (
                          <div className="tarjeta-cuenta fila-clic" key={c.id} style={{ borderColor: c.estado === "Crítica" ? "rgba(226,84,61,0.4)" : "var(--border)" }} onClick={() => c.estado !== "Analizando" && setCuentaAbierta(c.id)}>
                            <div className="icono-plat"><Icono /></div>
                            <div><div className="cuenta-handle">{c.handle}</div><div className="cuenta-meta">{c.plataforma} · revisado {c.revisado}</div></div>
                            <div className="cuenta-metricas">
                              <div className="cuenta-metrica"><div className={"valor " + claseSentimiento(c.sentimiento)}>{c.estado === "Analizando" ? "…" : c.sentimiento}</div><div className="etiqueta-metrica">sentimiento</div></div>
                              <div className="cuenta-metrica"><div className="valor">{c.estado === "Analizando" ? "…" : c.menciones}</div><div className="etiqueta-metrica">menciones</div></div>
                              <span className={"etiqueta " + (c.estado === "Analizando" ? "etq-media" : "etq-cuenta-atacante")}>{c.estado}</span>
                              <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); eliminarCuenta(c.id); }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="panel">
                      <div className="panel-titulo">Cobertura de redes cargadas</div>
                      {cobertura.map(c => {
                        const Icono = COBERTURA_ICONO[c.icono];
                        return (
                          <div className="cobertura-fila" key={c.id}>
                            <div className="cobertura-icono"><Icono /></div>
                            <div className="cobertura-nombre">{c.red}</div>
                            <div className={"switch" + (c.cargada ? " on" : "")} onClick={() => alternarCobertura(c.id)}><div className="bolita" /></div>
                          </div>
                        );
                      })}
                      <div className="aviso-simulado">Marca aquí qué redes ya están cargadas en el sistema para asegurar que no falte ninguna por revisar.</div>
                    </div>

                    <div className="panel">
                      <div className="panel-titulo">Búsqueda web, foros y palabras clave</div>
                      <div className="form-inline">
                        <select value={nuevoWeb.tipo} onChange={e => setNuevoWeb({ ...nuevoWeb, tipo: e.target.value })}>
                          <option>Palabra clave Google</option>
                          <option>Foro / página web</option>
                        </select>
                        <input type="text" placeholder="Ej. nombre de la institución + denuncia" value={nuevoWeb.texto} onChange={e => setNuevoWeb({ ...nuevoWeb, texto: e.target.value })} />
                        <button className="btn btn-primario btn-sm" onClick={agregarWeb}><Search /> Agregar</button>
                      </div>
                      {web.map(w => (
                        <div className="web-fila" key={w.id}>
                          <Search />
                          <div style={{ flex: 1 }}><div className="web-texto">{w.texto}</div><div className="web-tipo">{w.tipo} · revisado {w.revisado}</div></div>
                          <span className={"etiqueta " + (w.resultados > 3 ? "etq-alta" : w.resultados > 0 ? "etq-media" : "etq-baja")}>{w.resultados} resultados</span>
                          <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarWeb(w.id)} />
                        </div>
                      ))}
                      {web.length === 0 && <div className="campo-vacio">Sin búsquedas configuradas.</div>}
                      <div className="aviso-simulado">Prototipo simulado — en producción esto consulta la API de búsqueda de Google y rastrea foros/páginas indicadas de forma automática todos los días.</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {modulo === "calendario" && (
              <div className="grid-dos">
                <div className="panel">
                  <div className="cal-header">
                    <ChevronLeft style={{ cursor: "pointer", color: "var(--muted)" }} onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))} />
                    <div className="cal-mes">{mesActual.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</div>
                    <ChevronRight style={{ cursor: "pointer", color: "var(--muted)" }} onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))} />
                  </div>
                  <div className="cal-grid">
                    {["L", "M", "X", "J", "V", "S", "D"].map(d => <div className="cal-diasemana" key={d}>{d}</div>)}
                    {diasDelMes.map((d, i) => {
                      if (!d) return <div key={i} />;
                      const clave = claveFecha(d);
                      const esHoy = clave === "2026-08-31";
                      const tieneEventos = eventos[clave]?.length > 0;
                      return (
                        <div key={i} className={"cal-celda" + (esHoy ? " hoy" : "") + (clave === diaSeleccionado ? " seleccionado" : "")} onClick={() => setDiaSeleccionado(clave)}>
                          {d.getDate()}{tieneEventos && <div className="cal-punto-evento" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="panel">
                    <div className="panel-titulo">Agenda del {new Date(diaSeleccionado).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</div>
                    {(eventos[diaSeleccionado] || []).map((ev, i) => <div className="evento-fila" key={i}><div className="evento-hora">{ev.h}</div><div>{ev.t}</div></div>)}
                    {(!eventos[diaSeleccionado] || eventos[diaSeleccionado].length === 0) && <div className="campo-vacio">Sin eventos este día.</div>}
                    <div className="form-inline" style={{ marginTop: 12 }}>
                      <input type="text" placeholder="Hora" style={{ minWidth: 0, width: 62 }} value={nuevoEvento.h} onChange={e => setNuevoEvento({ ...nuevoEvento, h: e.target.value })} />
                      <input type="text" placeholder="Nuevo evento" value={nuevoEvento.t} onChange={e => setNuevoEvento({ ...nuevoEvento, t: e.target.value })} />
                      <button className="btn btn-primario btn-sm" onClick={agregarEvento}><Plus /> Agendar</button>
                    </div>
                  </div>
                  <div className="panel">
                    <div className="panel-titulo">Tareas pendientes del equipo</div>
                    {tareasPendientesTexto.map(t => (
                      <div className="fila-persona" key={t.id}>
                        <div><div className="persona-nombre">{t.tarea}</div><div className="persona-tarea">{t.responsable} · vence {t.vence}</div></div>
                        <span className={"etiqueta " + (t.estado === "En progreso" ? "etq-progreso" : "etq-pendiente")} style={{ marginLeft: "auto" }}>{t.estado}</span>
                      </div>
                    ))}
                    <button className="btn btn-primario" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} onClick={() => { setCorreoEnviado(true); setTimeout(() => setCorreoEnviado(false), 3000); }}>
                      <Mail /> Enviar resumen de pendientes por correo
                    </button>
                    <div className="aviso-simulado">Envío simulado — conectar un servicio de correo permite enviarlo de verdad todos los días de forma automática.</div>
                  </div>
                </div>
              </div>
            )}

            {modulo === "roles" && (
              <div className="panel">
                <div className="panel-titulo">Accesos por integrante</div>
                <table className="tabla">
                  <thead><tr><th>Integrante</th><th>Rol</th><th>Resumen</th><th>Equipo</th><th>Metas</th><th>Redes</th><th>Calendario</th></tr></thead>
                  <tbody>
                    {roles.map(r => (
                      <tr key={r.id}>
                        <td>{r.nombre}</td>
                        <td><span className="etiqueta etq-baja">{r.rol}</span></td>
                        {["resumen", "equipo", "metas", "redes", "calendario"].map(mod => (
                          <td key={mod}><div className={"switch" + (r.modulos[mod] ? " on" : "")} onClick={() => alternarModuloRol(r.id, mod)}><div className="bolita" /></div></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="aviso-simulado">Usa el selector "Viendo como" en el panel izquierdo para previsualizar el dashboard tal como lo vería cada rol.</div>
              </div>
            )}
          </main>
        </>
      )}

      {cuentaAbierta && (() => {
        const c = cuentas.find(x => x.id === cuentaAbierta);
        if (!c) return null;
        const posts = generarPublicaciones(c);
        const Icono = PLATAFORMA_ICONO[c.plataforma];
        return (
          <div className="modal-overlay" onClick={() => setCuentaAbierta(null)}>
            <div className="modal-feed" onClick={e => e.stopPropagation()}>
              <div className="modal-feed-header">
                <div className="modal-feed-header-info">
                  <div className="modal-feed-avatar"><Icono /></div>
                  <div>
                    <div className="modal-feed-nombre">{c.handle}</div>
                    <div className="modal-feed-sub">{c.plataforma} · {c.tipo === "Propia" ? "cuenta propia" : "cuenta que ataca"}</div>
                  </div>
                </div>
                <IconCerrar className="modal-feed-cerrar" onClick={() => setCuentaAbierta(null)} />
              </div>
              <div className={"modal-feed-body plat-" + c.plataforma.replace(/[^a-zA-Z]/g, "").toLowerCase()}>
                {c.plataforma === "Facebook" && <FeedFacebook cuenta={c} posts={posts} />}
                {c.plataforma === "X" && <FeedX cuenta={c} posts={posts} />}
                {c.plataforma === "Instagram" && <FeedInstagram cuenta={c} posts={posts} />}
                {c.plataforma === "TikTok" && <FeedTikTok cuenta={c} posts={posts} />}
              </div>
              <div className="modal-feed-footer">Vista de solo lectura dentro de Eco Radar — publicaciones de ejemplo. Para ver las publicaciones reales todos los días hay que conectar la cuenta a la API de cada red.</div>
            </div>
          </div>
        );
      })()}

      {correoEnviado && <div className="toast"><CheckCircle2 /> Resumen enviado a la Directora (simulado)</div>}
    </div>
  );
}
