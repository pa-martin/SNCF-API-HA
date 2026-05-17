import {readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parseHTML} from 'linkedom';
import {SncfTrainCard} from "../src/sncf-train-card.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..', '..');
const bundle = resolve(root, 'frontend/card/dist/sncf-train-card.js');

await readFile(bundle, 'utf8');

const {window} = parseHTML('<!doctype html><html lang="fr"><body></body></html>');
Object.assign(globalThis, {
  window,
  document: window.document,
  customElements: window.customElements,
  HTMLElement: window.HTMLElement,
  CustomEvent: window.CustomEvent,
  Event: window.Event,
  Node: window.Node,
  ShadowRoot: window.ShadowRoot
});

await import(pathToFileURL(bundle).href);

if (!customElements.get('sncf-train-card')) throw new Error('sncf-train-card not registered');
if (!customElements.get('sncf-train-card-editor')) throw new Error('sncf-train-card-editor not registered');

/** @type {SncfTrainCard} */
const card = document.createElement('sncf-train-card');
card.setConfig({device_id: 'demo-device'});
card.hass = {
  states: {},
  callWS: async () => []
};

document.body.append(card);
await new Promise((resolve) => setTimeout(resolve, 0));

if (!card.shadowRoot || card.shadowRoot.innerHTML.length === 0) {
  throw new Error('card did not render');
}

card.disconnectedCallback?.();
card.remove();

console.log('Smoke test passed');

