var SncfTrainCard=(function(m){Object.defineProperty(m,Symbol.toStringTag,{value:"Module"});var n={device_id:"",title:"Trains SNCF",train_lines:3,train_emoji:"🚅",train_emoji_axial_symmetry:!0,departure_station_emoji:"",arrival_station_emoji:"🚉",show_departure_station:!0,show_arrival_station:!0,animation_duration:30,update_interval:3e4},p=class extends HTMLElement{_config=n;_hass;_updateInterval=null;_lastRender=0;_lastSignature="";_forceRender=!0;constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){if(!e?.device_id)throw new Error("You need to define device_id");this._config={...n,...e},this._forceRender=!0,this._restartTimer(),this.render()}set hass(e){this._hass=e,this._forceRender=!0,this.render()}connectedCallback(){this._restartTimer()}disconnectedCallback(){this._updateInterval&&clearInterval(this._updateInterval),this._updateInterval=null}getCardSize(){return Math.max(3,this._config.train_lines+1)}getConfigElement(){const e=document.createElement("sncf-train-card-editor");return e.setConfig(this._config),e.addEventListener("config-changed",t=>{const i=t.detail;this.setConfig(i.config)}),e}_restartTimer(){this._updateInterval&&clearInterval(this._updateInterval),this._updateInterval=setInterval(()=>this.render(),this._config.update_interval)}async _getTrainEntities(){if(!this._hass)return[];const e=this._hass.states??{},t=Object.values(e).filter(i=>i.entity_id.includes("train"));try{const i=await this._hass.callWS?.({type:"config/entity_registry/list"});if(!Array.isArray(i)||i.length===0)return t;const r=new Set(i.filter(a=>a.device_id===this._config.device_id).map(a=>a.entity_id));return Object.values(e).filter(a=>r.has(a.entity_id)&&a.attributes?.departure_time)}catch{return t}}_parseTime(e){if(!e)return new Date(0);if(e.includes("/")&&e.includes(" - ")){const[t,i]=e.split(" - "),[r,a,s]=t.split("/").map(l=>Number.parseInt(l,10)),[_,c]=i.split(":").map(l=>Number.parseInt(l,10));return new Date(s,a-1,r,_,c)}return new Date(e)}_formatTime(e){if(!e)return"N/A";const t=this._parseTime(e);return Number.isNaN(t.getTime())?"Format invalide":t.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}_trainPosition(e){if(!e)return-10;const t=this._parseTime(e);if(Number.isNaN(t.getTime()))return-10;const i=(t.getTime()-Date.now())/6e4;return this._config.animation_duration===0?i<=0?100:-10:i>this._config.animation_duration?-10:i<=0?100:(this._config.animation_duration-i)/this._config.animation_duration*100}_trainColor(e,t){return!t||e===0?"#4caf50":"#f44336"}_renderStyles(){return`
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
      </style>`}_renderDeparture(e){const t=!!e.has_delay,i=e.delay_minutes??0,r=this._formatTime(e.base_departure_time),a=this._formatTime(e.departure_time);return`
      <div class="station">
        <div class="station-info">
          <div class="arrival-time-container">
            ${t&&a!=="N/A"?`<div class="arrival-time original-time">${r}</div><div class="arrival-time real-time">${a}</div>`:`<div class="arrival-time">${r}</div>`}
          </div>
          <div class="delay-info ${t?"delay":"on-time"}">${t?`+${i}min`:"À l'heure"}</div>
        </div>
        <div class="station-emoji">${this._config.departure_station_emoji}</div>
      </div>`}_renderArrival(e){const t=!!e.has_delay,i=e.delay_minutes??0,r=this._formatTime(e.base_arrival_time),a=this._formatTime(e.arrival_time);return`
      <div class="station">
        <div class="station-emoji">${this._config.arrival_station_emoji}</div>
        <div class="station-info">
          <div class="arrival-time-container">
            ${t&&a!=="N/A"?`<div class="arrival-time original-time">${r}</div><div class="arrival-time real-time">${a}</div>`:`<div class="arrival-time">${r}</div>`}
          </div>
          <div class="delay-info ${t?"delay":"on-time"}">${t?`+${i}min`:"À l'heure"}</div>
        </div>
      </div>`}async _signature(e){return e.map(t=>`${t.entity_id}:${t.attributes.departure_time}:${t.attributes.delay_minutes??0}:${t.attributes.has_delay??!1}`).join("|")}async render(){if(!this.shadowRoot)return;const e=await this._getTrainEntities(),t=await this._signature(e);if(!this._forceRender&&t===this._lastSignature&&this.shadowRoot.innerHTML)return;if(this._lastSignature=t,this._forceRender=!1,e.length===0){this.shadowRoot.innerHTML=`${this._renderStyles()}<ha-card><div class="card-content"><div class="error">Aucun train trouvé pour ce device. Vérifiez la configuration.</div></div></ha-card>`;return}const i=e.slice(0,this._config.train_lines).map(r=>{const a=r.attributes,s=this._trainPosition(a.departure_time),_=a.delay_minutes??0,c=!!a.has_delay,l=this._trainColor(_,c),g=this._config.train_emoji_axial_symmetry?"train-emoji-axial-symmetry":"",y=s>=0&&s<=100?`<div class="train-emoji ${g}" style="left:${s}%;color:${l};">${this._config.train_emoji}</div>`:"";return`
        <div class="train-line ${this._config.show_departure_station?"left-departure-time":""}">
          ${this._config.show_departure_station?this._renderDeparture(a):""}
          <div class="train-track ${c?"delayed":""}">${y}</div>
          ${this._config.show_arrival_station?this._renderArrival(a):""}
        </div>`}).join("");this.shadowRoot.innerHTML=`${this._renderStyles()}<ha-card><div class="train-card"><div class="train-header"><div>${this._config.title}</div></div>${i}</div></ha-card>`}},u=class extends HTMLElement{_config=n;constructor(){super(),this.attachShadow({mode:"open"})}setConfig(e){this._config={...n,...e??{}},this.render()}set hass(e){}emitConfigChange(){const e=r=>this.shadowRoot?.getElementById(r),t=(r,a)=>{const s=Number.parseInt(e(r)?.value??"",10);return Number.isFinite(s)?s:a},i={device_id:e("device_id")?.value??"",title:e("title")?.value??n.title,train_lines:t("train_lines",n.train_lines),train_emoji:e("train_emoji")?.value??n.train_emoji,train_emoji_axial_symmetry:!!e("train_emoji_axial_symmetry")?.checked,departure_station_emoji:e("departure_station_emoji")?.value??"",arrival_station_emoji:e("arrival_station_emoji")?.value??n.arrival_station_emoji,show_departure_station:!!e("show_departure_station")?.checked,show_arrival_station:!!e("show_arrival_station")?.checked,animation_duration:t("animation_duration",n.animation_duration),update_interval:t("update_interval",n.update_interval)};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}render(){const e=this._config,t=(i,r,a,s="")=>`
      <label class="field">
        <span>${i.replaceAll("_"," ")}</span>
        <input id="${i}" type="${r}" value="${a}" ${s} />
      </label>`;this.shadowRoot.innerHTML=`
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
          ${t("device_id","text",e.device_id,'placeholder="Device ID"')}
          ${t("title","text",e.title)}
          ${t("train_lines","number",e.train_lines,'min="1" max="10" step="1"')}
          ${t("animation_duration","number",e.animation_duration,'min="0" max="100" step="1"')}
          ${t("update_interval","number",e.update_interval,'min="5000" step="1000"')}
        </div>

        <div class="row">
          <label class="field">
            <span>train emoji</span>
            <select id="train_emoji">
              ${["🚅","🚄","🚆","🚇","🚈","🚂","🛤️"].map(i=>`<option value="${i}" ${i===e.train_emoji?"selected":""}>${i}</option>`).join("")}
            </select>
          </label>

          <label class="field">
            <span>departure station emoji</span>
            <select id="departure_station_emoji">
              ${["","🚉","🏢","🏛️","📍","🎯","➡️"].map(i=>`<option value="${i}" ${i===e.departure_station_emoji?"selected":""}>${i||"Aucun"}</option>`).join("")}
            </select>
          </label>

          <label class="field">
            <span>arrival station emoji</span>
            <select id="arrival_station_emoji">
              ${["🚉","🏢","🏛️","🏪","🎫","📍","🎯"].map(i=>`<option value="${i}" ${i===e.arrival_station_emoji?"selected":""}>${i}</option>`).join("")}
            </select>
          </label>
        </div>

        <div class="toggle"><input id="train_emoji_axial_symmetry" type="checkbox" ${e.train_emoji_axial_symmetry?"checked":""} /><label for="train_emoji_axial_symmetry">train emoji axial symmetry</label></div>
        <div class="toggle"><input id="show_departure_station" type="checkbox" ${e.show_departure_station?"checked":""} /><label for="show_departure_station">show departure station</label></div>
        <div class="toggle"><input id="show_arrival_station" type="checkbox" ${e.show_arrival_station?"checked":""} /><label for="show_arrival_station">show arrival station</label></div>
        <div class="hint">Le bouton de départ/arrivée peut être masqué sans perdre la configuration.</div>
      </div>
    `,this.shadowRoot.querySelectorAll("input, select").forEach(i=>{i.addEventListener("change",()=>this.emitConfigChange())})}},o="sncf-train-card",h="sncf-train-card-editor";function f(){const e=globalThis.customCards??=[];e.some(t=>t.type===o)||e.push({type:o,name:"SNCF Train Card",description:"Carte personnalisée animée pour afficher les trains SNCF en temps réel",preview:!0,configurable:!0})}function d(e,t){customElements.get(e)||customElements.define(e,t)}function v(){f(),d(o,p),d(h,u)}return globalThis.customCards||=[],globalThis.customCards?.push({type:o,name:"SNCF Train Card",description:"Carte personnalisée animée pour afficher les trains SNCF en temps réel",preview:!0,configurable:!0,documentationURL:"https://github.com/Master13011/SNCF-API-HA/README.md"}),d(o,p),d(h,u),m.registerSncfTrainCard=v,m})({});

//# sourceMappingURL=sncf-train-card.js.map