import type { z } from 'zod'
import type { CraCollectifData } from '../../../use-cases/cra/collectif/validation/CraCollectifValidation'
import { clearAdministrativeData } from '../../../use-cases/cra/components/clearAdministrativeData'
import { craDureeDataToMinutes } from '../../../use-cases/cra/db/minutesToCraDuree'
import type { EnregistrerUnAtelierCollectifValidation } from '../action/enregistrer-un-atelier-collectif.validation'

type Saisie = z.input<typeof EnregistrerUnAtelierCollectifValidation>

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
  const nettoye = clearAdministrativeData(formulaire)
  const anonymes = formulaire.participantsAnonymes
  return {
    id: formulaire.id,
    date: formulaire.date,
    duree: craDureeDataToMinutes(formulaire.duree),
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
