# Frontend card scaffold

Squelette frontend pour `sncf-train-card`.

## Commandes

```bash
npm install
npm run build
npm run smoke
```

## Hook pre-commit

Après `npm install`, Husky active automatiquement le hook `pre-commit`.
Il exécute `npm run precommit`, qui enchaîne :

- `npm run lint`
- `npm run build`

## Ce que ça fait

- compile `frontend/card/src/index.ts`
- génère `frontend/card/dist/sncf-train-card.js`
- copie le bundle vers `custom_components/sncf_trains/frontend/sncf-train-card.js`
- vérifie que les custom elements sont bien enregistrés

## Arborescence

- `src/` : source TypeScript
- `scripts/` : copie vers `frontend/` et smoke test
- `dist/` : artefacts de build

