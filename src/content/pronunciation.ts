import { normalizeAnswer } from '../domain/learning/engine';

/**
 * LV-008-LEARN-03 Pronunciation Coach editorial catalog.
 *
 * Finite, hand-written data. Nothing here is generated at runtime, spoken by TTS
 * (only `original` and unit `text` are spoken, in `locale`) or used to recognise
 * or grade answers. Spanish approximations are orientation, not phonetics.
 *
 * Approximation conventions (documented in docs/LV-008-LEARN-03-PRONUNCIATION.md):
 * - Acute accents mark the stressed syllable when Spanish reading rules would put it elsewhere.
 *   In French this is the final syllable of the group, matching French rhythm.
 * - ã õ ẽ: French nasal vowels (no n is pronounced). zh: /ʒ/. sh: /ʃ/. ü: /y/. ö: /ø/.
 * - English: j = soft h (air only); th = /θ/; d before vowels in the/this = /ð/ (see tip);
 *   ii = long /iː/; (r) = r that many British voices barely pronounce.
 */
export type PronunciationLanguage = 'fr' | 'en';

export interface SoundTip { id: string; language: PronunciationLanguage; label: string; explanation: string }

const tipCatalog = {
  'fr-nasal-o': { language: 'fr', label: 'Vocal nasal õ (on)', explanation: 'õ es la vocal de bon: una o con parte del aire saliendo por la nariz. La n escrita no se pronuncia.' },
  'fr-nasal-a': { language: 'fr', label: 'Vocal nasal ã (an, en)', explanation: 'ã es una a nasal, con la boca abierta y aire por la nariz, como en rendez o attends. No agregues una n.' },
  'fr-nasal-in': { language: 'fr', label: 'Vocal nasal ẽ (in, un, ien)', explanation: 'ẽ es una e abierta y nasal, como en vin o combien. No agregues una n. Algunas personas dicen un con los labios más redondeados; las dos formas se entienden.' },
  'fr-zh': { language: 'fr', label: 'j francesa = zh', explanation: 'zh se parece a sh con vibración de voz. No es la jota ni la y españolas.' },
  'fr-r': { language: 'fr', label: 'r francesa', explanation: 'La r francesa se forma atrás, cerca de la garganta, sin hacer vibrar la punta de la lengua. La r escrita en la guía no es la erre española.' },
  'fr-u': { language: 'fr', label: 'u francesa = ü', explanation: 'Decí i y, sin mover la lengua, redondeá los labios como para u. Si decís u española, tu puede oírse como tout.' },
  'fr-ou': { language: 'fr', label: 'ou = u', explanation: 'ou se dice como la u española: vous suena vu.' },
  'fr-oi': { language: 'fr', label: 'oi = ua', explanation: 'oi suena ua: soir → suar, droit → druá.' },
  'fr-schwa': { language: 'fr', label: 'e débil (je, le, re)', explanation: 'La e de je, le o revoir es breve y relajada, con los labios algo redondeados; a veces casi desaparece. No es una é marcada.' },
  'fr-e-open': { language: 'fr', label: 'e abierta (ai, è)', explanation: 'La é de la guía en plé o vudré orienta hacia una e más abierta que la española: abrí un poco más la boca.' },
  'fr-v': { language: 'fr', label: 'v francesa', explanation: 'La v se hace apoyando los dientes de arriba en el labio inferior. En francés no se confunde con b: vous (usted) y bout (punta) son palabras distintas.' },
  'fr-silent-final': { language: 'fr', label: 'Consonantes finales mudas', explanation: 'Muchas consonantes escritas al final no se pronuncian: la t de plaît, la s de vous, la d de attends. La guía solo escribe lo que suena.' },
  'fr-enchainement': { language: 'fr', label: 'Palabras encadenadas', explanation: 'Si una palabra termina en una consonante que suena y la siguiente empieza con vocal, se dicen juntas: une amie → ü namí, tourne à → tur na.' },
  'fr-final-stress': { language: 'fr', label: 'Fuerza al final del grupo', explanation: 'En francés la fuerza cae suavemente en la última sílaba del grupo de palabras, no en cada palabra. Las tildes de la guía marcan esa sílaba cuando la lectura española la pondría en otro lugar.' },
  'fr-question': { language: 'fr', label: 'Pregunta con la voz', explanation: 'Esta pregunta se forma subiendo la voz al final, sin cambiar el orden de las palabras.' },
  'en-h': { language: 'en', label: 'h inglesa = j suave', explanation: 'La j de la guía representa la h inglesa: solo aire suave, más leve que la jota de muchos acentos. No es muda.' },
  'en-th-voiceless': { language: 'en', label: 'th sin voz (thank, theatre)', explanation: 'Poné la punta de la lengua entre los dientes y soplá, sin voz: suena como la z de España. Evitá t o s: thank podría oírse como tank.' },
  'en-th-voiced': { language: 'en', label: 'th con voz (the, this)', explanation: 'Lengua entre los dientes con vibración de voz, como la d suave de «nada» o «cada». La guía escribe d como orientación.' },
  'en-long-ee': { language: 'en', label: 'i larga (need, please)', explanation: 'ii indica una i larga y tensa. La duración importa: sheep (oveja) y ship (barco) se distinguen por esta vocal.' },
  'en-short-i': { language: 'en', label: 'i breve (is, it, this)', explanation: 'La i de is, it o this es breve y relajada, entre i y e. La guía la escribe i.' },
  'en-final-z': { language: 'en', label: 's con voz (please, is)', explanation: 'La z de la guía es una s que vibra, como el zumbido de una abeja. No es la z de España ni una s seca.' },
  'en-final-consonant': { language: 'en', label: 'Consonantes finales', explanation: 'Las consonantes finales se pronuncian sin agregar vocal: help, need, good. Evitá decir «helpe» o «nide».' },
  'en-r': { language: 'en', label: 'r inglesa', explanation: 'La r inglesa no vibra: la lengua no toca el paladar. En el acento británico la r final casi no se oye; por eso la guía la escribe entre paréntesis.' },
  'en-weak-vowel': { language: 'en', label: 'Vocales débiles', explanation: 'Las palabras pequeñas se reducen: can → ken, to → te, the → de. Esa vocal breve y neutra hace sonar natural la frase.' },
  'en-ae': { language: 'en', label: 'a abierta (thank, lantern)', explanation: 'La a de thank o lantern se dice con la boca bien abierta. En voces estadounidenses se acerca más a una e.' },
  'en-ou': { language: 'en', label: 'o que termina en u (hello)', explanation: 'El final de hello es un deslizamiento de o hacia u: lóu. No es una o fija.' },
  'en-question': { language: 'en', label: 'Pregunta con el verbo delante', explanation: 'Is it…? pone el verbo antes del sujeto; en preguntas de sí o no la voz suele subir al final.' },
  'en-dge': { language: 'en', label: 'dge final (bridge)', explanation: 'La dge de bridge es como una ch con vibración de voz. La guía escribe ch como orientación.' },
} as const satisfies Record<string, Omit<SoundTip, 'id'>>;
export type SoundTipId = keyof typeof tipCatalog;
export const soundTips: SoundTip[] = Object.entries(tipCatalog).map(([id, tip]) => ({ id, ...tip }));

export interface PronunciationUnit { text: string; meaning: string; approximate?: string }
export interface EditorialReview {
  status: 'ai-editorial' | 'teacher-reviewed';
  reviewed: string;
  note: string;
}
export interface PronunciationGuide {
  id: string;
  original: string;
  language: PronunciationLanguage;
  /** Locale requested from device TTS for `original` and every unit text. */
  locale: 'fr-FR' | 'en-GB';
  translation: string;
  /** Communicative function, in Spanish. */
  purpose: string;
  approximate: string;
  ipa: string;
  units: PronunciationUnit[];
  tips: SoundTip[];
  /** Guide-specific observations, shown before the shared sound tips. */
  focus: string[];
  caveat?: string;
  review: EditorialReview;
  sources: string[];
  /** `lessonId/exerciseId` where the expression (or a chunk of it) is a correct answer. */
  usedIn: string[];
  /** Derived from `units`; kept for existing consumers (rescue, construction, StudyAudio). */
  segments: string[];
  /** Derived from `focus` and `tips`. */
  notes: string[];
}

const reviewed: EditorialReview = {
  status: 'ai-editorial', reviewed: '2026-11-02',
  note: 'Revisión editorial asistida por IA contra transcripciones IPA de diccionarios de referencia. Pendiente de revisión docente humana y de escucha real.',
};
const britishCaveat = 'La guía sigue una pronunciación británica estándar; tu dispositivo puede usar una voz estadounidense.';
const cafe = 'fr-a1-paris-cafe', meeting = 'fr-a1-paris-rendezvous', london = 'en-a1-london-lost';
const fr = (word: string) => `https://fr.wiktionary.org/wiki/${encodeURIComponent(word)}`;
const larousse = 'https://www.larousse.fr/dictionnaires/college/';
const en = (word: string) => `https://dictionary.cambridge.org/pronunciation/english/${word}`;

type Draft = Omit<PronunciationGuide, 'language' | 'locale' | 'tips' | 'segments' | 'notes' | 'review' | 'focus'> & { tips: SoundTipId[]; focus?: string[] };
function guide(draft: Draft): PronunciationGuide {
  const language: PronunciationLanguage = draft.id.startsWith('fr.') ? 'fr' : 'en';
  const tips = draft.tips.map(id => ({ id, ...tipCatalog[id] }));
  const focus = draft.focus ?? [];
  return { ...draft, language, locale: language === 'fr' ? 'fr-FR' : 'en-GB', tips, focus, review: reviewed,
    segments: draft.units.map(unit => unit.text), notes: [...focus, ...tips.map(tip => tip.explanation)] };
}
const please = { text: 's’il vous plaît', meaning: 'por favor', approximate: 'sil vu plé' };

export const pronunciationGuides: PronunciationGuide[] = [
  // ——— Revisadas de LV-007-LEARN-02 ———
  guide({ id: 'fr.bonjour', original: 'Bonjour !', translation: 'Hola / buenos días.', purpose: 'Saludar con cortesía al llegar, de día.', approximate: 'bõzhúr', ipa: '/bɔ̃.ʒuʁ/',
    units: [{ text: 'Bonjour !', meaning: 'Saludo completo; se practica entero.', approximate: 'bõzhúr' }], tips: ['fr-nasal-o', 'fr-zh', 'fr-r'],
    sources: [larousse + 'bonjour/4938'], usedIn: [`${cafe}/bonjour`, `${meeting}/greet`] }),
  guide({ id: 'fr.sil-vous-plait', original: "S'il vous plaît", translation: 'Por favor.', purpose: 'Pedir algo con cortesía; se usa al final de casi cualquier pedido.', approximate: 'sil vu plé', ipa: '/sil vu plɛ/',
    units: [{ text: "S'il vous plaît", meaning: 'Fórmula fija; se escucha completa.', approximate: 'sil vu plé' }], tips: ['fr-ou', 'fr-v', 'fr-e-open', 'fr-silent-final'],
    focus: ['La t final de plaît no se pronuncia.'],
    sources: ['https://www.collinsdictionary.com/dictionary/english/sil-vous-plait'], usedIn: [`${cafe}/commande`, `${cafe}/lieu-cafe`, `${meeting}/ask`] }),
  guide({ id: 'fr.oui-jai-rendez-vous-ici', original: "Oui, j'ai rendez-vous ici.", translation: 'Sí, tengo una cita/encuentro aquí.', purpose: 'Confirmar que viniste a encontrarte con alguien.', approximate: 'ui, zhé rãdevú isí', ipa: '/wi ʒe ʁɑ̃.de.vu i.si/',
    units: [{ text: 'Oui,', meaning: 'Sí,', approximate: 'ui' }, { text: "j'ai rendez-vous", meaning: 'tengo una cita', approximate: 'zhé rãdevú' }, { text: 'ici.', meaning: 'aquí.', approximate: 'isí' }],
    tips: ['fr-zh', 'fr-nasal-a', 'fr-r', 'fr-silent-final'], focus: ['En rendez-vous no suenan ni la z ni la s finales: rãdevú.'],
    sources: [larousse + 'oui/28916', larousse + 'rendez-vous/34451', larousse + 'ici/20277'], usedIn: [`${meeting}/confirm`] }),
  guide({ id: 'fr.oui-jattends-une-amie', original: "Oui, j'attends une amie.", translation: 'Sí, estoy esperando a una amiga.', purpose: 'Explicar a quién esperás.', approximate: 'ui, zhatã ü namí', ipa: '/wi ʒa.tɑ̃ y.n‿a.mi/',
    units: [{ text: 'Oui,', meaning: 'Sí,', approximate: 'ui' }, { text: "j'attends", meaning: 'estoy esperando', approximate: 'zhatã' }, { text: 'une amie.', meaning: 'a una amiga.', approximate: 'ü namí' }],
    tips: ['fr-zh', 'fr-nasal-a', 'fr-u', 'fr-enchainement'], focus: ['La d y la s finales de attends no suenan.', 'La n de une se une a amie: ü namí. La e final de amie no agrega una sílaba.'],
    sources: ['https://www.larousse.fr/dictionnaires/french-english/attendre/6209', larousse + 'un/41301', larousse + 'ami/1410'], usedIn: [`${meeting}/confirm`] }),
  guide({ id: 'fr.ou-est-la-fontaine', original: 'Où est la fontaine ?', translation: '¿Dónde está la fuente?', purpose: 'Preguntar por un lugar.', approximate: 'u e la fõtén', ipa: '/u ɛ la fɔ̃.tɛn/',
    units: [{ text: 'Où est', meaning: 'Dónde está', approximate: 'u e' }, { text: 'la fontaine ?', meaning: 'la fuente', approximate: 'la fõtén' }],
    tips: ['fr-nasal-o', 'fr-silent-final'], focus: ['En est no suenan ni la s ni la t: se dice e, abierta.', 'La n final de fontaine sí se oye; es distinta de la nasal õ de su primera sílaba.'],
    sources: [larousse + 'fontaine/16868'], usedIn: [`${meeting}/ask`] }),
  guide({ id: 'en.hello', original: 'Hello!', translation: '¡Hola!', purpose: 'Saludar.', approximate: 'jelóu', ipa: '/həˈləʊ/ (UK), /həˈloʊ/ (US)',
    units: [{ text: 'Hello!', meaning: '¡Hola!', approximate: 'jelóu' }], tips: ['en-h', 'en-ou'], caveat: britishCaveat,
    sources: [en('hello')], usedIn: [`${london}/greet`] }),
  guide({ id: 'en.yes-please', original: 'Yes, please.', translation: 'Sí, por favor.', purpose: 'Aceptar una oferta con cortesía.', approximate: 'iés, plíiz', ipa: '/jes pliːz/',
    units: [{ text: 'Yes,', meaning: 'Sí,', approximate: 'iés' }, { text: 'please.', meaning: 'por favor.', approximate: 'plíiz' }], tips: ['en-long-ee', 'en-final-z'],
    focus: ['La i inicial de iés orienta al deslizamiento de yes; no agrega una sílaba.'], sources: [en('yes'), en('please')], usedIn: [`${london}/greet`] }),
  guide({ id: 'en.hello-yes-please', original: 'Hello! Yes, please.', translation: '¡Hola! Sí, por favor.', purpose: 'Saludar y aceptar la ayuda que te ofrecen.', approximate: 'jelóu; iés, plíiz', ipa: '/həˈləʊ jes pliːz/',
    units: [{ text: 'Hello!', meaning: '¡Hola!', approximate: 'jelóu' }, { text: 'Yes, please.', meaning: 'Sí, por favor.', approximate: 'iés, plíiz' }], tips: ['en-h', 'en-long-ee', 'en-final-z'], caveat: britishCaveat,
    sources: [en('hello'), en('yes'), en('please')], usedIn: [`${london}/greet`] }),
  guide({ id: 'en.im-new-here', original: "I'm new here.", translation: 'Soy nuevo/a por aquí.', purpose: 'Contar que acabás de llegar.', approximate: 'aim niú jíe(r)', ipa: '/aɪm njuː hɪə/ (UK)',
    units: [{ text: "I'm new", meaning: 'Soy nuevo/a', approximate: 'aim niú' }, { text: 'here.', meaning: 'aquí.', approximate: 'jíe(r)' }], tips: ['en-h', 'en-r'],
    focus: ['La vocal de here no es una i española: empieza en i y se desliza hacia una vocal neutra.', 'new suena niú en voces británicas y nú en muchas estadounidenses.'], caveat: britishCaveat,
    sources: [en('i-m'), en('new'), en('here')], usedIn: [`${london}/introduce`] }),
  guide({ id: 'en.i-need-help-please', original: 'I need help, please.', translation: 'Necesito ayuda, por favor.', purpose: 'Pedir ayuda con cortesía.', approximate: 'ai níid jelp, plíiz', ipa: '/aɪ niːd help pliːz/',
    units: [{ text: 'I need help,', meaning: 'Necesito ayuda,', approximate: 'ai níid jelp' }, { text: 'please.', meaning: 'por favor.', approximate: 'plíiz' }], tips: ['en-long-ee', 'en-h', 'en-final-consonant', 'en-final-z'],
    sources: [en('need'), en('help'), en('please')], usedIn: [`${london}/help`] }),
  guide({ id: 'en.can-you-help-me-please', original: 'Can you help me, please?', translation: '¿Podés ayudarme, por favor?', purpose: 'Pedir ayuda con una pregunta cortés.', approximate: 'ken iú jelp mi, plíiz', ipa: '/kən juː help miː pliːz/',
    units: [{ text: 'Can you help me,', meaning: '¿Podés ayudarme,', approximate: 'ken iú jelp mi' }, { text: 'please?', meaning: 'por favor?', approximate: 'plíiz' }], tips: ['en-weak-vowel', 'en-h', 'en-final-z'],
    focus: ['La e de ken es breve y relajada: es la forma débil de can. Con énfasis puede sonar más abierta.'],
    sources: [en('help'), en('please'), 'https://downloads.bbc.co.uk/learningenglish/towardsadvanced/unit_16/bbc_tims_pron_wkshp_can.pdf'], usedIn: [`${london}/help`] }),

  // ——— Nuevas LV-008-LEARN-03: modelos que el principiante debe producir ———
  guide({ id: 'fr.bonsoir', original: 'Bonsoir !', translation: 'Buenas tardes / buenas noches.', purpose: 'Saludar al llegar, al atardecer o de noche.', approximate: 'bõsuár', ipa: '/bɔ̃.swaʁ/',
    units: [{ text: 'Bonsoir !', meaning: 'Saludo completo; se practica entero.', approximate: 'bõsuár' }], tips: ['fr-nasal-o', 'fr-oi', 'fr-r'],
    sources: [fr('bonsoir')], usedIn: [`${meeting}/greet`] }),
  guide({ id: 'fr.je-voudrais-un-cafe', original: 'Je voudrais un café, s’il vous plaît.', translation: 'Quisiera un café, por favor.', purpose: 'Pedir algo de forma cortés en una cafetería o tienda.', approximate: 'zhe vudré ẽ kafé, sil vu plé', ipa: '/ʒə vu.dʁɛ œ̃ ka.fe sil vu plɛ/',
    units: [{ text: 'Je voudrais', meaning: 'Quisiera', approximate: 'zhe vudré' }, { text: 'un café,', meaning: 'un café,', approximate: 'ẽ kafé' }, please],
    tips: ['fr-zh', 'fr-schwa', 'fr-nasal-in', 'fr-r'], focus: ['La s final de voudrais no suena; normalmente no se enlaza con un.'],
    sources: [fr('vouloir'), fr('un'), fr('café')], usedIn: [`${cafe}/commande`] }),
  guide({ id: 'fr.un-cafe', original: 'Un café, s’il vous plaît.', translation: 'Un café, por favor.', purpose: 'Pedir de forma breve y cortés.', approximate: 'ẽ kafé, sil vu plé', ipa: '/œ̃ ka.fe sil vu plɛ/',
    units: [{ text: 'Un café,', meaning: 'Un café,', approximate: 'ẽ kafé' }, please], tips: ['fr-nasal-in', 'fr-silent-final'],
    sources: [fr('un'), fr('café')], usedIn: [`${cafe}/commande`] }),
  guide({ id: 'fr.je-prends-un-cafe', original: 'Je prends un café, s’il vous plaît.', translation: 'Tomo un café, por favor.', purpose: 'Decir qué vas a pedir.', approximate: 'zhe prã ẽ kafé, sil vu plé', ipa: '/ʒə pʁɑ̃ œ̃ ka.fe sil vu plɛ/',
    units: [{ text: 'Je prends', meaning: 'Tomo / me llevo', approximate: 'zhe prã' }, { text: 'un café,', meaning: 'un café,', approximate: 'ẽ kafé' }, please],
    tips: ['fr-zh', 'fr-nasal-a', 'fr-nasal-in', 'fr-r'], focus: ['La d y la s finales de prends no suenan; normalmente no se enlaza con un.'],
    sources: [fr('prendre'), fr('un'), fr('café')], usedIn: [`${cafe}/commande`] }),
  guide({ id: 'fr.sur-place', original: 'Sur place, s’il vous plaît.', translation: 'Para tomar aquí, por favor.', purpose: 'Responder si te quedás a tomarlo en el local.', approximate: 'sür plas, sil vu plé', ipa: '/syʁ plas sil vu plɛ/',
    units: [{ text: 'Sur place,', meaning: 'Para tomar aquí,', approximate: 'sür plas' }, please], tips: ['fr-u', 'fr-r'],
    focus: ['place termina con s: la e final no suena.'], sources: [fr('sur place')], usedIn: [`${cafe}/lieu-cafe`, `${cafe}/lieu-the`] }),
  guide({ id: 'fr.oui-sil-vous-plait', original: 'Oui, s’il vous plaît.', translation: 'Sí, por favor.', purpose: 'Aceptar algo que te ofrecen.', approximate: 'ui, sil vu plé', ipa: '/wi sil vu plɛ/',
    units: [{ text: 'Oui,', meaning: 'Sí,', approximate: 'ui' }, please], tips: ['fr-ou', 'fr-e-open'],
    focus: ['oui se dice en una sola sílaba: ui, como en «fui».'], sources: [fr('oui')], usedIn: [`${cafe}/sucre-place`, `${cafe}/sucre-emporter`] }),
  guide({ id: 'fr.cest-combien', original: "C'est combien ?", translation: '¿Cuánto cuesta?', purpose: 'Preguntar el precio.', approximate: 'se kõbiẽ', ipa: '/sɛ kɔ̃.bjɛ̃/',
    units: [{ text: "C'est", meaning: 'Es', approximate: 'se' }, { text: 'combien ?', meaning: 'cuánto', approximate: 'kõbiẽ' }],
    tips: ['fr-nasal-o', 'fr-nasal-in', 'fr-final-stress'], focus: ["En c'est no suenan la s ni la t: se.", 'combien tiene dos nasales distintas: kõ y biẽ. La fuerza va al final: kõ-BIẼ.'],
    sources: [fr('combien')], usedIn: [`${cafe}/prix`] }),
  guide({ id: 'fr.merci', original: 'Merci.', translation: 'Gracias.', purpose: 'Agradecer.', approximate: 'mersí', ipa: '/mɛʁ.si/',
    units: [{ text: 'Merci.', meaning: 'Gracias.', approximate: 'mersí' }], tips: ['fr-r', 'fr-final-stress'],
    sources: [fr('merci')], usedIn: [`${cafe}/merci`, `${cafe}/sucre-place`, `${meeting}/meet-a`] }),
  guide({ id: 'fr.au-revoir', original: 'Au revoir.', translation: 'Adiós / hasta luego.', purpose: 'Despedirte con cortesía.', approximate: 'o revuár', ipa: '/o ʁə.vwaʁ/',
    units: [{ text: 'Au revoir.', meaning: 'Despedida completa; se practica entera.', approximate: 'o revuár' }], tips: ['fr-schwa', 'fr-oi', 'fr-r'],
    focus: ['au se dice o. En conversación rápida la e de revoir casi desaparece: orvuár.'], sources: [fr('au revoir')], usedIn: [`${cafe}/depart`] }),
  guide({ id: 'fr.ou-est-la-fontaine-svp', original: 'Où est la fontaine, s’il vous plaît ?', translation: '¿Dónde está la fuente, por favor?', purpose: 'Preguntar por un lugar con cortesía.', approximate: 'u e la fõtén, sil vu plé', ipa: '/u ɛ la fɔ̃.tɛn sil vu plɛ/',
    units: [{ text: 'Où est', meaning: 'Dónde está', approximate: 'u e' }, { text: 'la fontaine,', meaning: 'la fuente,', approximate: 'la fõtén' }, please],
    tips: ['fr-nasal-o', 'fr-silent-final'], focus: ['En est no suenan ni la s ni la t.', 'La n final de fontaine sí se oye.'],
    sources: [larousse + 'fontaine/16868'], usedIn: [`${meeting}/ask`] }),
  guide({ id: 'fr.ou-est-le-kiosque-svp', original: 'Où est le kiosque, s’il vous plaît ?', translation: '¿Dónde está el quiosco, por favor?', purpose: 'Preguntar por un lugar con cortesía.', approximate: 'u e le kiósk, sil vu plé', ipa: '/u ɛ lə kjɔsk sil vu plɛ/',
    units: [{ text: 'Où est', meaning: 'Dónde está', approximate: 'u e' }, { text: 'le kiosque,', meaning: 'el quiosco,', approximate: 'le kiósk' }, please],
    tips: ['fr-schwa', 'fr-silent-final'], focus: ['kiosque termina en sk: la -que final no agrega una vocal.'],
    sources: [fr('kiosque')], usedIn: [`${meeting}/ask`] }),
  guide({ id: 'fr.je-vais-tout-droit', original: 'Je vais tout droit ?', translation: '¿Sigo derecho?', purpose: 'Confirmar una indicación.', approximate: 'zhe ve tu druá', ipa: '/ʒə vɛ tu dʁwa/',
    units: [{ text: 'Je vais', meaning: 'Voy', approximate: 'zhe ve' }, { text: 'tout droit ?', meaning: 'derecho / recto', approximate: 'tu druá' }],
    tips: ['fr-zh', 'fr-oi', 'fr-silent-final', 'fr-question'], focus: ['En vais, tout y droit no suenan las consonantes finales.'],
    sources: [fr('tout droit')], usedIn: [`${meeting}/clarify-a`] }),
  guide({ id: 'fr.je-tourne-a-droite', original: 'Je tourne à droite ?', translation: '¿Giro a la derecha?', purpose: 'Confirmar hacia dónde girar.', approximate: 'zhe tur na druát', ipa: '/ʒə tuʁ.n‿a dʁwat/',
    units: [{ text: 'Je tourne', meaning: 'Giro', approximate: 'zhe turn' }, { text: 'à droite ?', meaning: 'a la derecha', approximate: 'a druát' }],
    tips: ['fr-enchainement', 'fr-oi', 'fr-r', 'fr-question'], focus: ['La n de tourne se une a la a: tur na.', 'droite (derecha) termina en una t que sí suena; en droit (recto) no suena. Esa t cambia el significado.'],
    sources: [fr('droite')], usedIn: [`${meeting}/clarify-b`] }),
  guide({ id: 'fr.je-tourne-a-gauche', original: 'Je tourne à gauche ?', translation: '¿Giro a la izquierda?', purpose: 'Confirmar hacia dónde girar.', approximate: 'zhe tur na gosh', ipa: '/ʒə tuʁ.n‿a ɡoʃ/',
    units: [{ text: 'Je tourne', meaning: 'Giro', approximate: 'zhe turn' }, { text: 'à gauche ?', meaning: 'a la izquierda', approximate: 'a gosh' }],
    tips: ['fr-enchainement', 'fr-r', 'fr-question'], focus: ['La n de tourne se une a la a: tur na.', 'au se dice o; che final suena sh y la e no se pronuncia.'],
    sources: [fr('gauche')], usedIn: [`${meeting}/clarify-b`] }),
  guide({ id: 'fr.oui-ca-va-merci', original: 'Oui, ça va, merci !', translation: 'Sí, estoy bien, gracias.', purpose: 'Responder cuando te preguntan cómo estás.', approximate: 'ui, sa va, mersí', ipa: '/wi sa va mɛʁ.si/',
    units: [{ text: 'Oui,', meaning: 'Sí,', approximate: 'ui' }, { text: 'ça va,', meaning: 'estoy bien,', approximate: 'sa va' }, { text: 'merci !', meaning: 'gracias.', approximate: 'mersí' }],
    tips: ['fr-v', 'fr-r'], focus: ['ç suena s: ça → sa.'], sources: [fr('ça va'), fr('merci')], usedIn: [`${meeting}/meet-a`, `${meeting}/meet-b`] }),

  guide({ id: 'en.i-need-help', original: 'I need help.', translation: 'Necesito ayuda.', purpose: 'Pedir ayuda de forma directa.', approximate: 'ai níid jelp', ipa: '/aɪ niːd help/',
    units: [{ text: 'I need', meaning: 'Necesito', approximate: 'ai níid' }, { text: 'help.', meaning: 'ayuda.', approximate: 'jelp' }], tips: ['en-long-ee', 'en-h', 'en-final-consonant'],
    sources: [en('need'), en('help')], usedIn: [`${london}/help`] }),
  guide({ id: 'en.where-is-the-blue-door-hostel', original: 'Where is the Blue Door Hostel?', translation: '¿Dónde está el hostal Blue Door?', purpose: 'Preguntar por tu destino.', approximate: 'uér is de blu dóo(r) jóstel', ipa: '/weər ɪz ðə bluː dɔː ˈhɒs.təl/ (UK)',
    units: [{ text: 'Where is', meaning: 'Dónde está', approximate: 'uér is' }, { text: 'the Blue Door Hostel?', meaning: 'el hostal Blue Door', approximate: 'de blu dóo(r) jóstel' }],
    tips: ['en-th-voiced', 'en-final-z', 'en-h', 'en-r'], focus: ['La s de is suena como z con voz.'], caveat: britishCaveat,
    sources: [en('where'), en('door'), en('hostel')], usedIn: [`${london}/where`] }),
  guide({ id: 'en.where-is-the-lantern-theatre', original: 'Where is the Lantern Theatre?', translation: '¿Dónde está el teatro Lantern?', purpose: 'Preguntar por tu destino.', approximate: 'uér is de lánten thíeta', ipa: '/weər ɪz ðə ˈlæn.tən ˈθɪə.tə/ (UK)',
    units: [{ text: 'Where is', meaning: 'Dónde está', approximate: 'uér is' }, { text: 'the Lantern Theatre?', meaning: 'el teatro Lantern', approximate: 'de lánten thíeta' }],
    tips: ['en-th-voiced', 'en-th-voiceless', 'en-ae', 'en-weak-vowel'], focus: ['the empieza con th con voz; theatre, con th sin voz. Son dos sonidos distintos.'], caveat: britishCaveat,
    sources: [en('lantern'), en('theatre')], usedIn: [`${london}/where`] }),
  guide({ id: 'en.is-it-near', original: 'Is it near?', translation: '¿Está cerca?', purpose: 'Preguntar si falta poco.', approximate: 'i zit níe(r)', ipa: '/ɪz ɪt nɪə/ (UK)',
    units: [{ text: 'Is it', meaning: '¿Está', approximate: 'i zit' }, { text: 'near?', meaning: 'cerca?', approximate: 'níe(r)' }],
    tips: ['en-short-i', 'en-final-z', 'en-r', 'en-question'], focus: ['La z de is se une a it: i zit.'], caveat: britishCaveat,
    sources: [en('near')], usedIn: [`${london}/confirm-a`] }),
  guide({ id: 'en.is-it-near-the-bridge', original: 'Is it near the bridge?', translation: '¿Está cerca del puente?', purpose: 'Confirmar una referencia del camino.', approximate: 'i zit níe(r) de brich', ipa: '/ɪz ɪt nɪə ðə brɪdʒ/ (UK)',
    units: [{ text: 'Is it near', meaning: '¿Está cerca', approximate: 'i zit níe(r)' }, { text: 'the bridge?', meaning: 'del puente?', approximate: 'de brich' }],
    tips: ['en-short-i', 'en-th-voiced', 'en-dge', 'en-question'], focus: ['La z de is se une a it: i zit.'], caveat: britishCaveat,
    sources: [en('near'), en('bridge')], usedIn: [`${london}/confirm-a`] }),
  guide({ id: 'en.is-this-the-bus-to-the-hostel', original: 'Is this the bus to the hostel?', translation: '¿Este es el autobús al hostal?', purpose: 'Confirmar que subís al autobús correcto.', approximate: 'is dis de bas te de jóstel', ipa: '/ɪz ðɪs ðə bʌs tə ðə ˈhɒs.təl/ (UK)',
    units: [{ text: 'Is this the bus', meaning: '¿Este es el autobús', approximate: 'is dis de bas' }, { text: 'to the hostel?', meaning: 'al hostal?', approximate: 'te de jóstel' }],
    tips: ['en-th-voiced', 'en-short-i', 'en-weak-vowel', 'en-h'], focus: ['La u de bus es una a breve y relajada.'], caveat: britishCaveat,
    sources: [en('this'), en('bus'), en('hostel')], usedIn: [`${london}/confirm-b`] }),
  guide({ id: 'en.which-way-is-the-theatre', original: 'Which way is the theatre?', translation: '¿Por dónde se va al teatro?', purpose: 'Pedir la dirección.', approximate: 'uich uéi is de thíeta', ipa: '/wɪtʃ weɪ ɪz ðə ˈθɪə.tə/ (UK)',
    units: [{ text: 'Which way', meaning: 'Por dónde / qué camino', approximate: 'uich uéi' }, { text: 'is the theatre?', meaning: 'está el teatro', approximate: 'is de thíeta' }],
    tips: ['en-th-voiced', 'en-th-voiceless', 'en-short-i'], focus: ['the y theatre empiezan con dos th distintas: con voz y sin voz.'], caveat: britishCaveat,
    sources: [en('which'), en('way'), en('theatre')], usedIn: [`${london}/confirm-b`] }),
  guide({ id: 'en.thank-you', original: 'Thank you!', translation: '¡Gracias!', purpose: 'Agradecer.', approximate: 'thánkiu', ipa: '/ˈθæŋk juː/',
    units: [{ text: 'Thank you!', meaning: 'Expresión completa; se practica entera.', approximate: 'thánkiu' }], tips: ['en-th-voiceless', 'en-ae'],
    focus: ['Con t en lugar de th puede oírse «tank you»: se entiende, pero practicá la lengua entre los dientes.'],
    sources: [en('thank-you')], usedIn: [`${london}/thanks-a`, `${london}/thanks-b`] }),
  guide({ id: 'en.goodbye', original: 'Goodbye!', translation: '¡Adiós!', purpose: 'Despedirte.', approximate: 'gudbái', ipa: '/ɡʊdˈbaɪ/',
    units: [{ text: 'Goodbye!', meaning: 'Despedida completa; se practica entera.', approximate: 'gudbái' }], tips: ['en-final-consonant'],
    focus: ['La oo de good es una u breve. La d casi se une a bye; la fuerza va en bái.'], sources: [en('goodbye')], usedIn: [`${london}/bye-a`, `${london}/bye-b`] }),
];

export function pronunciationFor(original: string, language: PronunciationLanguage): PronunciationGuide | null {
  return pronunciationGuides.find(guide => guide.language === language && normalizeAnswer(guide.original) === normalizeAnswer(original)) ?? null;
}
/** True when `phrase` appears in `text` as whole words (after answer normalization). */
export function containsPhrase(text: string, phrase: string): boolean {
  const needle = normalizeAnswer(phrase);
  return needle.length > 0 && ` ${normalizeAnswer(text)} `.includes(` ${needle} `);
}
/** Reviewed guides for shorter expressions inside `text` (never the exact text itself). */
export function guidesWithin(text: string, language: PronunciationLanguage): PronunciationGuide[] {
  return pronunciationGuides.filter(guide => guide.language === language && normalizeAnswer(guide.original) !== normalizeAnswer(text) && containsPhrase(text, guide.original));
}
