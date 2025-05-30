import type { DefaultValues } from 'react-hook-form'
import type { ParticipantsAnonymesCraCollectifData } from './ParticipantsAnonymesCraCollectifValidation'

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

export const countNonCommunique = {
  genre: countGenreNonCommunique,
  trancheAge: countTrancheAgeNonCommunique,
  statutSocial: countStatutSocialNonCommunique,
}

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

export const countTotal = {
  genre: countTotalGenre,
  trancheAge: countTotalTrancheAge,
  statutSocial: countTotalStatutSocial,
}
