import { pluriel } from '@/libraries/pluriel'
import type { Acteur } from '../../../../domain'
import type { filtresDeRole } from '../../domain'

type Role = (typeof filtresDeRole)[number]

export const LIBELLE_DU_ROLE: Readonly<Record<Role, string>> = {
  conseiller_numerique: 'Conseiller Numérique',
  mediateur_numerique: 'Médiateur numérique',
  coordinateur: 'Coordinateur',
}

export type GroupesDActeurs = {
  readonly coordinateursDuDispositif: readonly Acteur[]
  readonly coordinateursHorsDispositif: readonly Acteur[]
  readonly autres: readonly Acteur[]
}

const estCoordinateurDu =
  (dispositif: 'ConseillerNumerique' | 'HorsDispositif') =>
  ({ profil }: Acteur): boolean =>
    profil._tag === 'Coordinateur' && profil.dispositif === dispositif

export const groupesDActeurs = (
  acteurs: readonly Acteur[],
): GroupesDActeurs => ({
  coordinateursDuDispositif: acteurs.filter(
    estCoordinateurDu('ConseillerNumerique'),
  ),
  coordinateursHorsDispositif: acteurs.filter(
    estCoordinateurDu('HorsDispositif'),
  ),
  autres: acteurs.filter(({ profil }) => profil._tag === 'Mediateur'),
})

export const libelleDesResultats = (total: number, filtre: boolean): string =>
  total > 0
    ? `${total} ${pluriel(total, 'acteur référencé', 'acteurs référencés')}`
    : filtre
      ? 'Aucun acteur ne correspond à votre recherche'
      : 'Aucun acteur référencé'
