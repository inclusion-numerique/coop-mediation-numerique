import type { DefaultValues } from 'react-hook-form'
import type { AtelierCollectif, ParticipantsAnonymes } from '../../../domain'
import type { AffichageDeLActivite } from '../../../implementation/lire-une-activite-de-mediation'
import { getBeneficiaireDefaultCraDataFromExisting } from '../../../ui/saisie/beneficiaire-du-formulaire'
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
  participants: affichage.suivis.map((suivi) =>
    getBeneficiaireDefaultCraDataFromExisting(suivi)(),
  ),
  participantsAnonymes: anonymesDuFormulaire(atelier.participants.anonymes),
})
