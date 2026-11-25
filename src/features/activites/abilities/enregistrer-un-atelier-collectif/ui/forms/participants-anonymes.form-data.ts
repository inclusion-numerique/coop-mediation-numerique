import type { ParticipantsAnonymesCraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/participants-anonymes-du-cra-collectif.validation'
import type { DefaultValues } from '@/libraries/formulaire/hooks'

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

export const nombreDeGenresNonCommuniques = ({
  total,
  genreFeminin,
  genreMasculin,
}: DefaultValues<ParticipantsAnonymesCraCollectifData>): number =>
  (total ?? 0) - (genreFeminin ?? 0) - (genreMasculin ?? 0)

export const nombreDeTranchesDAgeNonCommuniquees = ({
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

export const nombreDeStatutsSociauxNonCommuniques = ({
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
