import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import {
  type PalierInactivite,
  type PalierInscription,
  type PalierNouveau,
  paliersInactivite,
  paliersInscription,
  paliersNouveau,
  type StatutCompte,
} from './statut-compte'

export const filtresStatut = [
  'inscription0',
  'inscription7',
  'inscription30',
  'inscription60',
  'inscription90',
  'nouveau0',
  'nouveau7',
  'nouveau30',
  'nouveau60',
  'nouveau90',
  'actif',
  'inactif30',
  'inactif90',
  'inactif180',
  'deleted',
] as const

export const FiltreStatut = defineModel(
  z.enum(filtresStatut).brand('FiltreStatut'),
)

export type FiltreStatut = Model.TypeOf<typeof FiltreStatut>

type StatutFiltrable = Exclude<
  StatutCompte,
  { _tag: 'Administrateur' } | { _tag: 'Support' }
>

const statutParFiltre: Record<(typeof filtresStatut)[number], StatutFiltrable> =
  {
    inscription0: { _tag: 'InscriptionEnCours', palier: 0 },
    inscription7: { _tag: 'InscriptionEnCours', palier: 7 },
    inscription30: { _tag: 'InscriptionEnCours', palier: 30 },
    inscription60: { _tag: 'InscriptionEnCours', palier: 60 },
    inscription90: { _tag: 'InscriptionEnCours', palier: 90 },
    nouveau0: { _tag: 'Nouveau', palier: 0 },
    nouveau7: { _tag: 'Nouveau', palier: 7 },
    nouveau30: { _tag: 'Nouveau', palier: 30 },
    nouveau60: { _tag: 'Nouveau', palier: 60 },
    nouveau90: { _tag: 'Nouveau', palier: 90 },
    actif: { _tag: 'Actif' },
    inactif30: { _tag: 'Inactif', palier: 30 },
    inactif90: { _tag: 'Inactif', palier: 90 },
    inactif180: { _tag: 'Inactif', palier: 180 },
    deleted: { _tag: 'Supprime' },
  }

export const statutDuFiltre = (
  filtre: (typeof filtresStatut)[number],
): StatutFiltrable => statutParFiltre[filtre]

export type Intervalle = {
  readonly apres: Date | null
  readonly auPlusTard: Date | null
}

export type CritereStatut =
  | { readonly _tag: 'Supprime' }
  | { readonly _tag: 'InscriptionEnCours'; readonly creation: Intervalle }
  | { readonly _tag: 'Nouveau'; readonly inscription: Intervalle }
  | { readonly _tag: 'Actif'; readonly activiteApres: Date }
  | { readonly _tag: 'Inactif'; readonly activite: Intervalle }

const UN_JOUR = 24 * 60 * 60 * 1000

const ilYA = (jours: number, maintenant: Date): Date =>
  new Date(maintenant.getTime() - jours * UN_JOUR)

const intervalleDuPalier = <P extends number>(
  paliers: readonly P[],
  palier: P | 0,
  maintenant: Date,
): Intervalle => {
  const suivant = paliers.find((candidat) => candidat > palier)

  return {
    apres: suivant === undefined ? null : ilYA(suivant, maintenant),
    auPlusTard: palier === 0 ? null : ilYA(palier, maintenant),
  }
}

const PREMIER_PALIER_D_INACTIVITE: PalierInactivite = paliersInactivite[0]

export const critereDuStatut = (
  filtre: FiltreStatut,
  maintenant: Date,
): CritereStatut => {
  const statut = statutDuFiltre(filtre)

  if (statut._tag === 'Supprime') return { _tag: 'Supprime' }
  if (statut._tag === 'Actif')
    return {
      _tag: 'Actif',
      activiteApres: ilYA(PREMIER_PALIER_D_INACTIVITE, maintenant),
    }
  if (statut._tag === 'InscriptionEnCours')
    return {
      _tag: 'InscriptionEnCours',
      creation: intervalleDuPalier<PalierInscription>(
        paliersInscription,
        statut.palier,
        maintenant,
      ),
    }
  if (statut._tag === 'Nouveau')
    return {
      _tag: 'Nouveau',
      inscription: intervalleDuPalier<PalierNouveau>(
        paliersNouveau,
        statut.palier,
        maintenant,
      ),
    }
  return {
    _tag: 'Inactif',
    activite: intervalleDuPalier<PalierInactivite>(
      paliersInactivite,
      statut.palier,
      maintenant,
    ),
  }
}
