import { type Anomalie, anomalie } from './anomalie'
import { type LieuAReprendre, nonVide } from './lieu-a-reprendre'

const COMMUNES_A_ARRONDISSEMENTS: Readonly<Record<string, string>> = {
  '75056': '751',
  '69123': '6938',
  '13055': '132',
}

const communeDuBanId = (banId: string): string =>
  (banId.split('_')[0] ?? '').toUpperCase()

const designeLaMemeCommune = (lieu: LieuAReprendre, banId: string): boolean => {
  const insee = (nonVide(lieu.codeInsee) ?? '').toUpperCase()
  const arrondissements = COMMUNES_A_ARRONDISSEMENTS[insee]

  return (
    insee === communeDuBanId(banId) ||
    (arrondissements != null &&
      communeDuBanId(banId).startsWith(arrondissements))
  )
}

const adresseLisible = (lieu: LieuAReprendre): string =>
  `${lieu.adresse}, ${lieu.codePostal} ${lieu.commune}`

export const adresseHorsBan = (lieu: LieuAReprendre): readonly Anomalie[] => {
  const banId = nonVide(lieu.banId)

  if (banId == null)
    return [
      anomalie('adresse-hors-ban', 'a-verifier', 'banId', adresseLisible(lieu)),
    ]

  return designeLaMemeCommune(lieu, banId)
    ? []
    : [
        anomalie(
          'ban-id-contredit-la-commune',
          'a-verifier',
          'banId',
          `${lieu.commune} (${nonVide(lieu.codeInsee) ?? '—'}) mais ban_id ${banId}`,
        ),
      ]
}
