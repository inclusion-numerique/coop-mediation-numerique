// Les polices sont importées pour obtenir l'URL que le bundler leur donne, avec son hash de
// contenu, plutôt que de coder en dur un chemin de `public/` que la feuille du DSFR
// n'utilise plus depuis qu'elle est empaquetée. TypeScript ne connaît pas ces modules :
// `next-env.d.ts` ne déclare que les images.
declare module '*.woff2' {
  const url: string
  export default url
}
