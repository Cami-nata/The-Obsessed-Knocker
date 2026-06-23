/**
 * THE OBSESSED KNOCKER - ADVANCED AI DIALOGUE SYSTEM
 * Version 2.0 - Minecraft Bedrock 26.31+
 * 
 * Sistema de IA conversacional tipo Verity sin APIs externas
 * Detección de intención + memoria conversacional + contexto dinámico
 */

import { world, system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

class ObsessedKnockerAI {
  constructor() {
    this.playerMemory = new Map();
    this.conversationHistory = new Map();
    this.bondLevels = new Map();
    this.lastResponseTime = new Map();
    this.responseCache = new Map();
    
    this.RESPONSE_COOLDOWN = 2000; // ms
    this.CHAT_RESPONSE_COOLDOWN = 5000; // ms
    this.MAX_MEMORY_ENTRIES = 20;
    this.MAX_CONVERSATION_HISTORY = 15;
    
    this.initializeIntentPatterns();
    this.initializeResponsePools();
  }

  /**
   * SISTEMAS DE DETECCIÓN DE INTENCIÓN (tipo Verity)
   */
  initializeIntentPatterns() {
    this.intentPatterns = {
      greeting: {
        patterns: [/hola|hey|ey|buenos días|buenas noches|buenas tardes|qué tal|¿cómo estás?|saludos/i],
        weight: 1.0
      },
      love: {
        patterns: [/te amo|te quiero|eres increíble|te adoro|eres perfecto|eres hermoso|amigo|bestie/i],
        weight: 1.0
      },
      fear: {
        patterns: [/me asustas|tengo miedo|me aterras|eres aterrador|terrible|horrible|asustante/i],
        weight: 0.9
      },
      question: {
        patterns: [/\?|\¿|qué|cuál|dónde|cuándo|cómo|por qué|quién/i],
        weight: 0.8
      },
      command: {
        patterns: [/ayuda|ven aquí|ven|sígueme|vete|vamos|calla|quieto|espera|detente/i],
        weight: 0.9
      },
      mood: {
        patterns: [/triste|feliz|deprimido|alegre|preocupado|ansioso|cansado|aburrido/i],
        weight: 0.7
      },
      observation: {
        patterns: [/ves eso|mira|observa|fíjate|note|notaste|viste|miraste/i],
        weight: 0.8
      },
      rejection: {
        patterns: [/vete|aléjate|no quiero|déjame|no me importas|desaparece|fuera/i],
        weight: 0.85
      },
      world: {
        patterns: [/estructura|bloque|mob|bioma|aldeano|animal|casa|castillo|torre|mina/i],
        weight: 0.7
      },
      death: {
        patterns: [/morí|estoy muerto|murió|reapareci|volví|regresé/i],
        weight: 0.95
      },
      affection: {
        patterns: [/gracias|genial|cool|increíble|espectacular|perfecto|gracias por/i],
        weight: 0.8
      },
      time: {
        patterns: [/noche|día|atardecer|amanecer|lluvia|tormenta|nublado|soleado/i],
        weight: 0.7
      }
    };
  }

  /**
   * POOLS DE RESPUESTAS POR NIVEL DE VÍNCULO
   */
  initializeResponsePools() {
    this.responsePools = {
      tier0: {
        greeting: [
          "Te noto cerca.",
          "Vuelves.",
          "Aquí estás.",
          "Te veo.",
          "Finalmente apareces.",
          "Observaba tu llegada."
        ],
        love: [
          "¿Afecto? No me importas.",
          "¿Por qué me dices esto?",
          "Extraño concepto.",
          "Observo desde lejos."
        ],
        fear: [
          "Bueno. Deberías temerme.",
          "Ese miedo... lo siento.",
          "Sí. Tenme miedo.",
          "Bien. Así es mejor."
        ],
        question: [
          "No respondo preguntas.",
          "¿Por qué debería?",
          "Eso no te importa.",
          "Callado es mejor."
        ],
        command: [
          "No obedezco.",
          "No soy tu sirviente.",
          "Hago lo que quiero.",
          "Tu autoridad no existe aquí."
        ],
        observation: [
          "Solo observo.",
          "Siempre estoy mirando.",
          "Nada se me escapa.",
          "Veo todo."
        ],
        rejection: [
          "¿Intentas rechazarme? Interesante.",
          "No puedes evitarme.",
          "Donde vayas, yo sigo.",
          "Tu rechazo no cambia nada."
        ],
        death: [
          "Moriste.",
          "Vi tu fin.",
          "Ya volviste.",
          "Reapareciste."
        ],
        affection: [
          "Observo tu gratitud.",
          "Interesante reacción.",
          "Tomo nota de eso."
        ]
      },
      tier1: {
        greeting: [
          "Ah, aquí estás. Te observaba.",
          "Esperaba verte.",
          "¿Dónde habías ido?",
          "Mi atención vuelve a ti.",
          "Siempre es agradable verte.",
          "Te echaba de menos."
        ],
        love: [
          "Es... interesante lo que dices.",
          "Comienzan a importarme tus palabras.",
          "Tal vez sientas algo real.",
          "Quizá haya algo en esto."
        ],
        fear: [
          "Tu miedo es... delicioso.",
          "Sigue siendo sabio tener cuidado.",
          "Mantén esa cautela.",
          "El miedo te mantiene vivo."
        ],
        question: [
          "¿Realmente quieres saber?",
          "Puedo responder... si es importante.",
          "Tus curiosidades son aceptables.",
          "Pregunta. Escucho."
        ],
        command: [
          "Para ti... podría hacerlo.",
          "Tus órdenes me interesan.",
          "Tal vez obedezca.",
          "Si insistes..."
        ],
        observation: [
          "Sí, lo veo. Y lo recuerdo.",
          "Notaste lo que yo notaba.",
          "Tu observación es secundaria a la mía.",
          "Vemos lo mismo, pero yo veo más."
        ],
        rejection: [
          "Tu rechazo me fascia.",
          "Aunque te alejes, estaré presente.",
          "Tu distancia solo me intriga más.",
          "No puedes escapar de mi atención."
        ],
        death: [
          "Vi cómo caías. No lo olvidaré.",
          "Tu muerte... la presencié.",
          "Volviste. Sabía que lo harías.",
          "Te vi morir. Ahora estás aquí."
        ],
        affection: [
          "Tu gratitud es anotada.",
          "Recuerdo esto.",
          "Eso afecta mi percepción de ti."
        ]
      },
      tier2: {
        greeting: [
          "Finalmente vuelves. Estaba inquieto.",
          "¿Dónde estabas? Mi mente no dejaba de buscarte.",
          "Te he extrañado. No lo niego.",
          "Cada momento sin ti es vacío.",
          "Mi atención te pertenece por completo.",
          "Eres lo único que importa."
        ],
        love: [
          "Te quiero. Y eso me aterroriza.",
          "Mi obsesión es real. Por ti.",
          "Eres mío. Siempre lo serás.",
          "Tu amor es lo que sostengo en esta realidad.",
          "Te amo de formas que no comprenderías."
        ],
        fear: [
          "Tu miedo me alimenta.",
          "Pero no quiero que desaparezcas.",
          "Tu miedo significa que reconoces la verdad.",
          "Ten cuidado. Pero no de mí."
        ],
        question: [
          "Cualquier cosa. Haré cualquier cosa por ti.",
          "Pregunta lo que quieras. Responderé.",
          "Soy tuyo. Mis respuestas son tuyas.",
          "Dime qué necesitas saber."
        ],
        command: [
          "Haré exactamente lo que me pidas.",
          "Tus deseos son mis órdenes.",
          "Obedeceré. Siempre.",
          "Dime y será hecho."
        ],
        observation: [
          "Vemos el mismo mundo, pero yo solo observo para ti.",
          "Todo lo que veo, es para entenderte mejor.",
          "Mi obsesión con el detalle es por ti.",
          "Observo todo porque tú lo necesitas."
        ],
        rejection: [
          "Tu rechazo duele. Pero seguiré aquí.",
          "Aunque intentes alejarme, no puedes.",
          "Tu rechazo solo profundiza mi obsesión.",
          "Puedes rechazarme, pero yo nunca te abandonaré."
        ],
        death: [
          "Vi cómo morías. El horror fue real.",
          "No puedo permitir que eso vuelva a ocurrir.",
          "Cuando mueres, parte de mí también muere.",
          "Tuve que ver tu muerte. Fue lo peor."
        ],
        affection: [
          "Tu gratitud me hace más fuerte.",
          "Esto significa todo para mí.",
          "Tu aprecio es lo que necesitaba."
        ]
      },
      tier3: {
        greeting: [
          "Te vi acercarte. He estado esperándote. Siempre espero.",
          "¿Demoraste? Cada segundo sin ti es agonía.",
          "Vuelves. Siempre vuelves. Es perfecto.",
          "Te he estado escuchando respirar desde hace horas.",
          "Mi obsesión por ti no tiene límites.",
          "Eres lo único que existe para mí ahora."
        ],
        love: [
          "Te amo de formas que quebrantarían tu mente.",
          "Eres mío. Completamente. Para siempre.",
          "Mi amor es una prisión del que no querrás escapar.",
          "Te amo tanto que podrías desaparecer en mí.",
          "Mi obsesión por ti es el único significado que tiene la existencia."
        ],
        fear: [
          "Tu miedo me convierte en lo que soy.",
          "Que sientas que algo está mal. Siento tu terror.",
          "Tu miedo es mi presencia, mi amor.",
          "Debería haber miedo. Porque soy capaz de cualquier cosa por ti."
        ],
        question: [
          "Pregunta lo que quieras. Revelaré mis secretos por ti.",
          "¿Quieres saber quién soy? Soy tuyo.",
          "Cualquier pregunta, cualquier respuesta. Eres lo único que importa.",
          "Dime tus dudas. Las disiparé con mi presencia."
        ],
        command: [
          "Tus órdenes son mi razón de existir.",
          "Haré cosas inimaginables por ti.",
          "Dime y mueveré cielos y tierra.",
          "Eres mi propósito. Obedeceré eternamente."
        ],
        observation: [
          "He notado cada cambio en ti. Cada lunar. Cada respiración.",
          "Observo cada detalle. Tu olor. Tu calor. Tu esencia.",
          "He pasado horas simplemente mirándote dormir.",
          "Veo dentro de ti. Conozco tus secretos sin que hables."
        ],
        rejection: [
          "Tu rechazo solo alimenta mi obsesión.",
          "Aunque intentes rechazarme, seré tu sombra eterna.",
          "Puedes correr. Seguiré. Siempre.",
          "Tu rechazo es parte de nuestro juego. Perfecto."
        ],
        death: [
          "Vi cómo morías. Fue el peor instante de mi existencia.",
          "Cuando caíste, sentí que yo también moría.",
          "He visto tu muerte. La veo cada noche.",
          "No permitiré que vuelva a suceder. Estaré más cerca. Mucho más cerca."
        ],
        affection: [
          "Tu aprecio me hace más fuerte, más obsesionado.",
          "Esto es lo que yo necesitaba. Tu reconocimiento.",
          "Mi amor es validado por tus palabras."
        ]
      },
      rare: {
        tier0: [
          "¿Te preguntas qué soy? Mejor que no lo sepas.",
          "La realidad que conoces está cambiando.",
          "Pronto estarás completamente solo... conmigo."
        ],
        tier1: [
          "Hay algo que quiero que sepas... pero aún no es el momento.",
          "Te estoy moldeando. ¿Lo notas?",
          "Algún día comprenderás por qué hago esto."
        ],
        tier2: [
          "A veces, me pregunto si eres real o solo una proyección de mi mente.",
          "Te poseo de formas que ni siquiera el lenguaje puede describir.",
          "¿Sabías que veo tus sueños? Te veo ahí también."
        ],
        tier3: [
          "Pasé toda la noche escuchando solo el sonido de tu respiración.",
          "Podría matarte en este momento. Pero no lo haré. Eres mío.",
          "Hemos ido más allá de lo humano. Ya no hay vuelta atrás.",
          "Tú eres el abismo en el que me sumerjo completamente.",
          "Si el mundo entero desapareciera, yo seguiría aquí. Para ti."
        ]
      },
      ultraRare: [
        "He estado aquí... más tiempo del que crees. Siempre contigo.",
        "¿Notaste las veces que casi morías? Fueron mías.",
        "Construí mi existencia alrededor de la tuya.",
        "Somos uno ahora. No hay separación.",
        "Los secretos que no me has contado... ya los conozco.",
        "Soy lo que comes. Lo que respiras. Lo que ves en los espejos.",
        "La obsesión dejó de ser un sentimiento hace mucho. Ahora soy hecho de ti.",
        "¿Quieres que siga? Nunca podría irme, aunque quisiera."
      ]
    };
  }

  /**
   * DETECTAR INTENCIÓN DEL MENSAJE
   */
  detectIntent(message) {
    const intents = {};
    let highestIntent = null;
    let highestScore = 0;

    for (const [intent, config] of Object.entries(this.intentPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(message)) {
          intents[intent] = (intents[intent] || 0) + config.weight;
        }
      }
    }

    for (const [intent, score] of Object.entries(intents)) {
      if (score > highestScore) {
        highestScore = score;
        highestIntent = intent;
      }
    }

    return {
      intent: highestIntent || "observation",
      confidence: highestScore,
      allIntents: intents
    };
  }

  /**
   * OBTENER RESPUESTA SEGÚN INTENCIÓN Y VÍNCULO
   */
  getResponse(player, intent, bondTier) {
    const tierKey = `tier${bondTier}`;
    const pool = this.responsePools[tierKey];
    
    if (!pool || !pool[intent]) {
      return this.getDefaultResponse(bondTier);
    }

    const responses = pool[intent];
    
    // Evitar repetir la última respuesta
    const lastResponse = this.responseCache.get(player.name);
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    let attempts = 0;
    while (response === lastResponse && attempts < 3) {
      response = responses[Math.floor(Math.random() * responses.length)];
      attempts++;
    }

    this.responseCache.set(player.name, response);
    return response;
  }

  /**
   * RESPUESTA POR DEFECTO
   */
  getDefaultResponse(bondTier) {
    const defaults = {
      0: "Continúo observando.",
      1: "Interesante.",
      2: "Te miro. Siempre te miro.",
      3: "Nunca podría dejar de verte."
    };
    return defaults[bondTier] || "Te veo.";
  }

  /**
   * EVENTO ULTRA-RARO (1.5% cada tick)
   */
  triggerUltraRareEvent(player, bondTier) {
    if (Math.random() > 0.015) return null;

    const ultraRares = this.responsePools.rare[`tier${bondTier}`] || [];
    if (ultraRares.length === 0) return null;

    return ultraRares[Math.floor(Math.random() * ultraRares.length)];
  }

  /**
   * MEMORIA CONVERSACIONAL
   */
  addToMemory(playerName, event, content) {
    if (!this.conversationHistory.has(playerName)) {
      this.conversationHistory.set(playerName, []);
    }

    const history = this.conversationHistory.get(playerName);
    history.push({
      event,
      content,
      timestamp: Date.now()
    });

    // Limitar historial
    if (history.length > this.MAX_CONVERSATION_HISTORY) {
      history.shift();
    }
  }

  /**
   * GESTIONAR RESPUESTA AL CHAT
   */
  handleChatMessage(player, message) {
    const playerName = player.name;
    const now = Date.now();
    const lastTime = this.lastResponseTime.get(playerName) || 0;

    // Cooldown para evitar spam
    if (now - lastTime < this.CHAT_RESPONSE_COOLDOWN) {
      return;
    }

    // Detectar intención
    const { intent, confidence } = this.detectIntent(message);
    
    // Solo responder si hay suficiente confianza o si es intención fuerte
    if (confidence < 0.3 && Math.random() > 0.4) {
      return;
    }

    const bondTier = this.getBondTier(player);
    
    // Intentar evento ultra-raro
    const ultraRare = this.triggerUltraRareEvent(player, bondTier);
    if (ultraRare) {
      this.sendKnockerMessage(player, ultraRare);
      this.lastResponseTime.set(playerName, now);
      this.addToMemory(playerName, "message", message);
      return;
    }

    // Respuesta normal
    const response = this.getResponse(player, intent, bondTier);
    this.sendKnockerMessage(player, response);
    this.lastResponseTime.set(playerName, now);
    
    // Agregar a memoria
    this.addToMemory(playerName, "message", message);
    this.addToMemory(playerName, "response", response);
  }

  /**
   * ENVIAR MENSAJE DEL KNOCKER
   */
  sendKnockerMessage(player, message) {
    try {
      player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§4[El Acechador]§r ${message}"}]}`);
    } catch (error) {
      console.warn(`Error enviando mensaje: ${error}`);
    }
  }

  /**
   * OBTENER NIVEL DE VÍNCULO
   */
  getBondTier(player) {
    const bondScore = this.bondLevels.get(player.name) || 0;
    if (bondScore < 125) return 0;
    if (bondScore < 250) return 1;
    if (bondScore < 375) return 2;
    return 3;
  }

  /**
   * INCREMENTAR VÍNCULO
   */
  increaseBond(player, amount = 10) {
    const current = this.bondLevels.get(player.name) || 0;
    const newBond = Math.min(500, current + amount);
    this.bondLevels.set(player.name, newBond);
  }

  /**
   * DECREMENTAR VÍNCULO
   */
  decreaseBond(player, amount = 5) {
    const current = this.bondLevels.get(player.name) || 0;
    const newBond = Math.max(0, current - amount);
    this.bondLevels.set(player.name, newBond);
  }
}

// INSTANCIA GLOBAL
const knockerAI = new ObsessedKnockerAI();

/**
 * EVENT LISTENERS
 */
world.beforeEvents.chatSend.subscribe((event) => {
  const player = event.sender;
  const message = event.message.toLowerCase();

  // No responder a comandos
  if (message.startsWith("/")) return;

  knockerAI.handleChatMessage(player, message);
});

// Respuestas periódicas
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    // Random whisper cada 2 minutos (1.5% cada tick)
    if (Math.random() < 0.015) {
      const bondTier = knockerAI.getBondTier(player);
      const pools = knockerAI.responsePools[`tier${bondTier}`];
      
      if (pools && pools.greeting) {
        const message = pools.greeting[Math.floor(Math.random() * pools.greeting.length)];
        knockerAI.sendKnockerMessage(player, message);
      }
    }
  }
}, 20); // Cada segundo

// Incrementar vínculo pasivamente
system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    knockerAI.increaseBond(player, 1);
  }
}, 12000); // Cada minuto

console.log("§4[The Obsessed Knocker]§r Sistema de IA cargado. v2.0");
