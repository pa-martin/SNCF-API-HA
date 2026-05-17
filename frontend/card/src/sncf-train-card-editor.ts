import {DEFAULT_CONFIG, SncfTrainCardConfig} from './types';

export class SncfTrainCardEditor extends HTMLElement {
    private _config: SncfTrainCardConfig = DEFAULT_CONFIG;

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    setConfig(config: Partial<SncfTrainCardConfig> | undefined) {
        this._config = {...DEFAULT_CONFIG, ...config};
        this.render();
    }

    set hass(_hass: unknown) {
        // Pas utilisé, mais gardé pour compatibilité Home Assistant.
    }

    private emitConfigChange() {
        const get = (id: string) => this.shadowRoot?.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
        const number = (id: string, fallback: number) => {
            const parsed = Number.parseInt(get(id)?.value ?? '', 10);
            return Number.isFinite(parsed) ? parsed : fallback;
        };
        const nextConfig: SncfTrainCardConfig = {
            device_id: get('device_id')?.value ?? '',
            title: get('title')?.value ?? DEFAULT_CONFIG.title,
            train_lines: number('train_lines', DEFAULT_CONFIG.train_lines),
            train_emoji: get('train_emoji')?.value ?? DEFAULT_CONFIG.train_emoji,
            train_emoji_axial_symmetry: Boolean(get('train_emoji_axial_symmetry')?.value),
            departure_station_emoji: get('departure_station_emoji')?.value ?? '',
            arrival_station_emoji: get('arrival_station_emoji')?.value ?? DEFAULT_CONFIG.arrival_station_emoji,
            show_departure_station: Boolean(get('show_departure_station')?.value),
            show_arrival_station: Boolean(get('show_arrival_station')?.value),
            animation_duration: number('animation_duration', DEFAULT_CONFIG.animation_duration),
            update_interval: number('update_interval', DEFAULT_CONFIG.update_interval)
        };

        this.dispatchEvent(new CustomEvent('config-changed', {
            detail: {config: nextConfig},
            bubbles: true,
            composed: true
        }));
    }

    private render() {
        const cfg = this._config;
        const input = (id: string, type: string, value: string | number, attrs = '') => `
      <label class="field">
        <span>${id.replaceAll('_', ' ')}</span>
        <input id="${id}" type="${type}" value="${value}" ${attrs} />
      </label>`;

        this.shadowRoot!.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: grid; gap: 12px; padding: 16px; }
        .field { display: grid; gap: 6px; }
        .field span { font-weight: 600; }
        input, select { padding: 10px 12px; border: 1px solid var(--divider-color, #cfcfcf); border-radius: 8px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #111); }
        .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .toggle { display: flex; align-items: center; gap: 10px; padding: 8px 0; }
        .hint { font-size: 12px; color: var(--secondary-text-color, #666); }
      </style>
      <div class="wrap">
        <div class="row">
          ${input('device_id', 'text', cfg.device_id, 'placeholder="Device ID"')}
          ${input('title', 'text', cfg.title)}
          ${input('train_lines', 'number', cfg.train_lines, 'min="1" max="10" step="1"')}
          ${input('animation_duration', 'number', cfg.animation_duration, 'min="0" max="100" step="1"')}
          ${input('update_interval', 'number', cfg.update_interval, 'min="5000" step="1000"')}
        </div>

        <div class="row">
          <label class="field">
            <span>train emoji</span>
            <select id="train_emoji">
              ${['🚅', '🚄', '🚆', '🚇', '🚈', '🚂', '🛤️'].map((emoji) => `<option value="${emoji}" ${emoji === cfg.train_emoji ? 'selected' : ''}>${emoji}</option>`).join('')}
            </select>
          </label>

          <label class="field">
            <span>departure station emoji</span>
            <select id="departure_station_emoji">
              ${['', '🚉', '🏢', '🏛️', '📍', '🎯', '➡️'].map((emoji) => `<option value="${emoji}" ${emoji === cfg.departure_station_emoji ? 'selected' : ''}>${emoji || 'Aucun'}</option>`).join('')}
            </select>
          </label>

          <label class="field">
            <span>arrival station emoji</span>
            <select id="arrival_station_emoji">
              ${['🚉', '🏢', '🏛️', '🏪', '🎫', '📍', '🎯'].map((emoji) => `<option value="${emoji}" ${emoji === cfg.arrival_station_emoji ? 'selected' : ''}>${emoji}</option>`).join('')}
            </select>
          </label>
        </div>

        <div class="toggle"><input id="train_emoji_axial_symmetry" type="checkbox" ${cfg.train_emoji_axial_symmetry ? 'checked' : ''} /><label for="train_emoji_axial_symmetry">train emoji axial symmetry</label></div>
        <div class="toggle"><input id="show_departure_station" type="checkbox" ${cfg.show_departure_station ? 'checked' : ''} /><label for="show_departure_station">show departure station</label></div>
        <div class="toggle"><input id="show_arrival_station" type="checkbox" ${cfg.show_arrival_station ? 'checked' : ''} /><label for="show_arrival_station">show arrival station</label></div>
        <div class="hint">Le bouton de départ/arrivée peut être masqué sans perdre la configuration.</div>
      </div>
    `;

        this.shadowRoot!.querySelectorAll('input, select').forEach((el) => {
            el.addEventListener('change', () => this.emitConfigChange());
        });
    }
}

