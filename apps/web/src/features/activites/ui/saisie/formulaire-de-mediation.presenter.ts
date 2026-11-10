import { banDefaultValueToAdresseBanData } from '@app/web/external-apis/ban/banDefaultValueToAdresseBanData'
import type {
  ActiviteDeMediation,
  AffichageDeLActivite,
  Commune,
  Equipement,
  Thematiques,
} from '../../domain'
import { minutesToCraDureeData } from '../../use-cases/cra/db/minutesToCraDuree'

export const communeDuFormulaire = (commune: Commune) =>
  banDefaultValueToAdresseBanData({
    commune: commune.nom,
    codePostal: commune.codePostal,
    codeInsee: commune.codeInsee,
  })

const thematiquesDuFormulaire = (thematiques: Thematiques) => [
  ...thematiques.mediation,
  ...(thematiques.demarche === null
    ? []
    : [
        'AideAuxDemarchesAdministratives' as const,
        ...thematiques.demarche.thematiques,
      ]),
]

const materielDuFormulaire = (equipement: Equipement) => {
  if (equipement._tag === 'NonRenseigne') return []
  return equipement._tag === 'AucunMateriel'
    ? ['Aucun' as const]
    : [...equipement.materiels]
}

const lieuDuFormulaire = (
  activite: ActiviteDeMediation,
  affichage: AffichageDeLActivite,
) => {
  const { lieu } = activite
  if (lieu._tag === 'LieuActivite') {
    return {
      structure:
        affichage.lieu === null
          ? undefined
          : {
              id: affichage.lieu.id,
              nom: affichage.lieu.nom,
              adresse: affichage.lieu.adresse ?? undefined,
            },
      lieuCommuneData: undefined,
    }
  }
  return {
    structure: undefined,
    lieuCommuneData:
      lieu._tag === 'ADistance' ? undefined : communeDuFormulaire(lieu.commune),
  }
}

export const formulaireCommunDeMediation = (
  activite: ActiviteDeMediation,
  affichage: AffichageDeLActivite,
) => ({
  id: activite.id,
  mediateurId: activite.mediateurId,
  date: activite.date,
  duree: minutesToCraDureeData(activite.duree) ?? {},
  typeLieu: activite.lieu._tag,
  ...lieuDuFormulaire(activite, affichage),
  thematiques: thematiquesDuFormulaire(activite.thematiques),
  precisionsDemarche: activite.thematiques.demarche?.precision ?? undefined,
  materiel: materielDuFormulaire(activite.equipement),
  notes: activite.notes ?? undefined,
  rdvServicePublicId:
    activite.origine._tag === 'RendezVous' ? activite.origine.rdvId : undefined,
  tags: affichage.tags.map(({ id, nom }) => ({ id, nom })),
})
