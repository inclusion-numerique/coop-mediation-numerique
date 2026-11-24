export const motsDe = (texte: string): readonly string[] =>
  texte.split(' ').filter((mot) => mot !== '')
