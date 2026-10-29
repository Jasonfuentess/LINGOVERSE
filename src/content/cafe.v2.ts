import { cafeLesson as legacy } from './cafe.v1';
import type { ChoiceExercise, Exercise, Lesson } from '../domain/learning/models';

interface Profile {
  id: string;
  order: string;
  orderEs: string;
  orderForm: 'voudrais' | 'prends' | 'short';
  place: string;
  placeEs: string;
  confirmPlace: boolean;
  sugar: string;
  sugarEs: string;
  sugarForm: 'yes-no' | 'with-without';
  price: 1 | 2 | 3;
  priceFr: string;
  priceEs: string;
}
const profiles: Profile[] = [
  { id: 'matin-lucie', order: 'Qu’est-ce que vous prenez ?', orderEs: '¿Qué va a tomar?', orderForm: 'voudrais', place: 'C’est pour ici ou à emporter ?', placeEs: '¿Es para aquí o para llevar?', confirmPlace: false, sugar: 'Avec du sucre ?', sugarEs: '¿Con azúcar?', sugarForm: 'yes-no', price: 3, priceFr: 'Ça fait trois euros.', priceEs: 'Son tres euros.' },
  { id: 'midi-samir', order: 'Qu’est-ce que je vous sers ?', orderEs: '¿Qué le sirvo?', orderForm: 'short', place: 'Vous prenez votre boisson sur place ?', placeEs: '¿Va a tomar su bebida aquí?', confirmPlace: true, sugar: 'Du sucre avec votre boisson ?', sugarEs: '¿Azúcar con su bebida?', sugarForm: 'yes-no', price: 2, priceFr: 'Deux euros, s’il vous plaît.', priceEs: 'Dos euros, por favor.' },
  { id: 'pluie-camille', order: 'Vous voulez un café ou un thé ?', orderEs: '¿Quiere un café o un té?', orderForm: 'short', place: 'Vous restez au café ?', placeEs: '¿Se queda en el café?', confirmPlace: true, sugar: 'Vous prenez du sucre ?', sugarEs: '¿Toma azúcar?', sugarForm: 'yes-no', price: 2, priceFr: 'Votre boisson coûte deux euros.', priceEs: 'Su bebida cuesta dos euros.' },
  { id: 'carnet-alex', order: 'Un café ? Un thé ?', orderEs: '¿Un café? ¿Un té?', orderForm: 'prends', place: 'À emporter ou sur place ?', placeEs: '¿Para llevar o para tomar aquí?', confirmPlace: false, sugar: 'Avec ou sans sucre ?', sugarEs: '¿Con azúcar o sin azúcar?', sugarForm: 'with-without', price: 1, priceFr: 'C’est un euro.', priceEs: 'Es un euro.' },
  { id: 'balade-noemie', order: 'Vous voulez boire un café ou un thé ?', orderEs: '¿Quiere beber un café o un té?', orderForm: 'short', place: 'Ici ou à emporter ?', placeEs: '¿Aquí o para llevar?', confirmPlace: false, sugar: 'Du sucre ?', sugarEs: '¿Azúcar?', sugarForm: 'yes-no', price: 3, priceFr: 'C’est trois euros.', priceEs: 'Son tres euros.' },
  { id: 'lecture-hugo', order: 'Je vous prépare un café ou un thé ?', orderEs: '¿Le preparo un café o un té?', orderForm: 'prends', place: 'Vous voulez une table ?', placeEs: '¿Quiere una mesa?', confirmPlace: true, sugar: 'Un peu de sucre ?', sugarEs: '¿Un poco de azúcar?', sugarForm: 'yes-no', price: 3, priceFr: 'Trois euros, s’il vous plaît.', priceEs: 'Tres euros, por favor.' },
];
const numbers = { 1: ['un', 'uno'], 2: ['deux', 'dos'], 3: ['trois', 'tres'] } as const;
function question(exercise: Exercise, prompt: string, translation: string): Exercise {
  return { ...exercise, prompt, promptTranslation: translation };
}
function changeExercise(original: Exercise, profile: Profile): Exercise {
  let exercise = original;
  if (original.id === 'commande' && original.kind === 'choice') {
    const form = profile.orderForm === 'voudrais' ? 'Je voudrais' : 'Je prends';
    const prefix = profile.orderForm === 'short' ? '' : `${form} `;
    const cafe = `${prefix}${prefix ? 'un' : 'Un'} café, s’il vous plaît.`;
    const the = `${prefix}${prefix ? 'un' : 'Un'} thé, s’il vous plaît.`;
    exercise = question({ ...original,
      teaching: `Un café = un café; un thé = un té. ${profile.orderForm === 'prends' ? 'Je prends = voy a tomar / tomaré.' : profile.orderForm === 'voudrais' ? 'Je voudrais = quisiera.' : 'Podés responder nombrando la bebida.'} S’il vous plaît = por favor. Podés pedir: ${cafe} / ${the}`,
      correction: `${cafe} / ${the}`,
      explanation: 'Nombraste una bebida y usaste una expresión cortés apropiada al pedido.',
      choices: original.choices.map(option => ({ ...option, label: option.id === 'cafe' ? cafe : option.id === 'the' ? the : option.label })),
    }, profile.order, profile.orderEs);
  } else if (original.id.startsWith('lieu-') && original.kind === 'choice') {
    const here = `${profile.confirmPlace ? 'Oui, sur' : 'Sur'} place, s’il vous plaît.`;
    const away = `${profile.confirmPlace ? 'Non, à' : 'À'} emporter, s’il vous plaît.`;
    exercise = question({ ...original, teaching: `Sur place / ici = aquí, en el local. À emporter = para llevar. Une table = una mesa; rester = quedarse. Oui = sí; non = no. Elegí explícitamente el lugar: ${here} / ${away}`,
      correction: `${here} / ${away}`,
      choices: original.choices.map(option => ({ ...option, label: option.id === 'sur-place' ? here : option.id === 'emporter' ? away : option.label })),
    }, profile.place, profile.placeEs);
  } else if (original.id.startsWith('sucre-') && original.kind === 'choice') {
    const yes = profile.sugarForm === 'with-without' ? 'Avec du sucre, s’il vous plaît.' : 'Oui, s’il vous plaît.';
    const no = profile.sugarForm === 'with-without' ? 'Sans sucre, merci.' : 'Non, merci.';
    exercise = question({ ...original, teaching: `Du sucre = azúcar. Avec = con; sans = sin; un peu de sucre = un poco de azúcar. Oui = sí; non = no. Para aceptar: ${yes} Para rechazar: ${no}`,
      explanation: 'Aceptaste o rechazaste el azúcar de forma clara y cortés.', correction: `${yes} / ${no}`,
      choices: original.choices.map(option => ({ ...option, label: option.id === 'oui-sucre' ? yes : option.id === 'non-sucre' ? no : option.label })),
    }, profile.sugar, profile.sugarEs);
  } else if (original.id === 'prix' && original.kind === 'text') {
    exercise = { ...original, reply: `${profile.priceFr} → ${profile.priceEs}` };
  } else if (original.id === 'paiement' && original.kind === 'choice') {
    const number = numbers[profile.price];
    const label = `${number[0][0]!.toUpperCase()}${number[0].slice(1)} euro${profile.price === 1 ? '' : 's'}.`;
    const choices: ChoiceExercise['choices'] = original.choices.map(option => {
      const correct = option.id === number[0];
      const meaning = Object.values(numbers).find(item => item[0] === option.id)![1];
      return { ...option, correct, next: correct ? 'merci' : null, reply: correct ? 'Merci. → Gracias.' : '', explanation: correct ? `Identificaste el importe de ${profile.price} euro${profile.price === 1 ? '' : 's'}.` : `${option.label} indica ${meaning}. El importe de esta conversación es ${profile.price}.` };
    });
    exercise = question({ ...original, choices, correction: label,
      teaching: `Un = uno. Deux = dos. Trois = tres. Un euro, deux euros, trois euros. En esta conversación, «${profile.priceFr}» indica un total de ${profile.price} euro${profile.price === 1 ? '' : 's'}.`,
      explanation: 'Comprendiste el importe escrito de esta conversación.' }, profile.priceFr, profile.priceEs);
  }
  // Every full prompt is explicitly supported before an answer is requested.
  return { ...exercise, teaching: `Comprender «${exercise.prompt}»: ${exercise.promptTranslation}\n${exercise.teaching}` };
}
export const cafeLessonV2: Lesson = {
  ...legacy, version: 2,
  variants: legacy.variants.map(variant => ({ ...variant, exercises: variant.exercises.map(exercise => changeExercise(exercise, profiles.find(profile => profile.id === variant.id)!)) })),
};
