'use client'

import type { FiltresUtilisateurs } from '@/features/utilisateurs/domain'
import {
  type OptionsDesFiltres,
  optionsDesDispositifs,
  optionsDesStatuts,
} from '@/features/utilisateurs/ui/presenters/libelles-des-filtres.presenter'
import { departements } from '@/libraries/departement/departements'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { RECHERCHER_DES_COMMUNES_ACTION_KEY } from '../../../action/rechercher-des-communes.key'
import { RECHERCHER_DES_COORDINATEURS_ACTION_KEY } from '../../../action/rechercher-des-coordinateurs.key'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '../../../action/rechercher-des-employeuses.key'
import { RECHERCHER_DES_LIEUX_ACTION_KEY } from '../../../action/rechercher-des-lieux.key'
import { rechercherParmi } from '../combo-box-de-recherche'
import { CaseDesAnciensRattachements } from './CaseDesAnciensRattachements'
import { FiltreAChoixUnique } from './FiltreAChoixUnique'
import { FiltreARecherche } from './FiltreARecherche'
import { FiltreRoles } from './FiltreRoles'

const optionsChoisies = (
  options: readonly SelectOption[],
  choisies: readonly (string | number)[],
): readonly SelectOption[] =>
  options.filter(({ value }) => choisies.map(String).includes(value))

const optionsDesDepartements: readonly SelectOption[] = departements.map(
  ({ code, nom }) => ({ value: code, label: `${code} · ${nom}` }),
)

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
    <FiltreARecherche
      parametre="lieux"
      titre="Lieu d’activité"
      libelle="Filtrer par lieu d’activité"
      placeholder="Nom, commune ou code postal du lieu"
      selection={{
        singular: 'lieu sélectionné',
        plural: 'lieux sélectionnés',
      }}
      rechercher={(input) => inject(RECHERCHER_DES_LIEUX_ACTION_KEY)(input)}
      initiales={optionsChoisies(options.lieux, filtres.lieux)}
    />
    <FiltreARecherche
      parametre="communes"
      titre="Commune"
      libelle="Filtrer par commune de l’employeuse"
      placeholder="Nom ou code postal de la commune"
      selection={{
        singular: 'commune sélectionnée',
        plural: 'communes sélectionnées',
      }}
      rechercher={(input) => inject(RECHERCHER_DES_COMMUNES_ACTION_KEY)(input)}
      longueurMinimale={2}
      initiales={optionsChoisies(options.communes, filtres.communes)}
    />
    <FiltreARecherche
      parametre="departements"
      titre="Département"
      libelle="Filtrer par département de l’employeuse"
      placeholder="Nom ou numéro du département"
      selection={{
        singular: 'département sélectionné',
        plural: 'départements sélectionnés',
      }}
      rechercher={rechercherParmi(optionsDesDepartements)}
      longueurMinimale={1}
      initiales={optionsChoisies(options.departements, filtres.departements)}
    />
    <CaseDesAnciensRattachements
      coche={filtres.rattachements === 'ActuelsEtAnciens'}
    />
  </div>
)
