import type { DefaultValues } from '@app/web/libs/form/use-app-form'
import type {
  AffichageDeLActivite,
  AtelierCollectif,
  ParticipantsAnonymes,
} from '../../../domain'
import { suiviDuFormulaire } from '../../../ui/saisie/beneficiaire/suivi-du-formulaire'
import { formulaireCommunDeMediation } from '../../../ui/saisie/formulaire-de-mediation.presenter'
import type { CraCollectifData } from './validation/CraCollectifValidation'
import type { ParticipantsAnonymesCraCollectifData } from './validation/ParticipantsAnonymesCraCollectifValidation'

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
