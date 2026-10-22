'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  LieuFilter,
  type LieuFilterValue,
} from '@app/web/features/lieux-activite/ui'
import type { FiltresUtilisateurs } from '@app/web/features/utilisateurs/domain'
import {
  type OptionsDesFiltres,
  optionsDesDispositifs,
  optionsDesStatuts,
} from '@app/web/features/utilisateurs/ui'
import { FiltreAChoixUnique } from './FiltreAChoixUnique'
import { FiltreEmployeuses } from './FiltreEmployeuses'
import { FiltreRoles } from './FiltreRoles'

const valeursDeLieu = (
  filtres: FiltresUtilisateurs,
): readonly LieuFilterValue[] => [
  ...(filtres.lieux.length === 0
    ? []
    : [{ type: 'lieu' as const, value: [...filtres.lieux] }]),
  ...(filtres.communes.length === 0
    ? []
    : [{ type: 'commune' as const, value: [...filtres.communes] }]),
  ...(filtres.departements.length === 0
    ? []
    : [{ type: 'departement' as const, value: [...filtres.departements] }]),
]

const optionsChoisies = (
  options: readonly SelectOption[],
  choisies: readonly (string | number)[],
): readonly SelectOption[] =>
  options.filter(({ value }) => choisies.map(String).includes(value))

export const Filtres = ({
  filtres,
  options,
}: {
  filtres: FiltresUtilisateurs
  options: OptionsDesFiltres
}) => (
  <div className="fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v">
    <FiltreRoles rolesInitiaux={filtres.roles} />
    <FiltreAChoixUnique
      parametre="conseiller_numerique"
      titre="Dispositif"
      libelleDeTous="Tous"
      options={optionsDesDispositifs}
      valeurInitiale={
        filtres.dispositif === null
          ? null
          : filtres.dispositif === 'ConseillerNumerique'
            ? '1'
            : '0'
      }
    />
    <FiltreAChoixUnique
      parametre="statut"
      titre="Statut"
      libelleDeTous="Tous les statuts"
      options={optionsDesStatuts}
      valeurInitiale={filtres.statut}
    />
    <FiltreEmployeuses
      employeusesInitiales={optionsChoisies(
        options.employeuses,
        filtres.employeuses,
      )}
    />
    <LieuFilter
      defaultValue={[...valeursDeLieu(filtres)]}
      lieuxActiviteOptions={[...options.lieux]}
      communesOptions={[...options.communes]}
      departementsOptions={[...options.departements]}
    />
  </div>
)
