export const statutsSociaux = [
  'Scolarise',
  'SansEmploi',
  'EnEmploi',
  'Retraite',
  'NonCommunique',
] as const

export type StatutSocial = (typeof statutsSociaux)[number]

export const statutSocialLabels: Record<StatutSocial, string> = {
  Retraite: 'Retraité',
  SansEmploi: 'Sans emploi',
  EnEmploi: 'En emploi',
  Scolarise: 'Scolarisé',
  NonCommunique: 'Non communiqué ou hétérogène',
}
