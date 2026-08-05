// `preview.tsx` charge la feuille de styles globale de l'application en import d'effet de
// bord. TypeScript 7 exige une déclaration pour ce type d'import (TS2882) : une feuille CSS
// n'est pas un module TypeScript, c'est un asset que le bundler traite pour son seul effet.
//
// Next couvre ce cas côté `apps/web` via son `next-env.d.ts` généré — mais seulement pour les
// modules CSS (`*.module.css`). Storybook, qui compile avec sa propre configuration, n'hérite
// de rien.
declare module '*.css'
