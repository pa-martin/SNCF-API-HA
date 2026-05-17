import { SncfTrainCard } from './sncf-train-card';
import { SncfTrainCardEditor } from './sncf-train-card-editor';
import type { CardMetadata } from './types';

const CARD_TYPE = 'sncf-train-card';
const EDITOR_TYPE = 'sncf-train-card-editor';

type GlobalThis = typeof globalThis & { customCards?: CardMetadata[] };

function registerCardMetadata() {
  const cards = (globalThis as GlobalThis).customCards ??= [];
  if (!cards.some((card) => card.type === CARD_TYPE)) {
    cards.push({
      type: CARD_TYPE,
      name: 'SNCF Train Card',
      description: 'Carte personnalisée animée pour afficher les trains SNCF en temps réel',
      preview: true,
      configurable: true
    });
  }
}

function defineElement(name: string, ctor: CustomElementConstructor) {
  if (!customElements.get(name)) {
    customElements.define(name, ctor);
  }
}

export function registerSncfTrainCard() {
  registerCardMetadata();
  defineElement(CARD_TYPE, SncfTrainCard);
  defineElement(EDITOR_TYPE, SncfTrainCardEditor);
}

// registerSncfTrainCard();

(globalThis as GlobalThis).customCards ||= [];
(globalThis as GlobalThis).customCards?.push({
  type: CARD_TYPE,
  name: 'SNCF Train Card',
  description: 'Carte personnalisée animée pour afficher les trains SNCF en temps réel',
  preview: true,
  configurable: true,
  documentationURL: 'https://github.com/Master13011/SNCF-API-HA/README.md',
});

defineElement(CARD_TYPE, SncfTrainCard);
defineElement(EDITOR_TYPE, SncfTrainCardEditor);
