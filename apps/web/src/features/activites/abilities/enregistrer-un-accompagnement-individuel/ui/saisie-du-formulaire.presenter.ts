import type { CraIndividuelData } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/validation/CraIndividuelValidation'
import { clearAdministrativeData } from '@app/web/features/activites/ui/saisie/clearAdministrativeData'
import type { z } from 'zod'
import { craDureeDataToMinutes } from '../../../use-cases/cra/db/minutesToCraDuree'
import type { EnregistrerUnAccompagnementIndividuelValidation } from '../action/enregistrer-un-accompagnement-individuel.validation'

type Saisie = z.input<typeof EnregistrerUnAccompagnementIndividuelValidation>

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

export const saisieDeLAccompagnementIndividuel = (
  formulaire: CraIndividuelData,
): Saisie => {
  const nettoye = clearAdministrativeData(formulaire)
  const beneficiaire = formulaire.beneficiaire
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
    beneficiaire:
      beneficiaire == null
        ? null
        : {
            id: beneficiaire.id,
            dejaAccompagne: beneficiaire.dejaAccompagne,
            genre: beneficiaire.genre,
            trancheAge: beneficiaire.trancheAge,
            statutSocial: beneficiaire.statutSocial,
            communeResidence: communeDu(beneficiaire.communeResidence),
          },
    autonomie: formulaire.autonomie,
    orienteVersStructure:
      formulaire.orienteVersStructure == null
        ? null
        : formulaire.orienteVersStructure === 'yes',
    structureDeRedirection: formulaire.structureDeRedirection,
  }
}
