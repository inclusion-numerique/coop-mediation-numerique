export const tranchesAge = [
  'SoixanteDixPlus',
  'SoixanteSoixanteNeuf',
  'QuaranteCinquanteNeuf',
  'VingtCinqTrenteNeuf',
  'DixHuitVingtQuatre',
  'DouzeDixHuit',
  'MoinsDeDouze',
  'NonCommunique',
] as const

export type TrancheAge = (typeof tranchesAge)[number]

export const trancheAgeLabels: Record<TrancheAge, string> = {
  SoixanteDixPlus: '70 ans et plus',
  SoixanteSoixanteNeuf: '60 - 69 ans',
  QuaranteCinquanteNeuf: '40 - 59 ans',
  VingtCinqTrenteNeuf: '25 - 39 ans',
  DixHuitVingtQuatre: '18 - 24 ans',
  DouzeDixHuit: '12 - 17 ans',
  MoinsDeDouze: 'Moins de 12 ans',
  NonCommunique: 'Non communiqué',
}

const anneeNaissanceMin = 1900

export const trancheAgeFromAnneeNaissance = (
  anneeNaissance?: string | number | null,
): TrancheAge | null => {
  if (!anneeNaissance) return null

  const anneeInt =
    typeof anneeNaissance === 'string'
      ? Number.parseInt(anneeNaissance, 10)
      : anneeNaissance

  const anneeNaissanceMax = new Date().getFullYear()

  if (anneeInt < anneeNaissanceMin || anneeInt > anneeNaissanceMax) return null

  const age = new Date().getFullYear() - anneeInt

  if (age < 12) return 'MoinsDeDouze'
  if (age < 18) return 'DouzeDixHuit'
  if (age < 25) return 'DixHuitVingtQuatre'
  if (age < 40) return 'VingtCinqTrenteNeuf'
  if (age < 60) return 'QuaranteCinquanteNeuf'
  if (age < 70) return 'SoixanteSoixanteNeuf'

  return 'SoixanteDixPlus'
}
