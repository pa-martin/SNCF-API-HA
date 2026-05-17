# Frontend card scaffold

Squelette frontend pour `sncf-train-card`.

## Commandes

```bash
npm install
npm run build
npm run smoke
```

## Ce que ça fait

- compile `frontend/card/src/index.ts`
- génère `frontend/card/dist/sncf-train-card.js`
- copie le bundle vers `custom_components/sncf_trains/www/sncf-train-card.js`
- vérifie que les custom elements sont bien enregistrés

## Arborescence

- `src/` : source TypeScript
- `scripts/` : copie vers `www/` et smoke test
- `dist/` : artefacts de build

