import type { ParticipantsAnonymesCraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/ParticipantsAnonymesCraCollectifValidation'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'

export const participantsAnonymesDefault: ParticipantsAnonymesCraCollectifData =
  {
    total: 0,

    dejaAccompagne: 0,

    genreMasculin: 0,
    genreFeminin: 0,
    genreNonCommunique: 0,

    trancheAgeMoinsDeDouze: 0,
    trancheAgeDouzeDixHuit: 0,
    trancheAgeDixHuitVingtQuatre: 0,
    trancheAgeVingtCinqTrenteNeuf: 0,
    trancheAgeQuaranteCinquanteNeuf: 0,
    trancheAgeSoixanteSoixanteNeuf: 0,
    trancheAgeSoixanteDixPlus: 0,
    trancheAgeNonCommunique: 0,

    statutSocialScolarise: 0,
    statutSocialSansEmploi: 0,
    statutSocialEnEmploi: 0,
    statutSocialRetraite: 0,
    statutSocialNonCommunique: 0,
  }

export const countGenreNonCommunique = ({
  total,
  genreFeminin,
  genreMasculin,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (total ?? 0) - (genreFeminin ?? 0) - (genreMasculin ?? 0)

export const countTrancheAgeNonCommunique = ({
  total,
  trancheAgeMoinsDeDouze,
  trancheAgeDouzeDixHuit,
  trancheAgeDixHuitVingtQuatre,
  trancheAgeVingtCinqTrenteNeuf,
  trancheAgeQuaranteCinquanteNeuf,
  trancheAgeSoixanteSoixanteNeuf,
  trancheAgeSoixanteDixPlus,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (total ?? 0) -
  (trancheAgeMoinsDeDouze ?? 0) -
  (trancheAgeDouzeDixHuit ?? 0) -
  (trancheAgeDixHuitVingtQuatre ?? 0) -
  (trancheAgeVingtCinqTrenteNeuf ?? 0) -
  (trancheAgeQuaranteCinquanteNeuf ?? 0) -
  (trancheAgeSoixanteSoixanteNeuf ?? 0) -
  (trancheAgeSoixanteDixPlus ?? 0)

export const countStatutSocialNonCommunique = ({
  total,
  statutSocialScolarise,
  statutSocialSansEmploi,
  statutSocialEnEmploi,
  statutSocialRetraite,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (total ?? 0) -
  (statutSocialScolarise ?? 0) -
  (statutSocialSansEmploi ?? 0) -
  (statutSocialEnEmploi ?? 0) -
  (statutSocialRetraite ?? 0)

export const countTotalGenre = ({
  genreFeminin,
  genreMasculin,
  genreNonCommunique,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (genreFeminin ?? 0) + (genreMasculin ?? 0) + (genreNonCommunique ?? 0)

export const countTotalTrancheAge = ({
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

export const countTotalStatutSocial = ({
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
