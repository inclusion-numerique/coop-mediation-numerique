import type { DefaultValues } from '@/libraries/formulaire/hooks'
import type {
  AffichageDeLActivite,
  AtelierCollectif,
  ParticipantsAnonymes,
} from '../../../../domain'
import { formulaireCommunDeMediation } from '../../../../ui/presenters/saisie/formulaire-de-mediation.presenter'
import { suiviDuFormulaire } from '../../../../ui/presenters/saisie/suivi-du-formulaire.presenter'
import type { CraCollectifData } from '../forms/cra-collectif.validation'
import type { ParticipantsAnonymesCraCollectifData } from '../forms/participants-anonymes-du-cra-collectif.validation'

const anonymesDuFormulaire = ({
  total,
  dejaAccompagnes,
  genres,
  tranchesDAge,
  statutsSociaux,
}: ParticipantsAnonymes): ParticipantsAnonymesCraCollectifData => ({
  total,
  dejaAccompagne: dejaAccompagnes,
  genreMasculin: genres.masculin,
  genreFeminin: genres.feminin,
  genreNonCommunique: genres.nonCommunique,
  trancheAgeMoinsDeDouze: tranchesDAge.moinsDeDouze,
  trancheAgeDouzeDixHuit: tranchesDAge.douzeDixHuit,
  trancheAgeDixHuitVingtQuatre: tranchesDAge.dixHuitVingtQuatre,
  trancheAgeVingtCinqTrenteNeuf: tranchesDAge.vingtCinqTrenteNeuf,
  trancheAgeQuaranteCinquanteNeuf: tranchesDAge.quaranteCinquanteNeuf,
  trancheAgeSoixanteSoixanteNeuf: tranchesDAge.soixanteSoixanteNeuf,
  trancheAgeSoixanteDixPlus: tranchesDAge.soixanteDixPlus,
  trancheAgeNonCommunique: tranchesDAge.nonCommunique,
  statutSocialScolarise: statutsSociaux.scolarise,
  statutSocialSansEmploi: statutsSociaux.sansEmploi,
  statutSocialEnEmploi: statutsSociaux.enEmploi,
  statutSocialRetraite: statutsSociaux.retraite,
  statutSocialNonCommunique: statutsSociaux.nonCommunique,
})

export const formulaireDeLAtelierCollectif = (
  atelier: AtelierCollectif,
  affichage: AffichageDeLActivite,
): DefaultValues<CraCollectifData> => ({
  ...formulaireCommunDeMediation(atelier, affichage),
  titreAtelier: atelier.titre ?? undefined,
  niveau: atelier.niveau ?? undefined,
  participants: affichage.suivis.map(suiviDuFormulaire),
  participantsAnonymes: anonymesDuFormulaire(atelier.participants.anonymes),
})
