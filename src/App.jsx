import { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard, Users, CalendarDays, ShieldCheck, Link2, Plus,
  Clock, AlertTriangle, CheckCircle2, Radio, Mail, Trash2, Twitter,
  Facebook, Instagram, Music2, ChevronLeft, ChevronRight, Trophy,
  Target, Search, Building2, Eye, ArrowLeft, Youtube, Linkedin,
  X as IconCerrar, Heart, MessageCircle, Share2, Repeat2, Play,
  Lock, LogOut, FolderKanban, FileDown, Tv, KeyRound,
  UserCog, Download, Upload, Camera, Repeat, CalendarClock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

/* ---------- empresas ---------- */

const EMPRESAS = [
  { id: "nitidomkt", nombre: "NitidoMKT", tipo: "Agencia de marketing", activa: false },
  { id: "promoexito", nombre: "PromoÉxito", tipo: "Agencia de marketing", activa: false },
  { id: "gad_santana", nombre: "GAD Santana", tipo: "Gobierno autónomo descentralizado", activa: false },
  { id: "ventanas", nombre: "Ventanas", tipo: "Municipio", activa: false },
  { id: "107_mejor_ciudad", nombre: "107 Mejor Ciudad", tipo: "Programa institucional", activa: false },
  { id: "comunicacion_gad", nombre: "Comunicación GAD Manta", tipo: "Dirección de comunicación", activa: true, clave: "gadmanta2026" },
];

const CLAVE_ASESOR = "asesor2026";

const AREAS = ["Institucional", "Empresa Pública", "Patronato", "Bomberos", "Comunicación Externa", "Distribución", "ATL", "BTL", "2.0"];

const TIPOS_ENTREGABLE = ["Foto", "Video", "Redacción", "Infografía", "Difusión", "Voz en off", "Diseño", "Otro"];

const TIPOS_CUENTA = ["Propia", "Aliada", "Influencer a favor", "Atacante", "Influencer en contra"];
const TIPOS_CUENTA_NEGATIVOS = ["Atacante", "Influencer en contra"];

const TAREAS_SUGERIDAS = {
  "Institucional": ["Boletín de prensa institucional", "Cobertura fotográfica de evento", "Publicación institucional en redes"],
  "Empresa Pública": ["Reporte de gestión", "Comunicado de servicio", "Cobertura de inauguración"],
  "Patronato": ["Cobertura campaña social", "Publicación de ayuda social", "Boletín de patronato"],
  "Bomberos": ["Cobertura operativo", "Comunicado de prevención", "Publicación de simulacro"],
  "Comunicación Externa": ["Respuesta a medios", "Monitoreo de prensa", "Nota de prensa externa"],
  "Distribución": ["Entrega de material impreso", "Distribución de volantes", "Coordinación de piezas con imprenta"],
  "ATL": ["Diseño de valla publicitaria", "Spot de radio", "Pauta en medios masivos"],
  "BTL": ["Activación en punto", "Feria o stand institucional", "Material POP"],
  "2.0": ["Publicación en redes del día", "Historias del día", "Respuesta a comentarios y mensajes"],
};

const NAV = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "equipo", label: "Equipo y tareas", icon: Users },
  { id: "metas", label: "Metas y objetivos", icon: Target },
  { id: "proyectos", label: "Proyectos", icon: FolderKanban },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "redes", label: "Monitoreo de redes", icon: Radio },
  { id: "calendario", label: "Calendario", icon: CalendarDays },
  { id: "roles", label: "RRHH", icon: UserCog },
];

const ROL_DIRECTORA = "Director/a de Comunicación";
const ROLES_SEED = [ROL_DIRECTORA, "Diseñador", "Redactor", "Community Manager", "Fotografía / Video", "Analista de monitoreo", "Encargado"];
const MODALIDADES_SEED = ["LOSEP", "NJS", "Factura", "Externo"];
const UNIDADES_SEED = ["Dircom (Dirección de Comunicación GAD)", "Bomberos", "Patronato", "Comunicación Externa"];

function accesoPorRol(rol, forzarAdmin) {
  if (rol === ROL_DIRECTORA || rol === "Asesor" || forzarAdmin) return ["resumen", "equipo", "metas", "proyectos", "ranking", "redes", "calendario", "roles"];
  if (rol === "Encargado") return ["resumen", "equipo", "metas", "proyectos", "ranking", "calendario"];
  return ["equipo", "metas", "proyectos", "ranking", "calendario"]; // miembro regular
}

/* ---------- datos semilla (GAD Manta arranca casi en blanco) ---------- */

const PERSONAS_SEED = [
  { id: 1, codigo: "directora", clave: "directora2026", nombre: "Directora de Comunicación", rol: ROL_DIRECTORA, area: "Institucional", modalidad: "LOSEP", unidad: UNIDADES_SEED[0], jefeDirecto: "", foto: "", horario: [], tareasFrecuentes: [] },
  { id: 2, codigo: "001", clave: "001", nombre: "Usuario 001", rol: "Diseñador", area: "Institucional", modalidad: "LOSEP", unidad: UNIDADES_SEED[0], jefeDirecto: "Directora de Comunicación", foto: "", horario: [], tareasFrecuentes: [] },
];

const VACIO = {
  personas: PERSONAS_SEED,
  tareas: [],
  metas: [],
  turnos: [],
  proyectos: [],
  cuentas: [],
  eventos: {},
};

const CUENTAS_INICIALES = [];

const PLATAFORMA_ICONO = { X: Twitter, Facebook: Facebook, Instagram: Instagram, TikTok: Music2 };
const COBERTURA_ICONO = { Facebook: Facebook, Instagram: Instagram, X: Twitter, TikTok: Music2, YouTube: Youtube, LinkedIn: Linkedin };
const COBERTURA_BASE = [
  { id: 1, red: "Facebook", icono: "Facebook", cargada: false },
  { id: 2, red: "Instagram", icono: "Instagram", cargada: false },
  { id: 3, red: "X (Twitter)", icono: "X", cargada: false },
  { id: 4, red: "TikTok", icono: "TikTok", cargada: false },
  { id: 5, red: "YouTube", icono: "YouTube", cargada: false },
  { id: 6, red: "LinkedIn", icono: "LinkedIn", cargada: false },
];

/* ---------- utilidades ---------- */

function pad(n) { return n.toString().padStart(2, "0"); }
function claveFecha(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function pct(a, b) { return b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0; }
function cumplimiento(m) { return Math.round((pct(m.avanceHoy, m.metaHoy) + pct(m.avanceSemana, m.metaSemana)) / 2); }
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) % 1000;
  return h / 1000;
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
function semaforoPrioridad(p) {
  if (p === "Alta") return "rojo";
  if (p === "Media") return "amarillo";
  return "verde";
}
function semaforoProyecto(p) {
  const hoy = new Date("2026-08-31");
  const vencido = p.fechaEntrega && new Date(p.fechaEntrega) < hoy && p.avance < 100;
  if (vencido) return "rojo";
  if (p.avance >= 85) return "verde";
  if (p.avance >= 45) return "amarillo";
  return "rojo";
}
function cargar(clave, porDefecto) {
  try {
    const v = localStorage.getItem(clave);
    return v ? JSON.parse(v) : porDefecto;
  } catch { return porDefecto; }
}
function guardar(clave, valor) {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* noop */ }
}

/* ---------- visor en vivo: contenido real de cada red, sin analizar nada ---------- */

function VisorFacebook({ cuenta }) {
  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(cuenta.link)}&tabs=timeline&width=460&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;
  return (
    <div className="visor-en-vivo">
      <iframe key={cuenta.id} src={src} width="100%" height="600" style={{ border: "none", overflow: "hidden" }} scrolling="no" frameBorder="0" allow="encrypted-media" title={"Facebook en vivo - " + cuenta.handle} />
      <div className="visor-nota">Esto es la página real de Facebook, mostrada en vivo con el reproductor oficial de Meta — Eco Radar no analiza ni guarda nada de lo que se ve aquí.</div>
    </div>
  );
}

function VisorX({ cuenta }) {
  const contenedorRef = useRef(null);
  useEffect(() => {
    function cargarWidget() {
      if (window.twttr && window.twttr.widgets) window.twttr.widgets.load(contenedorRef.current);
    }
    if (!document.getElementById("twitter-widgets-js")) {
      const script = document.createElement("script");
      script.id = "twitter-widgets-js";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.onload = cargarWidget;
      document.body.appendChild(script);
    } else {
      cargarWidget();
    }
  }, [cuenta.id]);
  return (
    <div className="visor-en-vivo" ref={contenedorRef}>
      <a className="twitter-timeline" data-height="600" data-theme="light" href={cuenta.link}>Publicaciones de {cuenta.handle} en X</a>
      <div className="visor-nota">Esto es el cronograma real de X (Twitter), mostrado en vivo con el widget oficial de la plataforma.</div>
    </div>
  );
}

function VisorEnlaceReal({ cuenta }) {
  const info = PLATAFORMA_INFO[cuenta.plataforma] || PLATAFORMA_INFO.Facebook;
  return (
    <div className="sin-conexion">
      <div className="sin-conexion-icono" style={{ background: info.color }}><Link2 /></div>
      <div className="sin-conexion-titulo">{cuenta.plataforma} no permite mostrarse en vivo aquí dentro</div>
      <div className="sin-conexion-texto">
        A diferencia de Facebook y X, {cuenta.plataforma} no ofrece una forma de insertar el perfil completo en tiempo real dentro de otra página — solo permite abrir el perfil real directamente.
      </div>
      <a className="btn btn-primario" href={cuenta.link} target="_blank" rel="noreferrer"><Eye /> Abrir el perfil real de {cuenta.handle}</a>
    </div>
  );
}

const PLATAFORMA_INFO = {
  Facebook: { color: "#1877F2" },
  X: { color: "#0F1419" },
  Instagram: { color: "#C13584" },
  TikTok: { color: "#000000" },
};

function VisorEnVivo({ cuenta }) {
  if (cuenta.plataforma === "Facebook") return <VisorFacebook cuenta={cuenta} />;
  if (cuenta.plataforma === "X") return <VisorX cuenta={cuenta} />;
  return <VisorEnlaceReal cuenta={cuenta} />;
}

/* ---------- modo TV (pantalla tipo aeropuerto) ---------- */

function ModoTV({ personas, tareas, metas, onSalir }) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % 3), 30000);
    return () => clearInterval(t);
  }, []);
  const ranking = [...metas].sort((a, b) => cumplimiento(b) - cumplimiento(a));

  return (
    <div className="tv-pantalla">
      <div className="tv-topbar">
        <div className="tv-marca"><span className="tv-punto" />ECO RADAR · Comunicación GAD Manta</div>
        <div className="tv-slides-dots">
          {[0, 1, 2].map(i => <span key={i} className={"tv-dot" + (slide === i ? " activo" : "")} />)}
        </div>
        <div className="tv-salir" onClick={onSalir}>Salir</div>
      </div>

      {slide === 0 && (
        <div className="tv-contenido">
          <div className="tv-titulo-slide">Tareas de hoy por persona</div>
          <div className="tv-grid-personas">
            {personas.filter(p => p.rol !== ROL_DIRECTORA && p.rol !== "Asesor").map(p => {
              const propias = tareas.filter(t => t.responsable === p.nombre);
              return (
                <div className="tv-tarjeta" key={p.id}>
                  <div className="tv-tarjeta-nombre">{p.nombre}</div>
                  <div className="tv-tarjeta-rol">{p.rol}</div>
                  {propias.length === 0 && <div className="tv-sin-datos">Sin tareas asignadas hoy</div>}
                  {propias.slice(0, 4).map(t => (
                    <div className="tv-tarea-fila" key={t.id}>
                      <span className={"tv-semaforo " + semaforoPrioridad(t.prioridad)} />
                      {t.tarea} <span className="tv-tarea-estado">· {t.estado}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {slide === 1 && (
        <div className="tv-contenido">
          <div className="tv-titulo-slide">Metas semanales del equipo</div>
          <div className="tv-grid-metas">
            {metas.map(m => (
              <div className="tv-meta-fila" key={m.id}>
                <div className="tv-meta-persona">{m.persona} <span className="tv-meta-entregable">— {m.entregable}</span></div>
                <div className="tv-meta-barra-fondo"><div className="tv-meta-barra-relleno" style={{ width: pct(m.avanceSemana, m.metaSemana) + "%" }} /></div>
                <div className="tv-meta-num">{m.avanceSemana}/{m.metaSemana}</div>
              </div>
            ))}
            {metas.length === 0 && <div className="tv-sin-datos">Aún no hay metas cargadas</div>}
          </div>
        </div>
      )}

      {slide === 2 && (
        <div className="tv-contenido">
          <div className="tv-titulo-slide">Ranking de cumplimiento</div>
          <div className="tv-ranking">
            {ranking.map((m, i) => (
              <div className="tv-ranking-fila" key={m.id}>
                <div className={"tv-ranking-pos" + (i === 0 ? " oro" : i === 1 ? " plata" : i === 2 ? " bronce" : "")}>{i + 1}</div>
                <div className="tv-ranking-nombre">{m.persona}</div>
                <div className="tv-ranking-pct">{cumplimiento(m)}%</div>
              </div>
            ))}
            {ranking.length === 0 && <div className="tv-sin-datos">Aún no hay datos de cumplimiento</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- nodo recursivo del organigrama ---------- */

function NodoOrganigrama({ persona, hijosDe }) {
  const hijos = hijosDe(persona.nombre);
  return (
    <div className="organigrama-rama">
      <div className="organigrama-caja">
        <div className="organigrama-avatar">{persona.foto ? <img src={persona.foto} alt={persona.nombre} /> : <span>{persona.nombre.split(" ").map(x => x[0]).slice(0, 2).join("")}</span>}</div>
        <div className="organigrama-nombre">{persona.nombre}</div>
        <div className="organigrama-rol">{persona.rol}</div>
      </div>
      {hijos.length > 0 && (
        <div className="organigrama-hijos">
          {hijos.map(h => <NodoOrganigrama key={h.id} persona={h} hijosDe={hijosDe} />)}
        </div>
      )}
    </div>
  );
}

/* ---------- componente principal ---------- */

export default function EcoRadar() {
  const [sesion, setSesion] = useState(() => cargar("eco_radar_sesion", null));
  const [paso, setPaso] = useState("selector");
  const [empresaEnProceso, setEmpresaEnProceso] = useState(null);
  const [claveEmpresaInput, setClaveEmpresaInput] = useState("");
  const [loginCodigo, setLoginCodigo] = useState("");
  const [loginClave, setLoginClave] = useState("");
  const [errorLogin, setErrorLogin] = useState("");

  const [personas, setPersonas] = useState(() => {
    const cargadas = cargar("eco_gad_personas", VACIO.personas);
    // migración: cuentas guardadas antes de renombrar "Directora" a "Director/a de Comunicación"
    return cargadas.map(p => (p.rol === "Directora" ? { ...p, rol: ROL_DIRECTORA } : p));
  });
  const [rolesDisponibles, setRolesDisponibles] = useState(() => cargar("eco_gad_roles_disp", ROLES_SEED));
  const [modalidadesDisponibles, setModalidadesDisponibles] = useState(() => cargar("eco_gad_modalidades_disp", MODALIDADES_SEED));
  const [unidadesDisponibles, setUnidadesDisponibles] = useState(() => cargar("eco_gad_unidades_disp", UNIDADES_SEED));
  const [unidadActual, setUnidadActual] = useState(() => cargar("eco_gad_unidad_actual", UNIDADES_SEED[0]));
  const [tareas, setTareas] = useState(() => cargar("eco_gad_tareas", VACIO.tareas));
  const [metas, setMetas] = useState(() => cargar("eco_gad_metas", VACIO.metas));
  const [turnos, setTurnos] = useState(() => cargar("eco_gad_turnos", VACIO.turnos));
  const [proyectos, setProyectos] = useState(() => cargar("eco_gad_proyectos", VACIO.proyectos));
  const [cuentas, setCuentas] = useState(() => cargar("eco_gad_cuentas", CUENTAS_INICIALES));
  const [cobertura, setCobertura] = useState(() => cargar("eco_gad_cobertura", COBERTURA_BASE));
  const [web, setWeb] = useState(() => cargar("eco_gad_web", []));
  const [eventos, setEventos] = useState(() => cargar("eco_gad_eventos", VACIO.eventos));

  useEffect(() => guardar("eco_gad_personas", personas), [personas]);
  useEffect(() => guardar("eco_gad_roles_disp", rolesDisponibles), [rolesDisponibles]);
  useEffect(() => guardar("eco_gad_modalidades_disp", modalidadesDisponibles), [modalidadesDisponibles]);
  useEffect(() => guardar("eco_gad_unidades_disp", unidadesDisponibles), [unidadesDisponibles]);
  useEffect(() => guardar("eco_gad_unidad_actual", unidadActual), [unidadActual]);
  useEffect(() => guardar("eco_gad_tareas", tareas), [tareas]);
  useEffect(() => guardar("eco_gad_metas", metas), [metas]);
  useEffect(() => guardar("eco_gad_turnos", turnos), [turnos]);
  useEffect(() => guardar("eco_gad_proyectos", proyectos), [proyectos]);
  useEffect(() => guardar("eco_gad_cuentas", cuentas), [cuentas]);
  useEffect(() => guardar("eco_gad_cobertura", cobertura), [cobertura]);
  useEffect(() => guardar("eco_gad_web", web), [web]);
  useEffect(() => guardar("eco_gad_eventos", eventos), [eventos]);

  const [modulo, setModulo] = useState("resumen");
  const [reloj, setReloj] = useState(new Date());
  const [vistaTV, setVistaTV] = useState(false);
  const [empresaAsesorViendo, setEmpresaAsesorViendo] = useState(null);
  const [cuentaAbierta, setCuentaAbierta] = useState(null);
  const [correoEnviado, setCorreoEnviado] = useState(false);

  useEffect(() => { const t = setInterval(() => setReloj(new Date()), 1000 * 30); return () => clearInterval(t); }, []);

  function iniciarSesionEmpresa(id) {
    const emp = EMPRESAS.find(e => e.id === id);
    if (!emp || !emp.activa) return;
    setEmpresaEnProceso(id); setErrorLogin(""); setPaso("clave-empresa");
  }
  function confirmarClaveEmpresa() {
    const emp = EMPRESAS.find(e => e.id === empresaEnProceso);
    if (claveEmpresaInput === emp.clave) { setErrorLogin(""); setPaso("login-usuario"); }
    else setErrorLogin("Clave de empresa incorrecta.");
  }
  function confirmarLoginUsuario() {
    const persona = personas.find(p => p.codigo === loginCodigo.trim() && p.clave === loginClave);
    if (!persona) { setErrorLogin("Código o clave incorrectos."); return; }
    const nuevaSesion = { tipo: "usuario", empresaId: empresaEnProceso, usuarioId: persona.id };
    guardar("eco_radar_sesion", nuevaSesion);
    setSesion(nuevaSesion);
  }
  function confirmarClaveAsesor() {
    if (claveEmpresaInput === CLAVE_ASESOR) {
      const nuevaSesion = { tipo: "asesor" };
      guardar("eco_radar_sesion", nuevaSesion);
      setSesion(nuevaSesion);
    } else setErrorLogin("Clave de asesor incorrecta.");
  }
  function cerrarSesion() {
    localStorage.removeItem("eco_radar_sesion");
    setSesion(null); setPaso("selector"); setEmpresaEnProceso(null);
    setClaveEmpresaInput(""); setLoginCodigo(""); setLoginClave(""); setErrorLogin("");
    setEmpresaAsesorViendo(null); setModulo("resumen");
  }

  const usuarioActual = sesion?.tipo === "usuario" ? personas.find(p => p.id === sesion.usuarioId) : null;
  const rolActual = sesion?.tipo === "asesor" ? "Asesor" : (usuarioActual ? usuarioActual.rol : null);
  const esCodigoDirectora = usuarioActual?.codigo === "directora";
  const esAdmin = rolActual === ROL_DIRECTORA || rolActual === "Asesor" || esCodigoDirectora;
  const accesoPermitido = rolActual ? accesoPorRol(rolActual, esCodigoDirectora) : [];

  useEffect(() => { if (rolActual && !accesoPermitido.includes(modulo)) setModulo(accesoPermitido[0]); /* eslint-disable-next-line */ }, [rolActual]);

  const enWorkspace = (sesion?.tipo === "usuario") || (sesion?.tipo === "asesor" && empresaAsesorViendo === "comunicacion_gad");
  const nombreVisible = usuarioActual ? usuarioActual.nombre : "Asesor";

  const tareasVisibles = esAdmin ? tareas : tareas.filter(t => t.responsable === nombreVisible);
  const metasPropias = esAdmin ? metas : metas.filter(m => m.persona === nombreVisible);
  const turnosVisibles = esAdmin ? turnos : turnos.filter(t => t.persona === nombreVisible);
  const proyectosVisibles = esAdmin ? proyectos : proyectos.filter(p => p.encargado === nombreVisible || p.entregables.some(e => e.responsable === nombreVisible));
  const rankingOrdenado = useMemo(() => [...metas].sort((a, b) => cumplimiento(b) - cumplimiento(a)), [metas]);
  const cuentasEnAlerta = cuentas.filter(c => TIPOS_CUENTA_NEGATIVOS.includes(c.tipo)).length;
  const tareasCompletadasHoy = tareasVisibles.filter(t => t.estado === "Completado").length;

  /* ---- formularios ---- */
  const [filtroArea, setFiltroArea] = useState("Todas");
  const [mostrarFormTarea, setMostrarFormTarea] = useState(false);
  const personasEquipo = personas.filter(p => p.rol !== ROL_DIRECTORA && p.rol !== "Asesor");
  const [nuevaTarea, setNuevaTarea] = useState({ tarea: "", responsable: "", prioridad: "Media", area: AREAS[0], frecuencia: "Específica", dia: "Lunes" });
  function agregarTarea() {
    if (!nuevaTarea.tarea.trim() || !nuevaTarea.responsable) return;
    const vence = nuevaTarea.frecuencia === "Frecuente" ? `Cada ${nuevaTarea.dia}` : "Sin definir";
    setTareas([{ id: Date.now(), tarea: nuevaTarea.tarea, responsable: nuevaTarea.responsable, prioridad: nuevaTarea.prioridad, estado: "Pendiente", vence, area: nuevaTarea.area, frecuencia: nuevaTarea.frecuencia, dia: nuevaTarea.dia }, ...tareas]);
    setNuevaTarea({ tarea: "", responsable: "", prioridad: "Media", area: AREAS[0], frecuencia: "Específica", dia: "Lunes" });
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

  const [mostrarFormTurno, setMostrarFormTurno] = useState(false);
  const [nuevoTurno, setNuevoTurno] = useState({ persona: "", dia: "Lunes", horaInicio: "08:00", horaFin: "16:00" });
  function agregarTurno() {
    if (!nuevoTurno.persona) return;
    setTurnos([{ id: Date.now(), ...nuevoTurno }, ...turnos]);
    setMostrarFormTurno(false);
  }
  function eliminarTurno(id) { setTurnos(turnos.filter(t => t.id !== id)); }

  const [mostrarFormMeta, setMostrarFormMeta] = useState(false);
  const [nuevaMeta, setNuevaMeta] = useState({ persona: "", entregable: "", metaHoy: 1, metaSemana: 5, area: AREAS[0] });
  function agregarMeta() {
    if (!nuevaMeta.entregable.trim() || !nuevaMeta.persona) return;
    setMetas([{ id: Date.now(), persona: nuevaMeta.persona, rol: (personas.find(p => p.nombre === nuevaMeta.persona) || {}).rol || "", entregable: nuevaMeta.entregable, metaHoy: Number(nuevaMeta.metaHoy) || 1, avanceHoy: 0, metaSemana: Number(nuevaMeta.metaSemana) || 1, avanceSemana: 0, area: nuevaMeta.area }, ...metas]);
    setNuevaMeta({ persona: "", entregable: "", metaHoy: 1, metaSemana: 5, area: AREAS[0] });
    setMostrarFormMeta(false);
  }
  function alimentarMeta(id, campo) { setMetas(metas.map(m => m.id === id ? { ...m, [campo]: m[campo] + 1 } : m)); }
  function eliminarMeta(id) { setMetas(metas.filter(m => m.id !== id)); }

  const [mostrarFormProyecto, setMostrarFormProyecto] = useState(false);
  const [nuevoProyecto, setNuevoProyecto] = useState({ nombre: "", tipo: "Transversal", direccion: "", encargado: "", fechaConvocatoria: "", fechaLevantamiento: "", fechaEntrega: "" });
  function agregarProyecto() {
    if (!nuevoProyecto.nombre.trim()) return;
    setProyectos([{ id: Date.now(), ...nuevoProyecto, avanceManual: 0, entregables: [] }, ...proyectos]);
    setNuevoProyecto({ nombre: "", tipo: "Transversal", direccion: "", encargado: "", fechaConvocatoria: "", fechaLevantamiento: "", fechaEntrega: "" });
    setMostrarFormProyecto(false);
  }
  function eliminarProyecto(id) { setProyectos(proyectos.filter(p => p.id !== id)); }
  function avanceProyecto(p) { return p.entregables.length ? Math.round((p.entregables.filter(e => e.completado).length / p.entregables.length) * 100) : p.avanceManual; }
  const [entregableForm, setEntregableForm] = useState({});
  function agregarEntregable(proyectoId) {
    const f = entregableForm[proyectoId];
    if (!f || !f.responsable) return;
    setProyectos(proyectos.map(p => p.id === proyectoId ? { ...p, entregables: [...p.entregables, { id: Date.now(), tipo: f.tipo || TIPOS_ENTREGABLE[0], responsable: f.responsable, fecha: f.fecha || "", completado: false }] } : p));
    setEntregableForm({ ...entregableForm, [proyectoId]: { tipo: TIPOS_ENTREGABLE[0], responsable: "", fecha: "" } });
  }
  function alternarEntregable(proyectoId, entregableId) {
    setProyectos(proyectos.map(p => p.id !== proyectoId ? p : { ...p, entregables: p.entregables.map(e => e.id === entregableId ? { ...e, completado: !e.completado } : e) }));
  }
  function eliminarEntregable(proyectoId, entregableId) {
    setProyectos(proyectos.map(p => p.id !== proyectoId ? p : { ...p, entregables: p.entregables.filter(e => e.id !== entregableId) }));
  }

  const [linkNuevo, setLinkNuevo] = useState("");
  const [tipoNuevaCuenta, setTipoNuevaCuenta] = useState("Atacante");
  function agregarCuenta() {
    if (!linkNuevo.trim()) return;
    const plataforma = detectarPlataforma(linkNuevo);
    const handleGenerado = "@" + (linkNuevo.split("/").filter(Boolean).pop() || "cuenta_nueva").slice(0, 20);
    const idNueva = Date.now();
    let url = linkNuevo.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setCuentas([{ id: idNueva, tipo: tipoNuevaCuenta, plataforma, handle: handleGenerado, link: url, estado: "En vivo" }, ...cuentas]);
    setLinkNuevo("");
  }
  function eliminarCuenta(id) { setCuentas(cuentas.filter(c => c.id !== id)); }
  function alternarCobertura(id) { setCobertura(cobertura.map(c => c.id === id ? { ...c, cargada: !c.cargada } : c)); }
  const [nuevoWeb, setNuevoWeb] = useState({ tipo: "Palabra clave Google", texto: "" });
  function agregarWeb() {
    if (!nuevoWeb.texto.trim()) return;
    const idNueva = Date.now();
    setWeb([{ id: idNueva, tipo: nuevoWeb.tipo, texto: nuevoWeb.texto, resultados: 0, revisado: "analizando…" }, ...web]);
    setNuevoWeb({ tipo: "Palabra clave Google", texto: "" });
    setTimeout(() => setWeb(prev => prev.map(w => w.id === idNueva ? { ...w, resultados: Math.round(Math.random() * 8), revisado: "hace instantes" } : w)), 1600);
  }
  function eliminarWeb(id) { setWeb(web.filter(w => w.id !== id)); }

  const [mostrarFormPersona, setMostrarFormPersona] = useState(false);
  const [nuevaPersona, setNuevaPersona] = useState({ nombre: "", codigo: "", clave: "", rol: rolesDisponibles[1] || rolesDisponibles[0], area: AREAS[0], modalidad: modalidadesDisponibles[0], jefeDirecto: "" });
  function agregarPersona() {
    if (!nuevaPersona.nombre.trim() || !nuevaPersona.codigo.trim()) return;
    setPersonas([...personas, { id: Date.now(), ...nuevaPersona, unidad: unidadActual, foto: "", horario: [], tareasFrecuentes: [] }]);
    setNuevaPersona({ nombre: "", codigo: "", clave: "", rol: rolesDisponibles[1] || rolesDisponibles[0], area: AREAS[0], modalidad: modalidadesDisponibles[0], jefeDirecto: "" });
    setMostrarFormPersona(false);
  }
  function eliminarPersona(id) { setPersonas(personas.filter(p => p.id !== id)); }

  const [nuevoRolTexto, setNuevoRolTexto] = useState("");
  function agregarRolNuevo() {
    const v = nuevoRolTexto.trim();
    if (!v || rolesDisponibles.includes(v)) return;
    setRolesDisponibles([...rolesDisponibles, v]);
    setNuevaPersona({ ...nuevaPersona, rol: v });
    setNuevoRolTexto("");
  }
  const [nuevaModalidadTexto, setNuevaModalidadTexto] = useState("");
  function agregarModalidadNueva() {
    const v = nuevaModalidadTexto.trim();
    if (!v || modalidadesDisponibles.includes(v)) return;
    setModalidadesDisponibles([...modalidadesDisponibles, v]);
    setNuevaPersona({ ...nuevaPersona, modalidad: v });
    setNuevaModalidadTexto("");
  }
  const [nuevaUnidadTexto, setNuevaUnidadTexto] = useState("");
  function agregarUnidadNueva() {
    const v = nuevaUnidadTexto.trim();
    if (!v || unidadesDisponibles.includes(v)) return;
    setUnidadesDisponibles([...unidadesDisponibles, v]);
    setUnidadActual(v);
    setNuevaUnidadTexto("");
  }

  const [fichaAbierta, setFichaAbierta] = useState(null);
  const [formHorario, setFormHorario] = useState({});
  const [formTareaFrec, setFormTareaFrec] = useState({});

  function subirFoto(personaId, file) {
    if (!file) return;
    const lector = new FileReader();
    lector.onload = () => setPersonas(prev => prev.map(p => p.id === personaId ? { ...p, foto: lector.result } : p));
    lector.readAsDataURL(file);
  }
  function agregarHorarioPersona(personaId) {
    const f = formHorario[personaId] || { dia: "Lunes", horaInicio: "08:00", horaFin: "16:00" };
    setPersonas(prev => prev.map(p => p.id === personaId ? { ...p, horario: [...(p.horario || []), { id: Date.now(), ...f }] } : p));
  }
  function eliminarHorarioPersona(personaId, itemId) {
    setPersonas(prev => prev.map(p => p.id !== personaId ? p : { ...p, horario: p.horario.filter(h => h.id !== itemId) }));
  }
  function agregarTareaFrecPersona(personaId) {
    const f = formTareaFrec[personaId];
    if (!f || !f.tarea || !f.tarea.trim()) return;
    setPersonas(prev => prev.map(p => p.id === personaId ? { ...p, tareasFrecuentes: [...(p.tareasFrecuentes || []), { id: Date.now(), dia: f.dia || "Lunes", tarea: f.tarea }] } : p));
    setFormTareaFrec({ ...formTareaFrec, [personaId]: { dia: "Lunes", tarea: "" } });
  }
  function eliminarTareaFrecPersona(personaId, itemId) {
    setPersonas(prev => prev.map(p => p.id !== personaId ? p : { ...p, tareasFrecuentes: p.tareasFrecuentes.filter(t => t.id !== itemId) }));
  }

  function descargarPlantillaExcel() {
    const filas = [
      { Nombre: "Ej. María Zambrano", Codigo: "002", Clave: "clave002", Rol: "Redactor", Area: "Institucional", Modalidad: "LOSEP", JefeDirecto: "Directora de Comunicación" },
    ];
    const hoja = XLSX.utils.json_to_sheet(filas);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Personas");
    XLSX.writeFile(libro, "plantilla-eco-radar-personas.xlsx");
  }
  function manejarSubidaExcel(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = (e) => {
      const datos = new Uint8Array(e.target.result);
      const libro = XLSX.read(datos, { type: "array" });
      const hoja = libro.Sheets[libro.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(hoja);
      const nuevas = filas.filter(f => f.Nombre && f.Codigo).map((f, i) => ({
        id: Date.now() + i,
        nombre: String(f.Nombre), codigo: String(f.Codigo), clave: String(f.Clave || f.Codigo),
        rol: String(f.Rol || "Miembro"), area: String(f.Area || AREAS[0]),
        modalidad: String(f.Modalidad || modalidadesDisponibles[0]), jefeDirecto: f.JefeDirecto ? String(f.JefeDirecto) : "",
        unidad: unidadActual, foto: "", horario: [], tareasFrecuentes: [],
      }));
      if (nuevas.length) {
        setPersonas(prev => [...prev, ...nuevas]);
        setRolesDisponibles(prevR => { const extra = nuevas.map(n => n.rol).filter(r => !prevR.includes(r)); return extra.length ? [...prevR, ...extra] : prevR; });
        setModalidadesDisponibles(prevM => { const extra = nuevas.map(n => n.modalidad).filter(m => !prevM.includes(m)); return extra.length ? [...prevM, ...extra] : prevM; });
      }
    };
    lector.readAsArrayBuffer(archivo);
    evento.target.value = "";
  }

  const personasUnidad = useMemo(() => personas.filter(p => (p.unidad || UNIDADES_SEED[0]) === unidadActual), [personas, unidadActual]);
  function construirArbol(lista) {
    const raices = lista.filter(p => !p.jefeDirecto || !lista.some(o => o.nombre === p.jefeDirecto));
    function hijosDe(nombre) { return lista.filter(p => p.jefeDirecto === nombre); }
    return { raices, hijosDe };
  }
  const arbolOrganigrama = useMemo(() => construirArbol(personasUnidad), [personasUnidad]);


  const diasDelMes = useMemo(() => {
    const year = 2026, month = 7;
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const inicioOffset = (primerDia.getDay() + 6) % 7;
    const celdas = [];
    for (let i = 0; i < inicioOffset; i++) celdas.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) celdas.push(new Date(year, month, d));
    return celdas;
  }, []);
  const [diaSeleccionado, setDiaSeleccionado] = useState(claveFecha(new Date(2026, 7, 31)));
  const [nuevoEvento, setNuevoEvento] = useState({ h: "", t: "" });
  function agregarEvento() {
    if (!nuevoEvento.t.trim()) return;
    setEventos(prev => ({ ...prev, [diaSeleccionado]: [...(prev[diaSeleccionado] || []), { h: nuevoEvento.h || "—", t: nuevoEvento.t }] }));
    setNuevoEvento({ h: "", t: "" });
  }

  function generarPdfCierre() {
    const doc = new jsPDF();
    const fecha = reloj.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    let y = 18;
    doc.setFontSize(16); doc.text("Eco Radar — Cierre del día", 14, y); y += 8;
    doc.setFontSize(10); doc.text("Comunicación GAD Manta · " + fecha, 14, y); y += 10;
    doc.setFontSize(12); doc.text("Tareas de hoy", 14, y); y += 6;
    doc.setFontSize(9);
    tareas.forEach(t => { doc.text(`- [${t.estado}] ${t.tarea} (${t.responsable})`, 14, y); y += 5; if (y > 275) { doc.addPage(); y = 18; } });
    if (tareas.length === 0) { doc.text("Sin tareas registradas hoy.", 14, y); y += 5; }
    y += 6; doc.setFontSize(12); doc.text("Metas diarias y semanales", 14, y); y += 6; doc.setFontSize(9);
    metas.forEach(m => { doc.text(`- ${m.persona}: ${m.entregable} — hoy ${m.avanceHoy}/${m.metaHoy}, semana ${m.avanceSemana}/${m.metaSemana} (${cumplimiento(m)}%)`, 14, y); y += 5; if (y > 275) { doc.addPage(); y = 18; } });
    if (metas.length === 0) { doc.text("Sin metas registradas.", 14, y); y += 5; }
    y += 6; doc.setFontSize(12); doc.text("Avance de proyectos de la semana", 14, y); y += 6; doc.setFontSize(9);
    proyectos.forEach(p => { doc.text(`- ${p.nombre} (${p.tipo}) — ${avanceProyecto(p)}% — semáforo: ${semaforoProyecto({ ...p, avance: avanceProyecto(p) })}`, 14, y); y += 5; if (y > 275) { doc.addPage(); y = 18; } });
    if (proyectos.length === 0) { doc.text("Sin proyectos registrados.", 14, y); y += 5; }
    doc.save(`cierre-eco-radar-${claveFecha(reloj)}.pdf`);
  }

  const distribucionCarga = useMemo(() => {
    const porPersona = {};
    metas.forEach(m => { porPersona[m.persona] = (porPersona[m.persona] || 0) + m.metaSemana; });
    const total = Object.values(porPersona).reduce((a, b) => a + b, 0);
    return Object.entries(porPersona).map(([persona, valor], i) => ({ persona, valor, pct: total > 0 ? Math.round((valor / total) * 100) : 0, color: `hsl(${(i * 67) % 360}, 55%, 50%)` }));
  }, [metas]);

  const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  if (vistaTV && enWorkspace) {
    return <ModoTV personas={personas} tareas={tareas} metas={metas} onSalir={() => setVistaTV(false)} />;
  }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

        .app {
          --bg: #F1F2F4; --bg-alt: #FFFFFF; --surface: #FFFFFF; --surface-2: #F5F6F8;
          --border: #E3E5E9; --border-strong: rgba(198,29,45,0.35);
          --rojo: #C61D2D; --rojo-soft: rgba(198,29,45,0.09);
          --plomo: #6B7280; --plomo-oscuro: #33383F;
          --steel: #3A6EA5; --success: #1E8E4F; --success-soft: rgba(30,142,79,0.10);
          --warning: #C17E00; --warning-soft: rgba(193,126,0,0.10);
          --danger: var(--rojo); --danger-soft: var(--rojo-soft);
          --text: #1C1F24; --muted: #6B7280; --dim: #9AA1AC;
          font-family: 'IBM Plex Sans', sans-serif; background: var(--bg); color: var(--text);
          display: flex; min-height: 100vh; height: 100%; position: relative;
        }
        .app * { box-sizing: border-box; }
        .app h1, .app h2, .app h3, .app .display { font-family: 'Newsreader', serif; }

        /* ---- pantallas de acceso ---- */
        .auth-pantalla { width: 100%; padding: 60px 40px; display: flex; flex-direction: column; align-items: center; overflow-y: auto; background: var(--bg); }
        .auth-marca { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .auth-marca .punto { width: 9px; height: 9px; border-radius: 50%; background: var(--rojo); }
        .auth-titulo { font-family: 'Newsreader', serif; font-size: 34px; color: var(--plomo-oscuro); }
        .auth-sub { color: var(--muted); font-size: 14px; margin-bottom: 40px; text-align: center; max-width: 480px; }
        .auth-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; max-width: 780px; }
        .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 20px 18px; cursor: pointer; text-align: left; }
        .auth-card:hover { border-color: var(--border-strong); box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
        .auth-card.bloqueada { cursor: not-allowed; opacity: 0.55; }
        .auth-card.bloqueada:hover { border-color: var(--border); box-shadow: none; }
        .auth-card .icono { width: 34px; height: 34px; border-radius: 7px; background: var(--rojo-soft); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
        .auth-card .icono svg { width: 17px; height: 17px; color: var(--rojo); }
        .auth-card .nombre { font-size: 15px; font-weight: 600; margin-bottom: 3px; display: flex; align-items: center; gap: 6px; }
        .auth-card .tipo { font-size: 11.5px; color: var(--dim); }
        .badge-proximamente { font-size: 9.5px; background: var(--surface-2); color: var(--dim); padding: 2px 7px; border-radius: 20px; border: 1px solid var(--border); }
        .auth-franja { margin-top: 34px; width: 100%; max-width: 780px; border: 1px solid var(--border-strong); background: var(--rojo-soft); border-radius: 8px; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .auth-franja:hover { background: rgba(198,29,45,0.15); }
        .auth-franja-texto .titulo { font-size: 14.5px; font-weight: 600; color: var(--rojo); margin-bottom: 3px; }
        .auth-franja-texto .sub { font-size: 12px; color: var(--muted); }
        .auth-box { width: 100%; max-width: 380px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 30px 28px; }
        .auth-box-icono { width: 40px; height: 40px; border-radius: 50%; background: var(--rojo-soft); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .auth-box-icono svg { width: 18px; height: 18px; color: var(--rojo); }
        .auth-box-titulo { text-align: center; font-size: 16px; font-weight: 600; margin-bottom: 4px; }
        .auth-box-sub { text-align: center; font-size: 12px; color: var(--dim); margin-bottom: 20px; }
        .auth-campo { margin-bottom: 12px; }
        .auth-campo label { font-size: 11px; color: var(--muted); display: block; margin-bottom: 5px; }
        .auth-campo input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13.5px; background: var(--surface-2); font-family: inherit; }
        .auth-campo input:focus { outline: none; border-color: var(--rojo); }
        .auth-error { font-size: 11.5px; color: var(--rojo); margin-bottom: 10px; }
        .auth-btn { width: 100%; padding: 11px; border-radius: 6px; background: var(--rojo); color: #fff; border: none; font-size: 13.5px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .auth-btn:hover { background: #A6182A; }
        .auth-volver { text-align: center; font-size: 11.5px; color: var(--dim); margin-top: 14px; cursor: pointer; }

        /* ---- sidebar ---- */
        .sidebar { width: 216px; flex-shrink: 0; background: var(--bg-alt); border-right: 1px solid var(--border); padding: 22px 14px; display: flex; flex-direction: column; gap: 18px; }
        .marca { display: flex; align-items: center; gap: 10px; padding: 0 8px; }
        .marca .punto { width: 9px; height: 9px; border-radius: 50%; background: var(--rojo); }
        .marca-texto { font-family: 'Newsreader', serif; font-size: 20px; color: var(--plomo-oscuro); }
        .marca-sub { font-size: 10.5px; color: var(--dim); margin-top: -2px; }
        .empresa-actual { padding: 9px 10px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; }
        .empresa-actual .nombre { font-size: 12.5px; font-weight: 600; }
        .empresa-actual .usuario { font-size: 11px; color: var(--muted); margin-top: 2px; }
        .empresa-actual .cerrar { font-size: 10.5px; color: var(--rojo); cursor: pointer; display: flex; align-items: center; gap: 4px; margin-top: 6px; }
        .empresa-actual .cerrar svg { width: 11px; height: 11px; }
        .navlist { display: flex; flex-direction: column; gap: 3px; }
        .navitem { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; color: var(--muted); font-size: 13.5px; cursor: pointer; border-left: 2px solid transparent; background: transparent; }
        .navitem:hover { background: var(--surface-2); color: var(--text); }
        .navitem.activo { background: var(--rojo-soft); color: var(--rojo); border-left: 2px solid var(--rojo); }
        .navitem svg { width: 16px; height: 16px; flex-shrink: 0; }
        .sidebar-footer { margin-top: auto; padding-top: 10px; border-top: 1px solid var(--border); }
        .btn-tv { width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 9px; border-radius: 6px; background: var(--plomo-oscuro); color: #fff; font-size: 12.5px; cursor: pointer; border: none; font-family: inherit; }
        .btn-tv svg { width: 14px; height: 14px; }

        /* ---- main ---- */
        .main { flex: 1; overflow-y: auto; padding: 26px 32px 40px; }
        .topbar { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 18px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
        .titulo-modulo { font-size: 26px; font-weight: 500; color: var(--plomo-oscuro); }
        .subtitulo-modulo { color: var(--muted); font-size: 13px; margin-top: 3px; }
        .reloj { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 13px; }
        .reloj svg { width: 14px; height: 14px; }

        .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
        .kpi { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 16px 18px; }
        .kpi-valor { font-family: 'Newsreader', serif; font-size: 32px; line-height: 1; }
        .kpi-label { color: var(--muted); font-size: 12px; margin-top: 8px; }
        .kpi.acento-rojo { border-top: 2px solid var(--rojo); }
        .kpi.acento-exito { border-top: 2px solid var(--success); }
        .kpi.acento-acero { border-top: 2px solid var(--steel); }
        .kpi.acento-plomo { border-top: 2px solid var(--plomo); }

        .grid-dos { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; align-items: start; }
        .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 18px 20px; margin-bottom: 18px; }
        .panel-titulo { font-size: 15px; font-weight: 600; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .panel-titulo .ver-mas { font-size: 11.5px; color: var(--dim); font-weight: 400; }

        .fila-persona { display: flex; align-items: center; gap: 11px; padding: 9px 0; border-bottom: 1px solid var(--border); }
        .fila-persona:last-child { border-bottom: none; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--surface-2); display: flex; align-items: center; justify-content: center; font-size: 11.5px; font-weight: 600; color: var(--muted); flex-shrink: 0; border: 1px solid var(--border); }
        .persona-nombre { font-size: 13.5px; font-weight: 500; }
        .persona-tarea { font-size: 12px; color: var(--muted); }
        .estado-texto { font-size: 11px; color: var(--muted); margin-left: auto; white-space: nowrap; }

        .alerta { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .alerta:last-child { border-bottom: none; }
        .alerta svg { width: 15px; height: 15px; color: var(--rojo); flex-shrink: 0; margin-top: 1px; }
        .alerta-texto { font-size: 12.5px; }
        .alerta-hora { font-size: 11px; color: var(--dim); }

        .barra-fila { margin-bottom: 13px; }
        .barra-cab { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; }
        .barra-cab .num { color: var(--muted); font-variant-numeric: tabular-nums; }
        .barra-fondo { height: 6px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; }
        .barra-relleno { height: 100%; background: var(--rojo); border-radius: 3px; }

        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 5px; font-size: 12.5px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); font-family: inherit; }
        .btn svg { width: 13px; height: 13px; }
        .btn:hover { border-color: var(--border-strong); }
        .btn-primario { background: var(--rojo); border-color: var(--rojo); color: #fff; }
        .btn-primario:hover { background: #A6182A; }
        .btn-sm { padding: 5px 10px; font-size: 11.5px; }

        table.tabla { width: 100%; border-collapse: collapse; font-size: 12.8px; }
        table.tabla th { text-align: left; color: var(--dim); font-weight: 500; font-size: 11px; letter-spacing: 0.3px; padding: 0 10px 8px; border-bottom: 1px solid var(--border); }
        table.tabla td { padding: 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        table.tabla tr:last-child td { border-bottom: none; }
        .etiqueta { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 500; }
        .etq-alta { background: var(--rojo-soft); color: var(--rojo); }
        .etq-media { background: var(--warning-soft); color: var(--warning); }
        .etq-baja { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }
        .etq-pendiente { background: var(--surface-2); color: var(--muted); border: 1px solid var(--border); }
        .etq-progreso { background: rgba(58,110,165,0.10); color: var(--steel); }
        .etq-completado { background: var(--success-soft); color: var(--success); }
        .etq-cuenta-atacante { background: var(--rojo-soft); color: var(--rojo); }
        .fila-clic { cursor: pointer; }
        .semaforo-punto { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
        .semaforo-punto.rojo { background: var(--rojo); }
        .semaforo-punto.amarillo { background: var(--warning); }
        .semaforo-punto.verde { background: var(--success); }

        .sent-alto { color: var(--success); }
        .sent-medio { color: var(--warning); }
        .sent-bajo { color: var(--rojo); }

        .form-inline { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .form-inline input, .form-inline select { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); font-size: 12.5px; padding: 8px 10px; border-radius: 5px; font-family: inherit; }
        .form-inline input[type=text] { flex: 1; min-width: 160px; }
        .form-inline input[type=number] { width: 70px; }
        .form-inline input[type=time], .form-inline input[type=date] { min-width: 130px; }

        .chips { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 18px; }
        .chip { padding: 5px 12px; border-radius: 20px; font-size: 11.5px; border: 1px solid var(--border); color: var(--muted); cursor: pointer; background: var(--surface); }
        .chip.activo { background: var(--rojo-soft); border-color: var(--border-strong); color: var(--rojo); }
        .chip-sugerencia { padding: 5px 11px; border-radius: 20px; font-size: 11px; border: 1px dashed var(--border); color: var(--muted); cursor: pointer; background: var(--surface-2); }
        .chip-sugerencia:hover { border-color: var(--border-strong); color: var(--rojo); }

        .tarjeta-cuenta { display: flex; align-items: center; gap: 12px; padding: 13px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; margin-bottom: 10px; }
        .tarjeta-cuenta .icono-plat { width: 30px; height: 30px; border-radius: 6px; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
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
        .cal-celda.hoy { border-color: var(--border-strong); color: var(--rojo); }
        .cal-celda.seleccionado { background: var(--rojo-soft); color: var(--rojo); border-color: var(--border-strong); }
        .cal-punto-evento { width: 4px; height: 4px; border-radius: 50%; background: var(--steel); }
        .evento-fila { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; }
        .evento-hora { color: var(--rojo); font-variant-numeric: tabular-nums; width: 40px; flex-shrink: 0; }

        .switch { width: 30px; height: 17px; border-radius: 20px; background: var(--surface-2); border: 1px solid var(--border); position: relative; cursor: pointer; flex-shrink: 0; }
        .switch.on { background: var(--rojo-soft); border-color: var(--border-strong); }
        .switch .bolita { width: 12px; height: 12px; border-radius: 50%; background: var(--dim); position: absolute; top: 1px; left: 1px; transition: left 0.15s; }
        .switch.on .bolita { left: 14px; background: var(--rojo); }

        .toast { position: fixed; bottom: 20px; right: 20px; background: var(--surface); border: 1px solid var(--border-strong); padding: 12px 16px; border-radius: 6px; font-size: 12.5px; display: flex; align-items: center; gap: 8px; color: var(--text); box-shadow: 0 4px 14px rgba(0,0,0,0.08); }
        .toast svg { width: 15px; height: 15px; color: var(--success); }
        .aviso-simulado { font-size: 11px; color: var(--dim); margin-top: 8px; font-style: italic; }
        .campo-vacio { color: var(--dim); font-size: 12.5px; padding: 14px 0; text-align: center; }

        .meta-card { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; margin-bottom: 10px; }
        .meta-cab { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .meta-persona { font-size: 13.5px; font-weight: 600; }
        .meta-rol { font-size: 11.5px; color: var(--dim); }
        .meta-entregable { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .meta-progresos { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .meta-progreso-fila { display: flex; align-items: center; gap: 8px; }
        .meta-progreso-fila .barra-fondo { flex: 1; }
        .meta-boton-mas { width: 22px; height: 22px; border-radius: 5px; background: var(--surface-2); border: 1px solid var(--border); color: var(--rojo); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; flex-shrink: 0; }
        .meta-boton-mas:hover { border-color: var(--border-strong); }

        .distribucion-barra { height: 22px; border-radius: 5px; overflow: hidden; display: flex; border: 1px solid var(--border); margin-bottom: 12px; }
        .distribucion-leyenda { display: flex; flex-wrap: wrap; gap: 10px; }
        .distribucion-item { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--muted); }
        .distribucion-punto { width: 8px; height: 8px; border-radius: 50%; }

        .ranking-fila { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .ranking-fila:last-child { border-bottom: none; }
        .ranking-pos { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; background: var(--surface-2); color: var(--muted); flex-shrink: 0; border: 1px solid var(--border); }
        .ranking-pos.top1 { background: var(--rojo-soft); color: var(--rojo); border-color: var(--border-strong); }
        .ranking-fila-info { flex: 1; }
        .ranking-nombre { font-size: 13.5px; font-weight: 500; }
        .ranking-detalle { font-size: 11.5px; color: var(--dim); }
        .ranking-cumplimiento { font-family: 'Newsreader', serif; font-size: 22px; width: 60px; text-align: right; }

        .cobertura-fila { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .cobertura-fila:last-child { border-bottom: none; }
        .cobertura-icono { width: 28px; height: 28px; border-radius: 6px; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .cobertura-icono svg { width: 14px; height: 14px; color: var(--muted); }
        .cobertura-nombre { font-size: 13px; font-weight: 500; flex: 1; }

        .web-fila { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border); }
        .web-fila:last-child { border-bottom: none; }
        .web-fila svg { width: 15px; height: 15px; color: var(--steel); flex-shrink: 0; }
        .web-texto { font-size: 13px; font-weight: 500; }
        .web-tipo { font-size: 11px; color: var(--dim); }

        /* ---- proyectos ---- */
        .proyecto-card { background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--dim); border-radius: 6px; padding: 16px 18px; margin-bottom: 14px; }
        .proyecto-card.rojo { border-left-color: var(--rojo); }
        .proyecto-card.amarillo { border-left-color: var(--warning); }
        .proyecto-card.verde { border-left-color: var(--success); }
        .proyecto-cab { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .proyecto-nombre { font-size: 15px; font-weight: 600; }
        .proyecto-meta { font-size: 11.5px; color: var(--dim); margin-top: 3px; }
        .proyecto-avance-num { font-family: 'Newsreader', serif; font-size: 24px; }
        .proyecto-entregables { margin-top: 12px; border-top: 1px solid var(--border); padding-top: 10px; }
        .entregable-fila { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 12.5px; }
        .entregable-check { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--border); cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .entregable-check.completado { background: var(--success); border-color: var(--success); color: #fff; }
        .entregable-texto.completado { text-decoration: line-through; color: var(--dim); }

        /* ---- modal visor de perfil ---- */
        .modal-overlay { position: absolute; inset: 0; background: rgba(20,22,25,0.55); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 30px; }
        .modal-feed { width: 100%; max-width: 500px; height: 100%; max-height: 720px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
        .modal-feed-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .modal-feed-header-info { display: flex; align-items: center; gap: 10px; }
        .modal-feed-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .modal-feed-avatar svg { width: 15px; height: 15px; color: var(--muted); }
        .modal-feed-nombre { font-size: 13.5px; font-weight: 600; }
        .modal-feed-sub { font-size: 11px; color: var(--dim); }
        .modal-feed-cerrar { width: 17px; height: 17px; color: var(--muted); cursor: pointer; }
        .modal-feed-body { flex: 1; overflow-y: auto; }
        .modal-feed-footer { padding: 10px 18px; border-top: 1px solid var(--border); font-size: 10.5px; color: var(--dim); font-style: italic; flex-shrink: 0; }

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

        /* ---- modo TV ---- */
        .tv-pantalla { width: 100%; min-height: 100vh; background: #0A0C10; color: #fff; font-family: 'IBM Plex Sans', sans-serif; padding: 26px 40px 40px; }
        .tv-topbar { display: flex; align-items: center; justify-content: space-between; padding-bottom: 18px; border-bottom: 2px solid #C61D2D; margin-bottom: 30px; }
        .tv-marca { font-family: 'Newsreader', serif; font-size: 22px; display: flex; align-items: center; gap: 10px; }
        .tv-punto { width: 10px; height: 10px; border-radius: 50%; background: #C61D2D; }
        .tv-slides-dots { display: flex; gap: 8px; }
        .tv-dot { width: 8px; height: 8px; border-radius: 50%; background: #333; }
        .tv-dot.activo { background: #C61D2D; }
        .tv-salir { font-size: 12px; color: #888; cursor: pointer; border: 1px solid #333; padding: 5px 12px; border-radius: 20px; }
        .tv-titulo-slide { font-family: 'Newsreader', serif; font-size: 36px; margin-bottom: 26px; }
        .tv-grid-personas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .tv-tarjeta { background: #14171C; border: 1px solid #23262C; border-radius: 10px; padding: 18px; }
        .tv-tarjeta-nombre { font-size: 18px; font-weight: 600; }
        .tv-tarjeta-rol { font-size: 12px; color: #888; margin-bottom: 12px; }
        .tv-tarea-fila { font-size: 13.5px; padding: 6px 0; border-top: 1px solid #23262C; }
        .tv-semaforo { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 8px; }
        .tv-semaforo.rojo { background: #E2544A; }
        .tv-semaforo.amarillo { background: #E0A93C; }
        .tv-semaforo.verde { background: #4CAF6D; }
        .tv-tarea-estado { color: #777; font-size: 11.5px; }
        .tv-sin-datos { color: #555; font-size: 13px; padding: 10px 0; }
        .tv-grid-metas { display: flex; flex-direction: column; gap: 18px; max-width: 900px; }
        .tv-meta-fila { display: flex; align-items: center; gap: 16px; }
        .tv-meta-persona { width: 260px; font-size: 15px; flex-shrink: 0; }
        .tv-meta-entregable { color: #888; font-size: 12px; }
        .tv-meta-barra-fondo { flex: 1; height: 14px; background: #1C1F24; border-radius: 7px; overflow: hidden; }
        .tv-meta-barra-relleno { height: 100%; background: #C61D2D; }
        .tv-meta-num { width: 70px; text-align: right; font-family: 'Newsreader', serif; font-size: 18px; }
        .tv-ranking { max-width: 700px; }
        .tv-ranking-fila { display: flex; align-items: center; gap: 20px; padding: 14px 0; border-bottom: 1px solid #23262C; }
        .tv-ranking-pos { width: 40px; height: 40px; border-radius: 50%; background: #14171C; border: 1px solid #23262C; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; }
        .tv-ranking-pos.oro { background: #4a3a10; border-color: #C9A227; color: #E7C866; }
        .tv-ranking-pos.plata { background: #2c2f33; border-color: #9aa1ac; color: #d6dade; }
        .tv-ranking-pos.bronce { background: #3a2a1c; border-color: #a05a2c; color: #d68f56; }
        .tv-ranking-nombre { flex: 1; font-size: 20px; }
        .tv-ranking-pct { font-family: 'Newsreader', serif; font-size: 28px; color: #C61D2D; }

        /* ---- RRHH: organigrama y fichas ---- */
        .organigrama { display: flex; gap: 40px; padding: 10px 20px; justify-content: center; overflow-x: auto; }
        .organigrama-rama { display: flex; flex-direction: column; align-items: center; }
        .organigrama-hijos { display: flex; gap: 24px; margin-top: 22px; position: relative; }
        .organigrama-hijos::before { content: ""; position: absolute; top: -22px; left: 50%; width: 1px; height: 22px; background: var(--border); }
        .organigrama-caja { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 14px 18px; text-align: center; min-width: 130px; }
        .organigrama-avatar { width: 46px; height: 46px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; overflow: hidden; font-size: 13px; font-weight: 600; color: var(--muted); }
        .organigrama-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .organigrama-nombre { font-size: 12.5px; font-weight: 600; }
        .organigrama-rol { font-size: 10.5px; color: var(--dim); }

        .ficha-card { border: 1px solid var(--border); border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
        .ficha-cab { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
        .ficha-avatar { position: relative; width: 42px; height: 42px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: var(--muted); cursor: pointer; overflow: hidden; flex-shrink: 0; }
        .ficha-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .ficha-avatar-editar { position: absolute; bottom: -2px; right: -2px; width: 16px; height: 16px; border-radius: 50%; background: var(--rojo); display: flex; align-items: center; justify-content: center; }
        .ficha-avatar-editar svg { width: 9px; height: 9px; color: #fff; }
        .ficha-nombre { font-size: 13.5px; font-weight: 600; }
        .ficha-meta { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
        .ficha-detalle { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 14px; border-top: 1px solid var(--border); background: var(--surface-2); }
        .ficha-subtitulo { font-size: 11.5px; font-weight: 600; color: var(--muted); display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .ficha-item-fila { display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding: 5px 0; border-bottom: 1px solid var(--border); }

        .sin-conexion { padding: 40px 30px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .sin-conexion-icono { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }
        .sin-conexion-icono svg { width: 20px; height: 20px; }
        .sin-conexion-titulo { font-size: 15px; font-weight: 600; }
        .sin-conexion-texto { font-size: 12.5px; color: var(--muted); line-height: 1.5; max-width: 340px; }
        .visor-en-vivo { display: flex; flex-direction: column; }
        .visor-en-vivo iframe { display: block; }
        .visor-nota { font-size: 10.5px; color: var(--dim); font-style: italic; padding: 10px 14px; border-top: 1px solid var(--border); }
      `}</style>

      {/* -------- flujo de acceso -------- */}
      {!sesion && paso === "selector" && (
        <div className="auth-pantalla">
          <div className="auth-marca"><span className="punto" /><div className="auth-titulo">ECO RADAR</div></div>
          <div className="auth-sub">Elige la empresa que vas a gestionar. Cada equipo entra con su propio código y contraseña.</div>
          <div className="auth-grid">
            {EMPRESAS.map(e => (
              <button key={e.id} className={"auth-card" + (!e.activa ? " bloqueada" : "")} onClick={() => iniciarSesionEmpresa(e.id)}>
                <div className="icono">{e.activa ? <Building2 /> : <Lock />}</div>
                <div className="nombre">{e.nombre}</div>
                <div className="tipo">{e.tipo}</div>
                {!e.activa && <div style={{ marginTop: 8 }}><span className="badge-proximamente">Próximamente</span></div>}
              </button>
            ))}
          </div>
          <div className="auth-franja" onClick={() => { setErrorLogin(""); setClaveEmpresaInput(""); setPaso("clave-asesor"); }}>
            <div className="auth-franja-texto">
              <div className="titulo">Entrar como Asesor</div>
              <div className="sub">Ver el trabajo y el cumplimiento de todas las empresas que usan el sistema</div>
            </div>
            <Eye style={{ width: 20, height: 20, color: "var(--rojo)" }} />
          </div>
        </div>
      )}

      {!sesion && paso === "clave-empresa" && (
        <div className="auth-pantalla" style={{ justifyContent: "center", minHeight: "100vh" }}>
          <div className="auth-box">
            <div className="auth-box-icono"><Lock /></div>
            <div className="auth-box-titulo">{EMPRESAS.find(e => e.id === empresaEnProceso)?.nombre}</div>
            <div className="auth-box-sub">Ingresa la clave de acceso de la empresa</div>
            <div className="auth-campo">
              <label>Clave de empresa</label>
              <input type="password" value={claveEmpresaInput} onChange={e => setClaveEmpresaInput(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmarClaveEmpresa()} />
            </div>
            {errorLogin && <div className="auth-error">{errorLogin}</div>}
            <button className="auth-btn" onClick={confirmarClaveEmpresa}>Continuar</button>
            <div className="auth-volver" onClick={() => { setPaso("selector"); setErrorLogin(""); setClaveEmpresaInput(""); }}>← Volver</div>
          </div>
        </div>
      )}

      {!sesion && paso === "login-usuario" && (
        <div className="auth-pantalla" style={{ justifyContent: "center", minHeight: "100vh" }}>
          <div className="auth-box">
            <div className="auth-box-icono"><KeyRound /></div>
            <div className="auth-box-titulo">Tu acceso personal</div>
            <div className="auth-box-sub">{EMPRESAS.find(e => e.id === empresaEnProceso)?.nombre} · con tu código y clave</div>
            <div className="auth-campo"><label>Código</label><input type="text" value={loginCodigo} onChange={e => setLoginCodigo(e.target.value)} placeholder="ej. 001" /></div>
            <div className="auth-campo"><label>Clave</label><input type="password" value={loginClave} onChange={e => setLoginClave(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmarLoginUsuario()} /></div>
            {errorLogin && <div className="auth-error">{errorLogin}</div>}
            <button className="auth-btn" onClick={confirmarLoginUsuario}>Entrar</button>
            <div className="aviso-simulado" style={{ textAlign: "center", marginTop: 10 }}>Este equipo va a recordar tu sesión — no tendrás que volver a escribir tu clave aquí, hasta que cierres sesión.</div>
            <div className="auth-volver" onClick={() => { setPaso("clave-empresa"); setErrorLogin(""); }}>← Volver</div>
          </div>
        </div>
      )}

      {!sesion && paso === "clave-asesor" && (
        <div className="auth-pantalla" style={{ justifyContent: "center", minHeight: "100vh" }}>
          <div className="auth-box">
            <div className="auth-box-icono"><Eye /></div>
            <div className="auth-box-titulo">Acceso de Asesor</div>
            <div className="auth-box-sub">Ver todas las empresas del sistema</div>
            <div className="auth-campo"><label>Clave de asesor</label><input type="password" value={claveEmpresaInput} onChange={e => setClaveEmpresaInput(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmarClaveAsesor()} /></div>
            {errorLogin && <div className="auth-error">{errorLogin}</div>}
            <button className="auth-btn" onClick={confirmarClaveAsesor}>Entrar</button>
            <div className="auth-volver" onClick={() => { setPaso("selector"); setErrorLogin(""); setClaveEmpresaInput(""); }}>← Volver</div>
          </div>
        </div>
      )}

      {sesion?.tipo === "asesor" && !empresaAsesorViendo && (
        <div className="auth-pantalla">
          <div className="auth-marca"><span className="punto" /><div className="auth-titulo">Vista de Asesor</div></div>
          <div className="auth-sub">Cumplimiento y actividad de todas las empresas del sistema.</div>
          <div className="auth-grid">
            {EMPRESAS.map(e => {
              const s = hashSeed(e.id);
              const activa = e.activa;
              return (
                <button key={e.id} className={"auth-card" + (!activa ? " bloqueada" : "")} onClick={() => activa && setEmpresaAsesorViendo(e.id)}>
                  <div className="icono">{activa ? <Building2 /> : <Lock />}</div>
                  <div className="nombre">{e.nombre}</div>
                  <div className="tipo">{e.tipo}</div>
                  {activa ? (
                    <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--muted)" }}>{rankingOrdenado.length ? cumplimiento(rankingOrdenado[0]) : 0}% mejor cumplimiento</div>
                  ) : <div style={{ marginTop: 8 }}><span className="badge-proximamente">Sin actividad aún</span></div>}
                </button>
              );
            })}
          </div>
          <div className="auth-volver" style={{ marginTop: 24 }} onClick={cerrarSesion}>← Salir del modo asesor</div>
        </div>
      )}

      {enWorkspace && (
        <>
          <aside className="sidebar">
            <div className="marca"><span className="punto" /><div><div className="marca-texto">ECO RADAR</div><div className="marca-sub">Comunicación integral</div></div></div>
            <div className="empresa-actual">
              <div className="nombre">Comunicación GAD Manta</div>
              <div className="usuario">{nombreVisible} · {rolActual}</div>
              <div className="cerrar" onClick={cerrarSesion}><LogOut /> Cerrar sesión</div>
            </div>
            <nav className="navlist">
              {NAV.filter(n => accesoPermitido.includes(n.id)).map(item => (
                <div key={item.id} className={"navitem" + (modulo === item.id ? " activo" : "")} onClick={() => setModulo(item.id)}>
                  <item.icon />{item.label}
                </div>
              ))}
            </nav>
            {esAdmin && (
              <div className="sidebar-footer">
                <button className="btn-tv" onClick={() => setVistaTV(true)}><Tv /> Modo TV</button>
              </div>
            )}
          </aside>

          <main className="main">
            <div className="topbar">
              <div>
                <h1 className="titulo-modulo">{NAV.find(n => n.id === modulo)?.label}</h1>
                <div className="subtitulo-modulo">Comunicación GAD Manta · {rolActual}</div>
              </div>
              <div className="reloj"><Clock />{reloj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })} · {reloj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>

            {modulo === "resumen" && (
              <>
                <div className="kpis">
                  <div className="kpi acento-exito"><div className="kpi-valor">{tareasCompletadasHoy}/{tareasVisibles.length}</div><div className="kpi-label">Tareas completadas hoy</div></div>
                  <div className="kpi acento-rojo"><div className="kpi-valor">{rankingOrdenado.length ? cumplimiento(rankingOrdenado[0]) : 0}%</div><div className="kpi-label">Mejor cumplimiento del equipo</div></div>
                  <div className="kpi acento-acero"><div className="kpi-valor">{proyectosVisibles.length}</div><div className="kpi-label">Proyectos activos</div></div>
                  <div className="kpi acento-plomo"><div className="kpi-valor">{cuentasEnAlerta}</div><div className="kpi-label">Cuentas hostiles monitoreadas</div></div>
                </div>
                <div className="grid-dos">
                  <div>
                    <div className="panel">
                      <div className="panel-titulo">Proyectos en semáforo rojo <span className="ver-mas" onClick={() => setModulo("proyectos")} style={{ cursor: "pointer" }}>ver proyectos →</span></div>
                      {proyectosVisibles.filter(p => semaforoProyecto({ ...p, avance: avanceProyecto(p) }) === "rojo").map(p => (
                        <div className="alerta" key={p.id}><AlertTriangle /><div><div className="alerta-texto"><strong>{p.nombre}</strong> — {avanceProyecto(p)}% de avance</div><div className="alerta-hora">Entrega: {p.fechaEntrega || "sin definir"}</div></div></div>
                      ))}
                      {proyectosVisibles.filter(p => semaforoProyecto({ ...p, avance: avanceProyecto(p) }) === "rojo").length === 0 && <div className="campo-vacio">Ningún proyecto en rojo por ahora.</div>}
                    </div>
                    <div className="panel">
                      <div className="panel-titulo">Equipo <span className="ver-mas" onClick={() => setModulo("equipo")} style={{ cursor: "pointer" }}>ver equipo →</span></div>
                      {personasEquipo.map(p => (
                        <div className="fila-persona" key={p.id}><div className="avatar">{p.nombre.split(" ").map(x => x[0]).slice(0, 2).join("")}</div><div><div className="persona-nombre">{p.nombre}</div><div className="persona-tarea">{p.rol} · {p.area}</div></div></div>
                      ))}
                      {personasEquipo.length === 0 && <div className="campo-vacio">Aún no hay personas agregadas al equipo.</div>}
                    </div>
                  </div>
                  <div>
                    <div className="panel">
                      <div className="panel-titulo">Cuentas hostiles por revisar</div>
                      {cuentas.filter(c => TIPOS_CUENTA_NEGATIVOS.includes(c.tipo)).slice(0, 4).map(c => (
                        <div className="alerta" key={c.id}><AlertTriangle /><div><div className="alerta-texto"><strong>{c.handle}</strong> ({c.plataforma}) — {c.tipo}</div><div className="alerta-hora">Sin conexión real todavía, clic para más detalle</div></div></div>
                      ))}
                      {cuentas.filter(c => TIPOS_CUENTA_NEGATIVOS.includes(c.tipo)).length === 0 && <div className="campo-vacio">Sin cuentas hostiles monitoreadas aún.</div>}
                    </div>
                    <div className="panel">
                      <div className="panel-titulo">Top 3 del ranking <span className="ver-mas" onClick={() => setModulo("ranking")} style={{ cursor: "pointer" }}>ver todo →</span></div>
                      {rankingOrdenado.slice(0, 3).map((m, i) => (
                        <div className="fila-persona" key={m.id}><div className={"ranking-pos" + (i === 0 ? " top1" : "")}>{i + 1}</div><div><div className="persona-nombre">{m.persona}</div><div className="persona-tarea">{m.entregable}</div></div><div className="estado-texto" style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{cumplimiento(m)}%</div></div>
                      ))}
                      {rankingOrdenado.length === 0 && <div className="campo-vacio">Aún no hay metas para calcular el ranking.</div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {modulo === "equipo" && (
              <>
                {esAdmin && (
                  <div className="panel">
                    <div className="panel-titulo">
                      Turnos
                      <button className="btn btn-primario btn-sm" onClick={() => setMostrarFormTurno(!mostrarFormTurno)}><Plus /> Asignar turno</button>
                    </div>
                    {mostrarFormTurno && (
                      <div className="form-inline">
                        <select value={nuevoTurno.persona} onChange={e => setNuevoTurno({ ...nuevoTurno, persona: e.target.value })}>
                          <option value="">Selecciona persona…</option>
                          {personasEquipo.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                        </select>
                        <select value={nuevoTurno.dia} onChange={e => setNuevoTurno({ ...nuevoTurno, dia: e.target.value })}>{DIAS_SEMANA.map(d => <option key={d}>{d}</option>)}</select>
                        <input type="time" value={nuevoTurno.horaInicio} onChange={e => setNuevoTurno({ ...nuevoTurno, horaInicio: e.target.value })} />
                        <input type="time" value={nuevoTurno.horaFin} onChange={e => setNuevoTurno({ ...nuevoTurno, horaFin: e.target.value })} />
                        <button className="btn btn-primario btn-sm" onClick={agregarTurno}>Guardar</button>
                      </div>
                    )}
                    <table className="tabla">
                      <thead><tr><th>Persona</th><th>Día</th><th>Horario</th><th></th></tr></thead>
                      <tbody>
                        {turnos.map(t => (
                          <tr key={t.id}><td>{t.persona}</td><td>{t.dia}</td><td>{t.horaInicio} – {t.horaFin}</td><td><Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarTurno(t.id)} /></td></tr>
                        ))}
                        {turnos.length === 0 && <tr><td colSpan={4} className="campo-vacio">Sin turnos asignados todavía.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                )}
                {!esAdmin && (
                  <div className="panel">
                    <div className="panel-titulo">Tus turnos</div>
                    {turnosVisibles.map(t => (<div className="fila-persona" key={t.id}><div><div className="persona-nombre">{t.dia}</div><div className="persona-tarea">{t.horaInicio} – {t.horaFin}</div></div></div>))}
                    {turnosVisibles.length === 0 && <div className="campo-vacio">Aún no tienes turnos asignados.</div>}
                  </div>
                )}

                <div className="chips">
                  <div className={"chip" + (filtroArea === "Todas" ? " activo" : "")} onClick={() => setFiltroArea("Todas")}>Todas las áreas</div>
                  {AREAS.map(a => <div key={a} className={"chip" + (filtroArea === a ? " activo" : "")} onClick={() => setFiltroArea(a)}>{a}</div>)}
                </div>

                <div className="panel">
                  <div className="panel-titulo">
                    {esAdmin ? "Tareas del equipo" : "Tus tareas pendientes"}
                    {esAdmin && <button className="btn btn-primario btn-sm" onClick={() => setMostrarFormTarea(!mostrarFormTarea)}><Plus /> Asignar tarea</button>}
                  </div>
                  {esAdmin && mostrarFormTarea && (
                    <>
                      <div className="chips">
                        {(TAREAS_SUGERIDAS[nuevaTarea.area] || []).map(s => <div key={s} className="chip-sugerencia" onClick={() => setNuevaTarea({ ...nuevaTarea, tarea: s })}>{s}</div>)}
                      </div>
                      <div className="form-inline">
                        <input type="text" placeholder="Descripción de la tarea (ej. 3 videos, 1 video para la cumbre de jóvenes)" value={nuevaTarea.tarea} onChange={e => setNuevaTarea({ ...nuevaTarea, tarea: e.target.value })} />
                        <select value={nuevaTarea.responsable} onChange={e => setNuevaTarea({ ...nuevaTarea, responsable: e.target.value })}>
                          <option value="">Responsable…</option>
                          {personasEquipo.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                        </select>
                        <select value={nuevaTarea.area} onChange={e => setNuevaTarea({ ...nuevaTarea, area: e.target.value })}>{AREAS.map(a => <option key={a} value={a}>{a}</option>)}</select>
                        <select value={nuevaTarea.prioridad} onChange={e => setNuevaTarea({ ...nuevaTarea, prioridad: e.target.value })}><option>Alta</option><option>Media</option><option>Baja</option></select>
                        <select value={nuevaTarea.frecuencia} onChange={e => setNuevaTarea({ ...nuevaTarea, frecuencia: e.target.value })}><option>Específica</option><option>Frecuente</option></select>
                        {nuevaTarea.frecuencia === "Frecuente" && (
                          <select value={nuevaTarea.dia} onChange={e => setNuevaTarea({ ...nuevaTarea, dia: e.target.value })}>{DIAS_SEMANA.map(d => <option key={d}>{d}</option>)}</select>
                        )}
                        <button className="btn btn-primario btn-sm" onClick={agregarTarea}>Guardar</button>
                      </div>
                      <div className="aviso-simulado" style={{ marginTop: -10 }}>"Específica" es algo puntual de hoy (ej. 1 video para la cumbre de jóvenes). "Frecuente" se repite cada semana el día que elijas (ej. cada Lunes 3 videos).</div>
                    </>
                  )}
                  <table className="tabla">
                    <thead><tr><th></th><th>Tarea</th><th>Área</th><th>Frecuencia</th>{esAdmin && <th>Responsable</th>}<th>Estado</th>{esAdmin && <th></th>}</tr></thead>
                    <tbody>
                      {tareasVisibles.filter(t => filtroArea === "Todas" || t.area === filtroArea).map(t => (
                        <tr key={t.id}>
                          <td><span className={"semaforo-punto " + semaforoPrioridad(t.prioridad)} title={"Prioridad " + t.prioridad} /></td>
                          <td>{t.tarea}</td>
                          <td><span className="etiqueta etq-baja">{t.area}</span></td>
                          <td>{t.frecuencia === "Frecuente" ? <span className="etiqueta etq-progreso"><Repeat style={{ width: 10, height: 10 }} /> Cada {t.dia}</span> : <span className="etiqueta etq-baja">Específica · hoy</span>}</td>
                          {esAdmin && <td>{t.responsable}</td>}
                          <td><span className={"etiqueta fila-clic " + (t.estado === "Completado" ? "etq-completado" : t.estado === "En progreso" ? "etq-progreso" : "etq-pendiente")} onClick={() => cambiarEstadoTarea(t.id)} title="Clic para cambiar de estado">{t.estado}</span></td>
                          {esAdmin && <td><Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarTarea(t.id)} /></td>}
                        </tr>
                      ))}
                      {tareasVisibles.filter(t => filtroArea === "Todas" || t.area === filtroArea).length === 0 && <tr><td colSpan={7} className="campo-vacio">No hay tareas aquí todavía.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {modulo === "metas" && (
              <>
                {esAdmin && (
                  <div className="panel">
                    <div className="panel-titulo">Distribución de carga de trabajo</div>
                    {distribucionCarga.length > 0 ? (
                      <>
                        <div className="distribucion-barra">{distribucionCarga.map(d => <div key={d.persona} style={{ width: d.pct + "%", background: d.color }} />)}</div>
                        <div className="distribucion-leyenda">{distribucionCarga.map(d => <div className="distribucion-item" key={d.persona}><span className="distribucion-punto" style={{ background: d.color }} />{d.persona} · {d.pct}%</div>)}</div>
                      </>
                    ) : <div className="campo-vacio">Asigna metas para ver cómo se reparte la carga (suma 100%).</div>}
                  </div>
                )}
                <div className="panel">
                  <div className="panel-titulo">
                    {esAdmin ? "Objetivos con meta diaria y semanal" : "Tus metas"}
                    {esAdmin && <button className="btn btn-primario btn-sm" onClick={() => setMostrarFormMeta(!mostrarFormMeta)}><Plus /> Asignar objetivo</button>}
                  </div>
                  {esAdmin && mostrarFormMeta && (
                    <div className="form-inline">
                      <select value={nuevaMeta.persona} onChange={e => setNuevaMeta({ ...nuevaMeta, persona: e.target.value })}>
                        <option value="">Selecciona persona…</option>
                        {personasEquipo.map(p => <option key={p.id} value={p.nombre}>{p.nombre} — {p.rol}</option>)}
                      </select>
                      <input type="text" placeholder="Entregable (ej. Infografías, Videos)" value={nuevaMeta.entregable} onChange={e => setNuevaMeta({ ...nuevaMeta, entregable: e.target.value })} />
                      <input type="number" min="1" placeholder="Meta hoy" value={nuevaMeta.metaHoy} onChange={e => setNuevaMeta({ ...nuevaMeta, metaHoy: e.target.value })} />
                      <input type="number" min="1" placeholder="Meta semana" value={nuevaMeta.metaSemana} onChange={e => setNuevaMeta({ ...nuevaMeta, metaSemana: e.target.value })} />
                      <select value={nuevaMeta.area} onChange={e => setNuevaMeta({ ...nuevaMeta, area: e.target.value })}>{AREAS.map(a => <option key={a} value={a}>{a}</option>)}</select>
                      <button className="btn btn-primario btn-sm" onClick={agregarMeta}>Guardar</button>
                    </div>
                  )}
                  {(esAdmin ? metas : metasPropias).map(m => (
                    <div className="meta-card" key={m.id}>
                      <div className="meta-cab">
                        <div><div className="meta-persona">{m.persona} <span className="meta-rol">· {m.rol}</span></div><div className="meta-entregable">{m.entregable} · {m.area}</div></div>
                        {esAdmin && <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarMeta(m.id)} />}
                      </div>
                      <div className="meta-progresos">
                        <div><div className="barra-cab"><span>Hoy</span><span className="num">{m.avanceHoy}/{m.metaHoy}</span></div><div className="meta-progreso-fila"><div className="barra-fondo"><div className="barra-relleno" style={{ width: pct(m.avanceHoy, m.metaHoy) + "%" }} /></div><div className="meta-boton-mas" onClick={() => alimentarMeta(m.id, "avanceHoy")}>+</div></div></div>
                        <div><div className="barra-cab"><span>Semana</span><span className="num">{m.avanceSemana}/{m.metaSemana}</span></div><div className="meta-progreso-fila"><div className="barra-fondo"><div className="barra-relleno" style={{ width: pct(m.avanceSemana, m.metaSemana) + "%" }} /></div><div className="meta-boton-mas" onClick={() => alimentarMeta(m.id, "avanceSemana")}>+</div></div></div>
                      </div>
                    </div>
                  ))}
                  {(esAdmin ? metas : metasPropias).length === 0 && <div className="campo-vacio">No hay objetivos todavía.</div>}
                </div>
              </>
            )}

            {modulo === "proyectos" && (
              <>
                {esAdmin && (
                  <div className="panel">
                    <div className="panel-titulo">
                      Proyectos y trabajos transversales
                      <button className="btn btn-primario btn-sm" onClick={() => setMostrarFormProyecto(!mostrarFormProyecto)}><Plus /> Nuevo proyecto</button>
                    </div>
                    {mostrarFormProyecto && (
                      <div className="form-inline">
                        <input type="text" placeholder="Nombre del proyecto (ej. Redes de la Alcaldía, Revista institucional)" value={nuevoProyecto.nombre} onChange={e => setNuevoProyecto({ ...nuevoProyecto, nombre: e.target.value })} style={{ minWidth: 260 }} />
                        <select value={nuevoProyecto.tipo} onChange={e => setNuevoProyecto({ ...nuevoProyecto, tipo: e.target.value })}><option>Diario</option><option>Transversal</option><option>Editorial</option><option>Otro</option></select>
                        <input type="text" placeholder="Dirección solicitante (ej. Desarrollo Productivo)" value={nuevoProyecto.direccion} onChange={e => setNuevoProyecto({ ...nuevoProyecto, direccion: e.target.value })} />
                        <select value={nuevoProyecto.encargado} onChange={e => setNuevoProyecto({ ...nuevoProyecto, encargado: e.target.value })}>
                          <option value="">Encargado/a en comunicación…</option>
                          {personasEquipo.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                        </select>
                        <div className="form-inline" style={{ marginBottom: 0 }}>
                          <label style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>Convocatoria</label>
                          <input type="date" value={nuevoProyecto.fechaConvocatoria} onChange={e => setNuevoProyecto({ ...nuevoProyecto, fechaConvocatoria: e.target.value })} />
                          <label style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>Levantamiento</label>
                          <input type="date" value={nuevoProyecto.fechaLevantamiento} onChange={e => setNuevoProyecto({ ...nuevoProyecto, fechaLevantamiento: e.target.value })} />
                          <label style={{ fontSize: 11, color: "var(--muted)", alignSelf: "center" }}>Entrega</label>
                          <input type="date" value={nuevoProyecto.fechaEntrega} onChange={e => setNuevoProyecto({ ...nuevoProyecto, fechaEntrega: e.target.value })} />
                        </div>
                        <button className="btn btn-primario btn-sm" onClick={agregarProyecto}>Crear proyecto</button>
                      </div>
                    )}
                  </div>
                )}

                {proyectosVisibles.map(p => {
                  const avance = avanceProyecto(p);
                  const sem = semaforoProyecto({ ...p, avance });
                  return (
                    <div className={"proyecto-card " + sem} key={p.id}>
                      <div className="proyecto-cab">
                        <div>
                          <div className="proyecto-nombre"><span className={"semaforo-punto " + sem} />{p.nombre}</div>
                          <div className="proyecto-meta">{p.tipo} · {p.direccion || "sin dirección asignada"} · Encargado/a: {p.encargado || "—"}</div>
                          <div className="proyecto-meta">Convocatoria: {p.fechaConvocatoria || "—"} · Levantamiento: {p.fechaLevantamiento || "—"} · Entrega: {p.fechaEntrega || "—"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="proyecto-avance-num">{avance}%</div>
                          {esAdmin && <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer", marginTop: 6 }} onClick={() => eliminarProyecto(p.id)} />}
                        </div>
                      </div>
                      <div className="barra-fondo"><div className="barra-relleno" style={{ width: avance + "%", background: sem === "rojo" ? "var(--rojo)" : sem === "amarillo" ? "var(--warning)" : "var(--success)" }} /></div>

                      <div className="proyecto-entregables">
                        {p.entregables.map(e => {
                          const puedeMarcar = esAdmin || e.responsable === nombreVisible;
                          return (
                            <div className="entregable-fila" key={e.id}>
                              <div className={"entregable-check" + (e.completado ? " completado" : "")} onClick={() => puedeMarcar && alternarEntregable(p.id, e.id)}>{e.completado && <CheckCircle2 style={{ width: 11, height: 11 }} />}</div>
                              <span className={"entregable-texto" + (e.completado ? " completado" : "")}>{e.tipo} — {e.responsable}{e.fecha ? " · " + e.fecha : ""}</span>
                              {esAdmin && <Trash2 style={{ width: 12, height: 12, color: "var(--dim)", cursor: "pointer", marginLeft: "auto" }} onClick={() => eliminarEntregable(p.id, e.id)} />}
                            </div>
                          );
                        })}
                        {p.entregables.length === 0 && <div className="campo-vacio">Sin entregables agregados.</div>}
                        {esAdmin && (
                          <div className="form-inline" style={{ marginTop: 10, marginBottom: 0 }}>
                            <select value={(entregableForm[p.id] || {}).tipo || TIPOS_ENTREGABLE[0]} onChange={e => setEntregableForm({ ...entregableForm, [p.id]: { ...(entregableForm[p.id] || {}), tipo: e.target.value } })}>{TIPOS_ENTREGABLE.map(t => <option key={t}>{t}</option>)}</select>
                            <select value={(entregableForm[p.id] || {}).responsable || ""} onChange={e => setEntregableForm({ ...entregableForm, [p.id]: { ...(entregableForm[p.id] || {}), responsable: e.target.value } })}>
                              <option value="">Responsable…</option>
                              {personasEquipo.map(pe => <option key={pe.id} value={pe.nombre}>{pe.nombre}</option>)}
                            </select>
                            <input type="date" value={(entregableForm[p.id] || {}).fecha || ""} onChange={e => setEntregableForm({ ...entregableForm, [p.id]: { ...(entregableForm[p.id] || {}), fecha: e.target.value } })} />
                            <button className="btn btn-sm" onClick={() => agregarEntregable(p.id)}><Plus /> Agregar</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {proyectosVisibles.length === 0 && <div className="panel"><div className="campo-vacio">Aún no hay proyectos creados.</div></div>}
              </>
            )}

            {modulo === "ranking" && (
              <div className="panel">
                <div className="panel-titulo">Quién cumple primero y quién se atrasa</div>
                {rankingOrdenado.map((m, i) => (
                  <div className="ranking-fila" key={m.id}>
                    <div className={"ranking-pos" + (i === 0 ? " top1" : "")}>{i + 1}</div>
                    <div className="ranking-fila-info"><div className="ranking-nombre">{m.persona} <span className="meta-rol">· {m.rol}</span></div><div className="ranking-detalle">{m.entregable} — hoy {m.avanceHoy}/{m.metaHoy} · semana {m.avanceSemana}/{m.metaSemana}</div></div>
                    <span className={"etiqueta " + (cumplimiento(m) >= 90 ? "etq-completado" : cumplimiento(m) >= 60 ? "etq-media" : "etq-alta")}>{cumplimiento(m) >= 90 ? "Al día" : cumplimiento(m) >= 60 ? "En curso" : "Atrasado"}</span>
                    <div className="ranking-cumplimiento">{cumplimiento(m)}%</div>
                  </div>
                ))}
                {rankingOrdenado.length === 0 && <div className="campo-vacio">Aún no hay metas registradas para calcular el ranking.</div>}
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
                      <option value="Aliada">Cuenta aliada</option>
                      <option value="Influencer a favor">Influencer a favor</option>
                      <option value="Atacante">Cuenta que ataca</option>
                      <option value="Influencer en contra">Influencer en contra</option>
                    </select>
                    <button className="btn btn-primario" onClick={agregarCuenta}><Link2 /> Agregar a la lista</button>
                  </div>
                  <div className="aviso-simulado">Al hacer clic en una cuenta vas a ver su contenido real y en vivo (Facebook y X se muestran integrados aquí mismo; Instagram y TikTok abren el perfil real en una pestaña nueva, porque esas dos plataformas no permiten insertarse dentro de otra página).</div>
                </div>

                <div className="kpis" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                  {TIPOS_CUENTA.map(t => (
                    <div className={"kpi " + (TIPOS_CUENTA_NEGATIVOS.includes(t) ? "acento-rojo" : "acento-exito")} key={t}>
                      <div className="kpi-valor">{cuentas.filter(c => c.tipo === t).length}</div>
                      <div className="kpi-label">{t}</div>
                    </div>
                  ))}
                </div>

                <div className="grid-dos">
                  <div>
                    {["Propia", "Aliada", "Influencer a favor"].map(tipo => (
                      <div className="panel" key={tipo}>
                        <div className="panel-titulo">{tipo === "Propia" ? "Cuentas propias" : tipo === "Aliada" ? "Cuentas aliadas" : "Influencers a favor"}</div>
                        {cuentas.filter(c => c.tipo === tipo).map(c => {
                          const Icono = PLATAFORMA_ICONO[c.plataforma];
                          return (
                            <div className="tarjeta-cuenta fila-clic" key={c.id} onClick={() => setCuentaAbierta(c.id)}>
                              <div className="icono-plat"><Icono /></div>
                              <div><div className="cuenta-handle">{c.handle}</div><div className="cuenta-meta">{c.plataforma} · clic para ver en vivo</div></div>
                              <div className="cuenta-metricas">
                                <span className="etiqueta etq-completado"><Radio style={{ width: 10, height: 10 }} /> En vivo</span>
                                <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); eliminarCuenta(c.id); }} />
                              </div>
                            </div>
                          );
                        })}
                        {cuentas.filter(c => c.tipo === tipo).length === 0 && <div className="campo-vacio">Sin cuentas en esta categoría.</div>}
                      </div>
                    ))}
                  </div>

                  <div>
                    {["Atacante", "Influencer en contra"].map(tipo => (
                      <div className="panel" key={tipo}>
                        <div className="panel-titulo">{tipo === "Atacante" ? "Cuentas que nos atacan" : "Influencers en contra"}</div>
                        {cuentas.filter(c => c.tipo === tipo).map(c => {
                          const Icono = PLATAFORMA_ICONO[c.plataforma];
                          return (
                            <div className="tarjeta-cuenta fila-clic" key={c.id} onClick={() => setCuentaAbierta(c.id)}>
                              <div className="icono-plat"><Icono /></div>
                              <div><div className="cuenta-handle">{c.handle}</div><div className="cuenta-meta">{c.plataforma} · clic para ver en vivo</div></div>
                              <div className="cuenta-metricas">
                                <span className="etiqueta etq-completado"><Radio style={{ width: 10, height: 10 }} /> En vivo</span>
                                <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); eliminarCuenta(c.id); }} />
                              </div>
                            </div>
                          );
                        })}
                        {cuentas.filter(c => c.tipo === tipo).length === 0 && <div className="campo-vacio">Sin cuentas en esta categoría.</div>}
                      </div>
                    ))}
                    <div className="panel">
                      <div className="panel-titulo">Cobertura de redes cargadas</div>
                      {cobertura.map(c => { const Icono = COBERTURA_ICONO[c.icono]; return (<div className="cobertura-fila" key={c.id}><div className="cobertura-icono"><Icono /></div><div className="cobertura-nombre">{c.red}</div><div className={"switch" + (c.cargada ? " on" : "")} onClick={() => alternarCobertura(c.id)}><div className="bolita" /></div></div>); })}
                    </div>
                    <div className="panel">
                      <div className="panel-titulo">Búsqueda web, foros y palabras clave</div>
                      <div className="form-inline">
                        <select value={nuevoWeb.tipo} onChange={e => setNuevoWeb({ ...nuevoWeb, tipo: e.target.value })}><option>Palabra clave Google</option><option>Foro / página web</option></select>
                        <input type="text" placeholder="Ej. nombre de la institución + denuncia" value={nuevoWeb.texto} onChange={e => setNuevoWeb({ ...nuevoWeb, texto: e.target.value })} />
                        <button className="btn btn-primario btn-sm" onClick={agregarWeb}><Search /> Agregar</button>
                      </div>
                      {web.map(w => (<div className="web-fila" key={w.id}><Search /><div style={{ flex: 1 }}><div className="web-texto">{w.texto}</div><div className="web-tipo">{w.tipo} · revisado {w.revisado}</div></div><span className={"etiqueta " + (w.resultados > 3 ? "etq-alta" : w.resultados > 0 ? "etq-media" : "etq-baja")}>{w.resultados} resultados</span><Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarWeb(w.id)} /></div>))}
                      {web.length === 0 && <div className="campo-vacio">Sin búsquedas configuradas.</div>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {modulo === "calendario" && (
              <div className="grid-dos">
                <div className="panel">
                  <div className="cal-header"><div className="cal-mes">Agosto / Septiembre 2026</div></div>
                  <div className="cal-grid">
                    {["L", "M", "X", "J", "V", "S", "D"].map(d => <div className="cal-diasemana" key={d}>{d}</div>)}
                    {diasDelMes.map((d, i) => {
                      if (!d) return <div key={i} />;
                      const clave = claveFecha(d);
                      const esHoy = clave === "2026-08-31";
                      const tieneEventos = eventos[clave]?.length > 0;
                      return (<div key={i} className={"cal-celda" + (esHoy ? " hoy" : "") + (clave === diaSeleccionado ? " seleccionado" : "")} onClick={() => setDiaSeleccionado(clave)}>{d.getDate()}{tieneEventos && <div className="cal-punto-evento" />}</div>);
                    })}
                  </div>
                </div>
                <div>
                  <div className="panel">
                    <div className="panel-titulo">Agenda del {new Date(diaSeleccionado).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}</div>
                    {(eventos[diaSeleccionado] || []).map((ev, i) => <div className="evento-fila" key={i}><div className="evento-hora">{ev.h}</div><div>{ev.t}</div></div>)}
                    {(!eventos[diaSeleccionado] || eventos[diaSeleccionado].length === 0) && <div className="campo-vacio">Sin eventos este día.</div>}
                    {esAdmin && (
                      <div className="form-inline" style={{ marginTop: 12 }}>
                        <input type="text" placeholder="Hora" style={{ minWidth: 0, width: 62 }} value={nuevoEvento.h} onChange={e => setNuevoEvento({ ...nuevoEvento, h: e.target.value })} />
                        <input type="text" placeholder="Nuevo evento" value={nuevoEvento.t} onChange={e => setNuevoEvento({ ...nuevoEvento, t: e.target.value })} />
                        <button className="btn btn-primario btn-sm" onClick={agregarEvento}><Plus /> Agendar</button>
                      </div>
                    )}
                  </div>
                  <div className="panel">
                    <div className="panel-titulo">{esAdmin ? "Tareas pendientes del equipo" : "Tus pendientes y completadas"}</div>
                    {tareasVisibles.map(t => (
                      <div className="fila-persona" key={t.id}>
                        <span className={"semaforo-punto " + semaforoPrioridad(t.prioridad)} />
                        <div><div className="persona-nombre">{t.tarea}</div><div className="persona-tarea">{esAdmin ? t.responsable : t.area}</div></div>
                        <span className={"etiqueta " + (t.estado === "En progreso" ? "etq-progreso" : t.estado === "Completado" ? "etq-completado" : "etq-pendiente")} style={{ marginLeft: "auto" }}>{t.estado}</span>
                      </div>
                    ))}
                    {tareasVisibles.length === 0 && <div className="campo-vacio">Nada pendiente por ahora.</div>}
                    {esAdmin && (
                      <>
                        <button className="btn btn-primario" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} onClick={() => { setCorreoEnviado(true); setTimeout(() => setCorreoEnviado(false), 3000); }}><Mail /> Enviar resumen por correo</button>
                        <button className="btn" style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={generarPdfCierre}><FileDown /> Generar PDF de cierre del día</button>
                        <div className="aviso-simulado">El correo automático es simulado (falta conectar un servicio de email). El PDF de cierre sí se descarga de verdad, con los datos actuales.</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {modulo === "roles" && esAdmin && (
              <>
                <div className="panel">
                  <div className="panel-titulo">¿Qué equipo quieres gestionar?</div>
                  <div className="chips">
                    {unidadesDisponibles.map(u => <div key={u} className={"chip" + (unidadActual === u ? " activo" : "")} onClick={() => setUnidadActual(u)}>{u}</div>)}
                  </div>
                  <div className="form-inline" style={{ marginBottom: 0 }}>
                    <input type="text" placeholder="Agregar nuevo equipo/dirección (ej. Turismo)" value={nuevaUnidadTexto} onChange={e => setNuevaUnidadTexto(e.target.value)} />
                    <button className="btn btn-sm" onClick={agregarUnidadNueva}><Plus /> Agregar equipo</button>
                  </div>
                  <div className="aviso-simulado">Cada equipo (Dircom, Bomberos, Patronato, Comunicación Externa, u otro que agregues) tiene su propia gente y su propio organigrama — son autónomos entre sí.</div>
                </div>

                <div className="panel">
                  <div className="panel-titulo">Organigrama · {unidadActual}</div>
                  <div className="organigrama">
                    {arbolOrganigrama.raices.map(p => <NodoOrganigrama key={p.id} persona={p} hijosDe={arbolOrganigrama.hijosDe} />)}
                    {personasUnidad.length === 0 && <div className="campo-vacio">Agrega personas a este equipo para ver su organigrama.</div>}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-titulo">
                    Fichas de {unidadActual}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-sm" onClick={descargarPlantillaExcel}><Download /> Descargar plantilla Excel</button>
                      <label className="btn btn-sm" style={{ cursor: "pointer" }}>
                        <Upload /> Subir Excel
                        <input type="file" accept=".xlsx,.xls" onChange={manejarSubidaExcel} style={{ display: "none" }} />
                      </label>
                      <button className="btn btn-primario btn-sm" onClick={() => setMostrarFormPersona(!mostrarFormPersona)}><Plus /> Agregar persona</button>
                    </div>
                  </div>
                  {mostrarFormPersona && (
                    <>
                      <div className="form-inline">
                        <input type="text" placeholder="Nombre completo" value={nuevaPersona.nombre} onChange={e => setNuevaPersona({ ...nuevaPersona, nombre: e.target.value })} />
                        <input type="text" placeholder="Código (ej. 002)" value={nuevaPersona.codigo} onChange={e => setNuevaPersona({ ...nuevaPersona, codigo: e.target.value })} style={{ width: 100, flex: "initial" }} />
                        <input type="text" placeholder="Clave" value={nuevaPersona.clave} onChange={e => setNuevaPersona({ ...nuevaPersona, clave: e.target.value })} style={{ width: 110, flex: "initial" }} />
                        <select value={nuevaPersona.rol} onChange={e => setNuevaPersona({ ...nuevaPersona, rol: e.target.value })}>{rolesDisponibles.map(r => <option key={r}>{r}</option>)}</select>
                        <select value={nuevaPersona.modalidad} onChange={e => setNuevaPersona({ ...nuevaPersona, modalidad: e.target.value })}>{modalidadesDisponibles.map(m => <option key={m}>{m}</option>)}</select>
                        <select value={nuevaPersona.jefeDirecto} onChange={e => setNuevaPersona({ ...nuevaPersona, jefeDirecto: e.target.value })}>
                          <option value="">Sin jefe directo (nivel más alto)</option>
                          {personasUnidad.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
                        </select>
                        <button className="btn btn-primario btn-sm" onClick={agregarPersona}>Guardar</button>
                      </div>
                      <div className="form-inline">
                        <input type="text" placeholder="+ Agregar rol nuevo (ej. Editor de video)" value={nuevoRolTexto} onChange={e => setNuevoRolTexto(e.target.value)} />
                        <button className="btn btn-sm" onClick={agregarRolNuevo}>Agregar rol</button>
                        <input type="text" placeholder="+ Agregar modalidad nueva" value={nuevaModalidadTexto} onChange={e => setNuevaModalidadTexto(e.target.value)} />
                        <button className="btn btn-sm" onClick={agregarModalidadNueva}>Agregar modalidad</button>
                      </div>
                    </>
                  )}
                  <div className="aviso-simulado" style={{ marginTop: -6, marginBottom: 14 }}>La plantilla trae las columnas Nombre, Codigo, Clave, Rol, Area, Modalidad, JefeDirecto — llénala y súbela para agregar varias personas de una sola vez a {unidadActual}. Los roles y modalidades que agregues quedan guardados para siempre, no se borran.</div>

                  {personasUnidad.map(p => (
                    <div className="ficha-card" key={p.id}>
                      <div className="ficha-cab">
                        <label className="ficha-avatar">
                          {p.foto ? <img src={p.foto} alt={p.nombre} /> : <span>{p.nombre.split(" ").map(x => x[0]).slice(0, 2).join("")}</span>}
                          <div className="ficha-avatar-editar"><Camera /></div>
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => subirFoto(p.id, e.target.files[0])} />
                        </label>
                        <div style={{ flex: 1 }}>
                          <div className="ficha-nombre">{p.nombre}</div>
                          <div className="ficha-meta">{p.rol} · {p.modalidad || "sin modalidad"} · código <span className="etiqueta etq-baja">{p.codigo}</span>{p.jefeDirecto && <> · reporta a {p.jefeDirecto}</>}</div>
                        </div>
                        <button className="btn btn-sm" onClick={() => setFichaAbierta(fichaAbierta === p.id ? null : p.id)}>{fichaAbierta === p.id ? "Cerrar" : "Ver ficha"}</button>
                        {p.id !== usuarioActual?.id && <Trash2 style={{ width: 14, height: 14, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarPersona(p.id)} />}
                      </div>

                      {fichaAbierta === p.id && (
                        <div className="ficha-detalle">
                          <div className="ficha-columna">
                            <div className="ficha-subtitulo"><CalendarClock style={{ width: 13, height: 13 }} /> Horario frecuente</div>
                            {(p.horario || []).map(h => (<div className="ficha-item-fila" key={h.id}><span>{h.dia}: {h.horaInicio} – {h.horaFin}</span><Trash2 style={{ width: 12, height: 12, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarHorarioPersona(p.id, h.id)} /></div>))}
                            {(p.horario || []).length === 0 && <div className="campo-vacio" style={{ padding: "6px 0" }}>Sin horario definido.</div>}
                            <div className="form-inline" style={{ marginTop: 8, marginBottom: 0 }}>
                              <select value={(formHorario[p.id] || {}).dia || "Lunes"} onChange={e => setFormHorario({ ...formHorario, [p.id]: { ...(formHorario[p.id] || {}), dia: e.target.value } })}>{DIAS_SEMANA.map(d => <option key={d}>{d}</option>)}</select>
                              <input type="time" value={(formHorario[p.id] || {}).horaInicio || "08:00"} onChange={e => setFormHorario({ ...formHorario, [p.id]: { ...(formHorario[p.id] || {}), horaInicio: e.target.value } })} />
                              <input type="time" value={(formHorario[p.id] || {}).horaFin || "16:00"} onChange={e => setFormHorario({ ...formHorario, [p.id]: { ...(formHorario[p.id] || {}), horaFin: e.target.value } })} />
                              <button className="btn btn-sm" onClick={() => agregarHorarioPersona(p.id)}><Plus /></button>
                            </div>
                          </div>
                          <div className="ficha-columna">
                            <div className="ficha-subtitulo"><Repeat style={{ width: 13, height: 13 }} /> Tareas frecuentes (rutina semanal)</div>
                            {(p.tareasFrecuentes || []).map(t => (<div className="ficha-item-fila" key={t.id}><span>{t.dia}: {t.tarea}</span><Trash2 style={{ width: 12, height: 12, color: "var(--dim)", cursor: "pointer" }} onClick={() => eliminarTareaFrecPersona(p.id, t.id)} /></div>))}
                            {(p.tareasFrecuentes || []).length === 0 && <div className="campo-vacio" style={{ padding: "6px 0" }}>Sin tareas frecuentes registradas.</div>}
                            <div className="form-inline" style={{ marginTop: 8, marginBottom: 0 }}>
                              <select value={(formTareaFrec[p.id] || {}).dia || "Lunes"} onChange={e => setFormTareaFrec({ ...formTareaFrec, [p.id]: { ...(formTareaFrec[p.id] || {}), dia: e.target.value } })}>{DIAS_SEMANA.map(d => <option key={d}>{d}</option>)}</select>
                              <input type="text" placeholder="Ej. 3 videos" value={(formTareaFrec[p.id] || {}).tarea || ""} onChange={e => setFormTareaFrec({ ...formTareaFrec, [p.id]: { ...(formTareaFrec[p.id] || {}), tarea: e.target.value } })} />
                              <button className="btn btn-sm" onClick={() => agregarTareaFrecPersona(p.id)}><Plus /></button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {personasUnidad.length === 0 && <div className="campo-vacio">Aún no hay nadie en {unidadActual}.</div>}
                  <div className="aviso-simulado">Estos códigos y claves son de nivel prototipo (viven en el navegador) — funcionan para controlar el acceso del día a día, pero no son un sistema de autenticación seguro para datos sensibles.</div>
                </div>
              </>
            )}
          </main>
        </>
      )}

      {cuentaAbierta && (() => {
        const c = cuentas.find(x => x.id === cuentaAbierta);
        if (!c) return null;
        const Icono = PLATAFORMA_ICONO[c.plataforma];
        return (
          <div className="modal-overlay" onClick={() => setCuentaAbierta(null)}>
            <div className="modal-feed" onClick={e => e.stopPropagation()}>
              <div className="modal-feed-header">
                <div className="modal-feed-header-info"><div className="modal-feed-avatar"><Icono /></div><div><div className="modal-feed-nombre">{c.handle}</div><div className="modal-feed-sub">{c.plataforma} · {c.tipo}</div></div></div>
                <IconCerrar className="modal-feed-cerrar" onClick={() => setCuentaAbierta(null)} />
              </div>
              <div className="modal-feed-body">
                <VisorEnVivo cuenta={c} />
              </div>
            </div>
          </div>
        );
      })()}

      {correoEnviado && <div className="toast"><CheckCircle2 /> Resumen enviado (simulado)</div>}
    </div>
  );
}
