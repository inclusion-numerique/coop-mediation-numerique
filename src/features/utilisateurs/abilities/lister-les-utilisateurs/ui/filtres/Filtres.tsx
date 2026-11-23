'use client'

import type { ReactNode } from 'react'
import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import {
  type OptionsDesFiltres,
  optionsDesDispositifs,
  optionsDesStatuts,
} from '@/features/utilisateurs/ui'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { RECHERCHER_DES_COORDINATEURS_ACTION_KEY } from '../../action/rechercher-des-coordinateurs.key'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '../../action/rechercher-des-employeuses.key'
import { CaseDesAnciensRattachements } from './CaseDesAnciensRattachements'
import { FiltreAChoixUnique } from './FiltreAChoixUnique'
import { FiltreARecherche } from './FiltreARecherche'
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
    <FiltreARecherche
      parametre="employeuses"
      titre="Employeuse"
      libelle="Filtrer par structure employeuse"
      placeholder="Nom, SIRET ou commune de la structure"
      selection={{
        singular: 'employeuse sélectionnée',
        plural: 'employeuses sélectionnées',
      }}
      rechercher={(input) =>
        inject(RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY)(input)
      }
      initiales={optionsChoisies(options.employeuses, filtres.employeuses)}
    />
    <FiltreARecherche
      parametre="coordinateurs"
      titre="Coordinateur"
      libelle="Filtrer par coordinateur"
      placeholder="Nom, prénom ou courriel du coordinateur"
      selection={{
        singular: 'coordinateur sélectionné',
        plural: 'coordinateurs sélectionnés',
      }}
      rechercher={(input) =>
        inject(RECHERCHER_DES_COORDINATEURS_ACTION_KEY)(input)
      }
      initiales={optionsChoisies(options.coordinateurs, filtres.coordinateurs)}
    />
    {filtreDeLieu}
    <CaseDesAnciensRattachements
      coche={filtres.rattachements === 'ActuelsEtAnciens'}
    />
  </div>
)
