import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { pluriel } from '@app/web/libraries/pluriel'
import type { Acteur } from '../../../domain'
import type { EtiquetteDeFiltre } from '../../../ui/etiquette-de-filtre'
import type { CriteresActeurs, filtresDeRole } from '../domain'

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

export const etiquettesDesFiltres = (
  { role, communes }: CriteresActeurs,
  options: readonly SelectOption[],
): readonly EtiquetteDeFiltre[] => {
  const cleDuRole: Role | null = role
  return [
    ...(cleDuRole === null
      ? []
      : [
          {
            parametre: 'role',
            valeur: cleDuRole,
            libelle: LIBELLE_DU_ROLE[cleDuRole],
          },
        ]),
    ...options
      .filter(({ value }) => communes.some((commune) => commune === value))
      .map(({ label, value }) => ({
        parametre: 'communes',
        valeur: value,
        libelle: `Commune : ${label}`,
      })),
  ]
}
