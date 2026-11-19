'use client'

import type { ReactNode } from 'react'
import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import {
  type OptionsDesFiltres,
  optionsDesDispositifs,
  optionsDesStatuts,
} from '@/features/utilisateurs/ui'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { FiltreAChoixUnique } from './FiltreAChoixUnique'
import { FiltreEmployeuses } from './FiltreEmployeuses'
import { FiltreRoles } from './FiltreRoles'

const optionsChoisies = (
  options: readonly SelectOption[],
  choisies: readonly (string | number)[],
): readonly SelectOption[] =>
  options.filter(({ value }) => choisies.map(String).includes(value))

export const Filtres = ({
  filtres,
  options,
  filtreDeLieu,
}: {
  filtres: FiltresUtilisateurs
  options: OptionsDesFiltres
  filtreDeLieu: ReactNode
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
    {filtreDeLieu}
  </div>
)
