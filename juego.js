/* ============================================================
   PARTE A — LOS SÍMBOLOS DEL IDIOMA
   Cada símbolo es un dibujo SVG + su palabra alienígena + su significado.
   ============================================================ */
const S = (d) => `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor"
  stroke-width="6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const SIMBOLOS = {
  agua:   { palabra:"ZUUN",  sentido:"agua",
            svg:S('<path d="M16 36q12-14 24 0t24 0"/><path d="M16 58q12-14 24 0t24 0"/><circle cx="50" cy="80" r="4" fill="currentColor"/>') },
  fuego:  { palabra:"KRAX",  sentido:"fuego",
            svg:S('<path d="M50 16 78 74H22Z"/><circle cx="50" cy="56" r="8"/>') },
  luz:    { palabra:"SHILO", sentido:"luz",
            svg:S('<path d="M50 14V86M22 32l56 36M78 32 22 68"/><circle cx="50" cy="50" r="10" fill="var(--losa)"/>') },
  nave:   { palabra:"TOROK", sentido:"nave",
            svg:S('<path d="M50 14c11 13 17 29 17 44v14H33V58c0-15 6-31 17-44Z"/><circle cx="50" cy="50" r="8"/><path d="M33 72 20 88h13M67 72l13 16H67"/>') },
  volar:  { palabra:"VEI",   sentido:"volar",
            svg:S('<path d="M50 86V20"/><path d="M30 40 50 18l20 22"/><path d="M22 66h10M68 66h10"/>') },
  romper: { palabra:"KRAKT", sentido:"romper",
            svg:S('<path d="M38 14 58 44 40 52 62 86"/><path d="M18 40h10M72 58h10"/>') },
  ayudar: { palabra:"MELO",  sentido:"ayudar",
            svg:S('<path d="M22 56a15 15 0 1 1 28 0"/><path d="M50 56a15 15 0 1 0 28 0"/><path d="M50 22v14"/>') },
  buscar: { palabra:"NIKA",  sentido:"buscar",
            svg:S('<circle cx="44" cy="42" r="21"/><path d="M60 58 84 84"/><path d="M36 34h16"/>') }
};

/* Iconos de las piezas de la nave */
const ICONOS = {
  cristal: S('<path d="M50 12 80 44 50 88 20 44Z"/><path d="M20 44h60M50 12v76"/>'),
  motor:   S('<rect x="28" y="24" width="44" height="44" rx="8"/><path d="M50 68v18M36 86h28M40 40h20M40 52h20"/>'),
  antena:  S('<path d="M50 84V46"/><path d="M28 46a22 22 0 0 1 44 0Z"/><circle cx="50" cy="26" r="6"/>')
};

/* ============================================================
   PARTE B — LOS NIVELES
   ============================================================ */
const NIVELES = [
  {
    titulo:"Nivel 1 · Las cosas",
    guia:"Estos cuatro símbolos aparecen tallados en la entrada de la cueva. Obsérvalos bien antes de continuar.",
    ensena:["agua","fuego","luz","nave"],
    pieza:{ nombre:"Cristal de energía", icono:ICONOS.cristal,
            texto:"Los habitantes vieron que entiendes sus nombres. Te entregan el cristal que enciende la nave." },
    preguntas:[
      { tipo:"simbolo", clave:"agua",  opciones:["agua","fuego","luz"] },
      { tipo:"palabra", clave:"nave",  opciones:["nave","luz","agua"] },
      { tipo:"simbolo", clave:"fuego", opciones:["fuego","nave","luz"] }
    ]
  },
  {
    titulo:"Nivel 2 · Las acciones",
    guia:"Más adentro hay símbolos que no nombran cosas: nombran lo que alguien hace.",
    ensena:["volar","romper","ayudar","buscar"],
    pieza:{ nombre:"Motor de plasma", icono:ICONOS.motor,
            texto:"Entendiste sus verbos. Un anciano de Zyrra saca el motor de un templo y te lo pone en las manos." },
    preguntas:[
      { tipo:"simbolo", clave:"buscar", opciones:["buscar","volar","romper"] },
      { tipo:"palabra", clave:"ayudar", opciones:["ayudar","romper","volar"] },
      { tipo:"simbolo", clave:"volar",  opciones:["volar","ayudar","buscar"] }
    ]
  },
  {
    titulo:"Nivel 3 · Las frases",
    guia:"En Zyrra dos símbolos juntos forman una frase: primero de qué se habla, después qué pasa con eso.",
    ensena:["nave","romper","agua","buscar","luz","volar"],
    pieza:{ nombre:"Antena de navegación", icono:ICONOS.antena,
            texto:"Ya hablas Zyrra. Te dan la antena para que encuentres el camino de vuelta a casa." },
    preguntas:[
      { tipo:"frase", clave:["nave","romper"],
        opciones:["La nave está rota","La nave vuela alto","Buscamos una nave"] },
      { tipo:"frase", clave:["agua","buscar"],
        opciones:["Buscar agua","El agua quema","El agua vuela"] },
      { tipo:"frase", clave:["luz","volar"],
        opciones:["Volar hacia la luz","Romper la luz","Ayudar con la luz"] }
    ]
  }
];

/* ============================================================
   PARTE C — EL ESTADO DEL JUEGO (lo que el juego recuerda)
   ============================================================ */
let nivelActual = 0;
let preguntaActual = 0;
let piezas = 0;
let aciertosLimpios = 0;   // aciertos al primer intento
let fallosEnPregunta = false;
const TOTAL_PREGUNTAS = NIVELES.reduce((t,n)=>t+n.preguntas.length,0);

const $ = (id) => document.getElementById(id);

/* ============================================================
   PARTE D — CAMBIAR DE PANTALLA
   ============================================================ */
function mostrar(id){
  document.querySelectorAll(".pantalla").forEach(p=>p.classList.remove("activa"));
  $(id).classList.add("activa");
  $("marcador").classList.toggle("activo", id!=="inicio");
  window.scrollTo({top:0, behavior:"smooth"});
}

/* Dibuja los tres huecos de piezas arriba */
function pintarMarcador(){
  const nombres = NIVELES.map(n=>n.pieza);
  $("piezas").innerHTML = nombres.map((p,i)=>
    `<div class="pieza ${i<piezas?"obtenida":""}" title="${p.nombre}">${p.icono}</div>`
  ).join("");
  $("nivel-info").textContent = nivelActual < NIVELES.length
    ? `${NIVELES[nivelActual].titulo}\n${preguntaActual+1} de ${NIVELES[nivelActual].preguntas.length}`
    : "Misión completa";
}

/* ============================================================
   PARTE E — FASE DE APRENDIZAJE
   ============================================================ */
function abrirNivel(){
  const nivel = NIVELES[nivelActual];
  preguntaActual = 0;
  $("aprender-titulo").textContent = nivel.titulo;
  $("aprender-guia").textContent = nivel.guia;
  $("aprender-glosario").innerHTML = nivel.ensena.map(k=>tarjeta(k)).join("");
  pintarMarcador();
  mostrar("aprender");
}

function tarjeta(clave){
  const s = SIMBOLOS[clave];
  return `<div class="tarjeta">${s.svg}
            <div class="palabra">${s.palabra}</div>
            <div class="sentido">${s.sentido}</div>
          </div>`;
}

/* ============================================================
   PARTE F — LAS PREGUNTAS
   ============================================================ */
function abrirPregunta(){
  const nivel = NIVELES[nivelActual];
  const p = nivel.preguntas[preguntaActual];
  fallosEnPregunta = false;
  $("aviso").textContent = "";
  $("aviso").className = "aviso";
  $("btn-siguiente").style.visibility = "hidden";
  pintarMarcador();

  if(p.tipo === "simbolo"){
    // Se ve el símbolo, hay que elegir el significado
    $("enunciado").textContent = "¿Qué significa este símbolo?";
    $("muestra").innerHTML = SIMBOLOS[p.clave].svg;
    $("opciones").innerHTML = mezclar([...p.opciones]).map(op =>
      `<button class="opcion" data-valor="${op}">${SIMBOLOS[op].sentido}</button>`
    ).join("");
  }
  else if(p.tipo === "palabra"){
    // Se ve la palabra, hay que elegir el símbolo
    $("enunciado").textContent = `¿Cuál de estos símbolos se lee “${SIMBOLOS[p.clave].palabra}”?`;
    $("muestra").innerHTML = `<div class="palabra-grande">${SIMBOLOS[p.clave].palabra}</div>`;
    $("opciones").innerHTML = mezclar([...p.opciones]).map(op =>
      `<button class="opcion" data-valor="${op}">${SIMBOLOS[op].svg}<span>Opción</span></button>`
    ).join("");
    // quitamos la palabra "Opción" y dejamos solo el dibujo
    document.querySelectorAll("#opciones .opcion span").forEach((s,i)=> s.textContent = ["A","B","C"][i]);
  }
  else {
    // Frase de dos símbolos
    $("enunciado").textContent = "Traduce esta frase tallada en la roca";
    $("muestra").innerHTML = `<div class="frase">${p.clave.map(k=>SIMBOLOS[k].svg).join("")}</div>`;
    $("opciones").innerHTML = mezclar([...p.opciones]).map(op =>
      `<button class="opcion" data-valor="${op}">${op}</button>`
    ).join("");
  }

  document.querySelectorAll("#opciones .opcion")
    .forEach(b => b.addEventListener("click", () => responder(b, p)));
  mostrar("preguntar");
}

/* Saber cuál es la respuesta correcta según el tipo de pregunta */
function esCorrecta(valor, p){
  if(p.tipo === "frase") return valor === p.opciones[0];
  return valor === p.clave;
}

function responder(boton, p){
  const valor = boton.dataset.valor;

  if(esCorrecta(valor, p)){
    boton.classList.add("correcta");
    document.querySelectorAll("#opciones .opcion").forEach(b => b.disabled = true);
    if(!fallosEnPregunta) aciertosLimpios++;
    $("aviso").textContent = mensajeAcierto(p);
    $("aviso").className = "aviso ok";
    $("btn-siguiente").style.visibility = "visible";
    sonido("bien");
  } else {
    boton.classList.add("incorrecta");
    boton.disabled = true;
    fallosEnPregunta = true;
    $("aviso").textContent = "Ese no. Mira otra vez la forma del símbolo e inténtalo.";
    $("aviso").className = "aviso mal";
    sonido("mal");
  }
}

function mensajeAcierto(p){
  if(p.tipo === "frase") return "Correcto. Los de Zyrra asienten con las tres cabezas.";
  const s = SIMBOLOS[p.clave];
  return `Correcto: ${s.palabra} significa “${s.sentido}”.`;
}

function siguiente(){
  const nivel = NIVELES[nivelActual];
  preguntaActual++;
  if(preguntaActual < nivel.preguntas.length){
    abrirPregunta();
  } else {
    piezas++;
    pintarMarcador();
    $("recompensa-icono").innerHTML = `<div style="width:80px;margin:0 auto">${nivel.pieza.icono}</div>`;
    $("recompensa-titulo").textContent = `Conseguiste: ${nivel.pieza.nombre}`;
    $("recompensa-texto").textContent = nivel.pieza.texto;
    $("btn-continuar").textContent = (nivelActual < NIVELES.length-1) ? "Ir al siguiente nivel" : "Reparar la nave";
    sonido("pieza");
    mostrar("recompensa");
  }
}

function continuar(){
  nivelActual++;
  if(nivelActual < NIVELES.length) abrirNivel();
  else terminar();
}

/* ============================================================
   PARTE G — FINAL
   ============================================================ */
function terminar(){
  const perfecto = aciertosLimpios === TOTAL_PREGUNTAS;
  $("final-titulo").textContent = "La nave está reparada";
  $("final-texto").textContent = perfecto
    ? "Encajaste las tres piezas sin equivocarte ni una vez. Los de Zyrra levantan la mano: eso significa adiós."
    : "Las tres piezas encajan. El motor ruge y Zyrra se queda abajo, cada vez más pequeño.";
  $("final-puntaje").textContent = `${aciertosLimpios} de ${TOTAL_PREGUNTAS} a la primera`;
  mostrar("final");
  setTimeout(()=>{
    $("llama").style.opacity = "1";
    $("nave-final").classList.add("despega");
    sonido("despegue");
  }, 900);
  guardarRecord(aciertosLimpios);
}

function reiniciar(){
  nivelActual = 0; preguntaActual = 0; piezas = 0; aciertosLimpios = 0;
  $("nave-final").classList.remove("despega");
  $("llama").style.opacity = "0";
  abrirNivel();
}

/* ============================================================
   PARTE H — AYUDANTES
   ============================================================ */
function mezclar(lista){
  for(let i = lista.length-1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

/* Glosario: solo los símbolos ya aprendidos */
function abrirGlosario(){
  const vistos = new Set();
  for(let i = 0; i <= nivelActual && i < NIVELES.length; i++){
    NIVELES[i].ensena.forEach(k => vistos.add(k));
  }
  $("glosario-completo").innerHTML = [...vistos].map(k=>tarjeta(k)).join("");
  $("dialogo-glosario").showModal();
}

/* Sonidos cortos hechos con el navegador (sin archivos) */
let audio = null;
function sonido(tipo){
  try{
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const notas = { bien:[660,880], mal:[200,150], pieza:[520,660,880], despegue:[120,90,60] }[tipo] || [440];
    notas.forEach((f,i)=>{
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = tipo === "despegue" ? "sawtooth" : "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, audio.currentTime + i*0.11);
      g.gain.exponentialRampToValueAtTime(0.16, audio.currentTime + i*0.11 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + i*0.11 + 0.28);
      o.connect(g); g.connect(audio.destination);
      o.start(audio.currentTime + i*0.11); o.stop(audio.currentTime + i*0.11 + 0.3);
    });
  }catch(e){ /* si el navegador no deja sonar, el juego sigue igual */ }
}

/* Guardar el mejor resultado en el navegador */
function guardarRecord(n){
  try{
    const previo = Number(localStorage.getItem("zyrra-record") || 0);
    if(n > previo) localStorage.setItem("zyrra-record", String(n));
  }catch(e){}
}

/* ============================================================
   PARTE I — FONDO DE ESTRELLAS
   ============================================================ */
const cielo = $("cielo"), ctx = cielo.getContext("2d");
let estrellas = [];
function armarCielo(){
  cielo.width = innerWidth; cielo.height = innerHeight;
  estrellas = Array.from({length: Math.min(140, Math.round(innerWidth/9))}, ()=>({
    x: Math.random()*cielo.width, y: Math.random()*cielo.height,
    r: Math.random()*1.5 + .4, v: Math.random()*.6 + .2, fase: Math.random()*6.3
  }));
}
function pintarCielo(t){
  ctx.clearRect(0,0,cielo.width,cielo.height);
  estrellas.forEach(e=>{
    const brillo = .35 + .45*Math.sin(t/900 + e.fase);
    ctx.fillStyle = `rgba(255,235,205,${brillo})`;
    ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.3); ctx.fill();
  });
  requestAnimationFrame(pintarCielo);
}
armarCielo(); requestAnimationFrame(pintarCielo);
addEventListener("resize", armarCielo);

/* Tres símbolos que titilan en la portada */
$("senal-inicio").innerHTML = ["luz","nave","volar"].map(k=>SIMBOLOS[k].svg).join("");

/* ============================================================
   PARTE J — BOTONES
   ============================================================ */
$("btn-jugar").addEventListener("click", abrirNivel);
$("btn-listo").addEventListener("click", abrirPregunta);
$("btn-siguiente").addEventListener("click", siguiente);
$("btn-continuar").addEventListener("click", continuar);
$("btn-reiniciar").addEventListener("click", reiniciar);
$("btn-glosario").addEventListener("click", abrirGlosario);
$("btn-cerrar-glosario").addEventListener("click", ()=> $("dialogo-glosario").close());
