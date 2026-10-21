import { derniereActiviteDe, type SituationDActivite } from './activite'
import type { CycleDeVie } from './cycle-de-vie'
import type { RoleUtilisateur } from './role-utilisateur'

export const paliersInscription = [7, 30, 60, 90] as const
export const paliersNouveau = [7, 30, 60, 90] as const
export const paliersInactivite = [30, 90, 180] as const

export type PalierInscription = 0 | (typeof paliersInscription)[number]
export type PalierNouveau = 0 | (typeof paliersNouveau)[number]
export type PalierInactivite = (typeof paliersInactivite)[number]

export type StatutCompte =
  | { readonly _tag: 'Supprime' }
  | { readonly _tag: 'Administrateur' }
  | { readonly _tag: 'Support' }
  | { readonly _tag: 'InscriptionEnCours'; readonly palier: PalierInscription }
  | { readonly _tag: 'Nouveau'; readonly palier: PalierNouveau }
  | { readonly _tag: 'Actif' }
  | { readonly _tag: 'Inactif'; readonly palier: PalierInactivite }

export type SituationDuCompte = {
  readonly role: RoleUtilisateur
  readonly cycle: CycleDeVie
  readonly activite: SituationDActivite
}

const UN_JOUR = 24 * 60 * 60 * 1000

const joursDepuis = (date: Date, maintenant: Date): number =>
  (maintenant.getTime() - date.getTime()) / UN_JOUR

const palierAtteint = <P extends number>(
  paliers: readonly P[],
  jours: number,
): P | 0 =>
  paliers.reduce<P | 0>(
    (atteint, palier) => (jours >= palier ? palier : atteint),
    0,
  )

const statutDInscrit = (
  inscritLe: Date,
  activite: SituationDActivite,
  maintenant: Date,
): StatutCompte => {
  const derniere = derniereActiviteDe(activite)

  if (derniere._tag === 'Jamais')
    return {
      _tag: 'Nouveau',
      palier: palierAtteint(paliersNouveau, joursDepuis(inscritLe, maintenant)),
    }

  const palier = palierAtteint(
    paliersInactivite,
    joursDepuis(derniere.date, maintenant),
  )

  return palier === 0 ? { _tag: 'Actif' } : { _tag: 'Inactif', palier }
}

export const statutDe = (
  { role, cycle, activite }: SituationDuCompte,
  maintenant: Date,
): StatutCompte => {
  if (cycle._tag === 'Supprime') return { _tag: 'Supprime' }
  if (role === 'Admin') return { _tag: 'Administrateur' }
  if (role === 'Support') return { _tag: 'Support' }
  if (cycle._tag === 'InscriptionEnCours')
    return {
      _tag: 'InscriptionEnCours',
      palier: palierAtteint(
        paliersInscription,
        joursDepuis(cycle.creeLe, maintenant),
      ),
    }
  return statutDInscrit(cycle.inscritLe, activite, maintenant)
}
