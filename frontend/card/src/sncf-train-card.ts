import {DEFAULT_CONFIG, HassLike, SncfTrainCardConfig, Train, TrainAttributes} from './types';
import {SncfTrainCardEditor} from './sncf-train-card-editor';

export class SncfTrainCard extends HTMLElement {
    private _config: SncfTrainCardConfig = DEFAULT_CONFIG;
    private _hass?: HassLike;
    private _updateInterval: ReturnType<typeof setInterval> | null = null;
    private _lastSignature = '';
    private _forceRender = true;

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }

    setConfig(config: Partial<SncfTrainCardConfig> | undefined) {
        if (!config?.device_id) throw new Error('You need to define device_id');
        this._config = {...DEFAULT_CONFIG, ...config};
        this._forceRender = true;
        this._restartTimer();
        this.render();
    }

    set hass(hass: HassLike | undefined) {
        this._hass = hass;
        this._forceRender = true;
        this.render();
    }

    connectedCallback() {
        this._restartTimer();
    }

    disconnectedCallback() {
        if (this._updateInterval) clearInterval(this._updateInterval);
        this._updateInterval = null;
    }

    getCardSize() {
        return Math.max(3, this._config.train_lines + 1);
    }

    getConfigElement() {
        const editor = document.createElement('sncf-train-card-editor') as SncfTrainCardEditor;
        editor.setConfig(this._config);
        editor.addEventListener('config-changed', (ev: Event) => {
            const detail = (ev as CustomEvent<{ config: Partial<SncfTrainCardConfig> }>).detail;
            this.setConfig(detail.config);
        });
        return editor;
    }

    private _restartTimer() {
        if (this._updateInterval) clearInterval(this._updateInterval);
        this._updateInterval = setInterval(() => this.render(), this._config.update_interval);
    }

    private async _getTrainEntities(): Promise<Array<Train>> {
        if (!this._hass) return [];

        const states = this._hass.states ?? {};
        const fallback: Array<Train> = Object.values(states).filter((s) => s.entity_id.includes('train'));

        try {
            const registry = await this._hass.callWS?.({type: 'config/entity_registry/list'});
            if (!Array.isArray(registry) || registry.length === 0) return fallback;
            const ids = new Set(
                registry.filter((entry) => entry.device_id === this._config.device_id).map((entry) => entry.entity_id)
            );
            return Object.values(states).filter((state) => ids.has(state.entity_id) && state.attributes?.departure_time) as Array<Train>;
        } catch {
            return fallback;
        }
    }

    private _parseTime(value?: string) {
        if (!value) return new Date(0);
        if (value.includes('/') && value.includes(' - ')) {
            const [datePart, timePart] = value.split(' - ');
            const [day, month, year] = datePart.split('/').map((part) => Number.parseInt(part, 10));
            const [hour, minute] = timePart.split(':').map((part) => Number.parseInt(part, 10));
            return new Date(year, month - 1, day, hour, minute);
        }
        return new Date(value);
    }

    private _formatTime(value?: string) {
        if (!value) return 'N/A';
        const date = this._parseTime(value);
        return Number.isNaN(date.getTime()) ? 'Format invalide' : date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private _trainPosition(departureTime?: string) {
        if (!departureTime) return -10;
        const departure = this._parseTime(departureTime);
        if (Number.isNaN(departure.getTime())) return -10;
        const diffMinutes = (departure.getTime() - Date.now()) / 60000;
        if (this._config.animation_duration === 0) return diffMinutes <= 0 ? 100 : -10;
        if (diffMinutes > this._config.animation_duration) return -10;
        if (diffMinutes <= 0) return 100;
        return ((this._config.animation_duration - diffMinutes) / this._config.animation_duration) * 100;
    }

    private _trainColor(delayMinutes: number, hasDelay: boolean) {
        return !hasDelay || delayMinutes === 0 ? '#4caf50' : '#f44336';
    }

    private _renderStyles() {
        return `
      <style>
        :host { --sncf-track-height: 8px; --sncf-track-gap: 16px; display: block; }
        ha-card { padding: 16px; background: var(--card-background-color, #fff); color: var(--primary-text-color, #000); border-radius: var(--ha-card-border-radius, 12px); box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0,0,0,0.1)); overflow: hidden; }
        .train-card { display: flex; flex-direction: column; gap: 20px; }
        .train-header { display: flex; align-items: center; gap: 12px; font-size: 1.4em; font-weight: 600; color: var(--primary-color, #00539c); border-bottom: 2px solid var(--divider-color, #e0e0e0); padding-bottom: 10px; }
        .train-line { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; min-height: 60px; }
        .train-line.left-departure-time { display: grid; grid-template-columns: 82px 1fr 160px; align-items: center; }
        .departure-time-left { font-size: 1.35em; font-weight: 700; color: var(--primary-color, #00539c); }
        .train-track { position: relative; flex: 1; height: var(--sncf-track-height); background: linear-gradient(90deg, #ddd 0%, #bbb 50%, #ddd 100%); border-radius: 4px; margin: 0 var(--sncf-track-gap); overflow: visible; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        .train-track.delayed { background: linear-gradient(90deg, #ffcdd2 0%, #e57373 50%, #ffcdd2 100%); box-shadow: inset 0 2px 4px rgba(244,67,54,0.3); }
        .train-emoji { position: absolute; top: -37px; transform: translateX(-50%); font-size: 2em; transition: left 0.5s ease-in-out; z-index: 10; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
        .train-emoji-axial-symmetry { transform: translateX(-50%) scaleX(-1); }
        .station { display: flex; align-items: center; gap: 8px; }
        .station-emoji { font-size: 1.8em; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
        .station-info { display: flex; flex-direction: column; gap: 2px; }
        .station-label { font-size: 0.9em; color: var(--secondary-text-color, #666); font-weight: 500; }
        .arrival-time { font-size: 1.05em; font-weight: 600; color: var(--primary-color, #00539c); }
        .arrival-time-container { display: flex; flex-direction: column; gap: 2px; }
        .original-time { text-decoration: line-through; color: var(--secondary-text-color, #666); font-size: 0.9em; }
        .real-time { color: var(--error-color, #f44336); font-weight: 700; }
        .delay-info { font-size: 0.78em; font-weight: 600; margin-top: 2px; }
        .on-time { color: var(--success-color, #4caf50); }
        .delay { color: var(--error-color, #f44336); }
        .error { color: var(--error-color, #f44336); text-align: center; padding: 20px; font-weight: 500; }
      </style>`;
    }

    private _renderDeparture(attrs: TrainAttributes) {
        const hasDelay = Boolean(attrs.has_delay);
        const delayMinutes = attrs.delay_minutes ?? 0;
        const planned = this._formatTime(attrs.base_departure_time);
        const real = this._formatTime(attrs.departure_time);
        return `
      <div class="station">
        <div class="station-info">
          <div class="arrival-time-container">
            ${hasDelay && real !== 'N/A' ? `<div class="arrival-time original-time">${planned}</div><div class="arrival-time real-time">${real}</div>` : `<div class="arrival-time">${planned}</div>`}
          </div>
          <div class="delay-info ${hasDelay ? 'delay' : 'on-time'}">${hasDelay ? `+${delayMinutes}min` : 'À l\'heure'}</div>
        </div>
        <div class="station-emoji">${this._config.departure_station_emoji}</div>
      </div>`;
    }

    private _renderArrival(attrs: TrainAttributes) {
        const hasDelay = Boolean(attrs.has_delay);
        const delayMinutes = attrs.delay_minutes ?? 0;
        const planned = this._formatTime(attrs.base_arrival_time);
        const real = this._formatTime(attrs.arrival_time);
        return `
      <div class="station">
        <div class="station-emoji">${this._config.arrival_station_emoji}</div>
        <div class="station-info">
          <div class="arrival-time-container">
            ${hasDelay && real !== 'N/A' ? `<div class="arrival-time original-time">${planned}</div><div class="arrival-time real-time">${real}</div>` : `<div class="arrival-time">${planned}</div>`}
          </div>
          <div class="delay-info ${hasDelay ? 'delay' : 'on-time'}">${hasDelay ? `+${delayMinutes}min` : 'À l\'heure'}</div>
        </div>
      </div>`;
    }

    private async _signature(trains: Array<Train>) {
        return trains.map((train) => `${train.entity_id}:${train.attributes?.departure_time}:${train.attributes?.delay_minutes ?? 0}:${train.attributes?.has_delay ?? false}`).join('|');
    }

    async render() {
        if (!this.shadowRoot) return;

        const trains = await this._getTrainEntities();
        const signature = await this._signature(trains);
        if (!this._forceRender && signature === this._lastSignature && this.shadowRoot.innerHTML) return;
        this._lastSignature = signature;
        this._forceRender = false;

        if (trains.length === 0) {
            this.shadowRoot.innerHTML = `${this._renderStyles()}<ha-card><div class="card-content"><div class="error">Aucun train trouvé pour ce device. Vérifiez la configuration.</div></div></ha-card>`;
            return;
        }

        const items = trains.slice(0, this._config.train_lines).map((train) => {
            const attrs = train.attributes ?? {};
            const position = this._trainPosition(attrs.departure_time);
            const delayMinutes = attrs.delay_minutes ?? 0;
            const hasDelay = Boolean(attrs.has_delay);
            const trainColor = this._trainColor(delayMinutes, hasDelay);
            const emojiClass = this._config.train_emoji_axial_symmetry ? 'train-emoji-axial-symmetry' : '';
            const trainPositionHTML = position >= 0 && position <= 100 ? `<div class="train-emoji ${emojiClass}" style="left:${position}%;color:${trainColor};">${this._config.train_emoji}</div>` : '';

            return `
        <div class="train-line ${this._config.show_departure_station ? 'left-departure-time' : ''}">
          ${this._config.show_departure_station ? this._renderDeparture(attrs) : ''}
          <div class="train-track ${hasDelay ? 'delayed' : ''}">${trainPositionHTML}</div>
          ${this._config.show_arrival_station ? this._renderArrival(attrs) : ''}
        </div>`;
        }).join('');

        this.shadowRoot.innerHTML = `${this._renderStyles()}<ha-card><div class="train-card"><div class="train-header"><div>${this._config.title}</div></div>${items}</div></ha-card>`;
    }
}

