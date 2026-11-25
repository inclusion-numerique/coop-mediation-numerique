export const colonnesTriables = [
  'creation',
  'derniereConnexion',
  'derniereVisite',
  'nom',
  'courriel',
  'accompagnements',
  'lieuxActivite',
  'beneficiaires',
] as const

export type ColonneTriable = (typeof colonnesTriables)[number]
