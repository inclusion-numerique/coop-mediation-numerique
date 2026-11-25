import z from 'zod'
import type { DefaultValues } from '@/libraries/formulaire'
import { numberToString } from '@/libraries/nombre'

const participantsAnonymesMax = 10_000
const participantsAnonymesMaxLocaleString = numberToString(
  participantsAnonymesMax,
)

const participantsAnonymeNumber = ({ maxMessage }: { maxMessage: string }) =>
  z.coerce
    .number<number>({ error: 'Veuillez renseigner un nombre' })
    .int({
      message: 'Veuillez renseigner un nombre entier',
    })
    .max(participantsAnonymesMax, maxMessage)

const totalDesGenres = ({
  genreFeminin,
  genreMasculin,
  genreNonCommunique,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (genreFeminin ?? 0) + (genreMasculin ?? 0) + (genreNonCommunique ?? 0)

const totalDesTranchesDAge = ({
  trancheAgeMoinsDeDouze,
  trancheAgeDouzeDixHuit,
  trancheAgeDixHuitVingtQuatre,
  trancheAgeVingtCinqTrenteNeuf,
  trancheAgeQuaranteCinquanteNeuf,
  trancheAgeSoixanteSoixanteNeuf,
  trancheAgeSoixanteDixPlus,
  trancheAgeNonCommunique,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (trancheAgeMoinsDeDouze ?? 0) +
  (trancheAgeDouzeDixHuit ?? 0) +
  (trancheAgeDixHuitVingtQuatre ?? 0) +
  (trancheAgeVingtCinqTrenteNeuf ?? 0) +
  (trancheAgeQuaranteCinquanteNeuf ?? 0) +
  (trancheAgeSoixanteSoixanteNeuf ?? 0) +
  (trancheAgeSoixanteDixPlus ?? 0) +
  (trancheAgeNonCommunique ?? 0)

const totalDesStatutsSociaux = ({
  statutSocialScolarise,
  statutSocialSansEmploi,
  statutSocialEnEmploi,
  statutSocialRetraite,
  statutSocialNonCommunique,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (statutSocialScolarise ?? 0) +
  (statutSocialSansEmploi ?? 0) +
  (statutSocialEnEmploi ?? 0) +
  (statutSocialRetraite ?? 0) +
  (statutSocialNonCommunique ?? 0)

export const ParticipantsAnonymesCraCollectifValidation = z
  .object({
    total: participantsAnonymeNumber({
      maxMessage: `Le nombre total de participants anonymes ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),

    dejaAccompagne: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants déjà accompagnés ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),

    genreFeminin: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de genre féminin ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    genreMasculin: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de genre masculin ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    genreNonCommunique: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de genre non communiqué ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),

    trancheAgeMoinsDeDouze: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge moins de douze ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    trancheAgeDouzeDixHuit: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge douze à dix-huit ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    trancheAgeDixHuitVingtQuatre: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge 18-24 ans ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    trancheAgeVingtCinqTrenteNeuf: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge 25-39 ans ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    trancheAgeQuaranteCinquanteNeuf: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge 40-59 ans ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    trancheAgeSoixanteSoixanteNeuf: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge 60-69 ans ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    trancheAgeSoixanteDixPlus: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge 70 ans et plus ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    trancheAgeNonCommunique: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de tranche d’âge non communiqué ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),

    statutSocialScolarise: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes scolarisés ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    statutSocialSansEmploi: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes sans emploi ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    statutSocialEnEmploi: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes en emploi ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    statutSocialRetraite: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes retraités ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
    statutSocialNonCommunique: participantsAnonymeNumber({
      maxMessage: `Le nombre de participants anonymes de statut social non communiqué ne doit pas dépasser ${participantsAnonymesMaxLocaleString}`,
    }),
  })
  .refine((data) => data.dejaAccompagne <= (data.total ?? 0), {
    message:
      'La somme des données socio-démographiques dépasse le total des bénéficiaires anonymes',
    path: ['total'],
  })
  .refine((data) => totalDesGenres(data) <= (data.total ?? 0), {
    message:
      'La somme des données socio-démographiques dépasse le total des bénéficiaires anonymes',
    path: ['total'],
  })
  .refine((data) => totalDesTranchesDAge(data) <= (data.total ?? 0), {
    message:
      'La somme des données socio-démographiques dépasse le total des bénéficiaires anonymes',
    path: ['total'],
  })
  .refine((data) => totalDesStatutsSociaux(data) <= (data.total ?? 0), {
    message:
      'La somme des données socio-démographiques dépasse le total des bénéficiaires anonymes',
    path: ['total'],
  })

export type ParticipantsAnonymesCraCollectifData = {
  total: number

  dejaAccompagne: number

  genreFeminin: number
  genreMasculin: number
  genreNonCommunique: number

  trancheAgeMoinsDeDouze: number
  trancheAgeDouzeDixHuit: number
  trancheAgeDixHuitVingtQuatre: number
  trancheAgeVingtCinqTrenteNeuf: number
  trancheAgeQuaranteCinquanteNeuf: number
  trancheAgeSoixanteSoixanteNeuf: number
  trancheAgeSoixanteDixPlus: number
  trancheAgeNonCommunique: number

  statutSocialScolarise: number
  statutSocialSansEmploi: number
  statutSocialEnEmploi: number
  statutSocialRetraite: number
  statutSocialNonCommunique: number
}
