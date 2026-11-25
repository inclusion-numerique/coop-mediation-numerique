import type { CraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/forms/cra-collectif.validation'
import { minutesDeLaDuree } from '@/features/activites/ui/forms/saisie/duree.form-data'
import { effacerLesDonneesAdministratives } from '@/features/activites/ui/forms/saisie/effacer-les-donnees-administratives.form-data'
import type { SaisieDUnAtelierCollectif } from '../../action/enregistrer-un-atelier-collectif.validation'

type Saisie = SaisieDUnAtelierCollectif

type AdresseDuFormulaire = {
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
}

const communeDu = (adresse: AdresseDuFormulaire | null | undefined) =>
  adresse == null
    ? null
    : {
        nom: adresse.commune,
        codePostal: adresse.codePostal,
        codeInsee: adresse.codeInsee,
      }

export const saisieDeLAtelierCollectif = (
  formulaire: CraCollectifData,
): Saisie => {
  const nettoye = effacerLesDonneesAdministratives(formulaire)
  const anonymes = formulaire.participantsAnonymes
  return {
    id: formulaire.id,
    date: formulaire.date,
    duree: minutesDeLaDuree(formulaire.duree),
    typeLieu: formulaire.typeLieu,
    lieuActiviteId: formulaire.structure?.id,
    lieuCommune: communeDu(formulaire.lieuCommuneData),
    thematiques: nettoye.thematiques,
    precisionsDemarche: nettoye.precisionsDemarche,
    materiel: formulaire.materiel,
    tags: formulaire.tags.map((tag) => tag.id),
    notes: formulaire.notes,
    rdvId: formulaire.rdvServicePublicId,
    titreAtelier: formulaire.titreAtelier,
    niveau: formulaire.niveau,
    participants: formulaire.participants.map((participant) => participant.id),
    participantsAnonymes: {
      total: anonymes.total,
      dejaAccompagnes: anonymes.dejaAccompagne,
      genres: {
        masculin: anonymes.genreMasculin,
        feminin: anonymes.genreFeminin,
      },
      tranchesDAge: {
        moinsDeDouze: anonymes.trancheAgeMoinsDeDouze,
        douzeDixHuit: anonymes.trancheAgeDouzeDixHuit,
        dixHuitVingtQuatre: anonymes.trancheAgeDixHuitVingtQuatre,
        vingtCinqTrenteNeuf: anonymes.trancheAgeVingtCinqTrenteNeuf,
        quaranteCinquanteNeuf: anonymes.trancheAgeQuaranteCinquanteNeuf,
        soixanteSoixanteNeuf: anonymes.trancheAgeSoixanteSoixanteNeuf,
        soixanteDixPlus: anonymes.trancheAgeSoixanteDixPlus,
      },
      statutsSociaux: {
        scolarise: anonymes.statutSocialScolarise,
        sansEmploi: anonymes.statutSocialSansEmploi,
        enEmploi: anonymes.statutSocialEnEmploi,
        retraite: anonymes.statutSocialRetraite,
      },
    },
  }
}
