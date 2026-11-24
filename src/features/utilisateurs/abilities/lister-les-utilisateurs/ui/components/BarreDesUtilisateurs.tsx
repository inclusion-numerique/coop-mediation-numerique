'use client'

import type { ReactNode } from 'react'
import {
  filtreDesAnciensRattachements,
  filtreDesCommunes,
  filtreDesCoordinateurs,
  filtreDesDepartements,
  filtreDesEmployeuses,
  filtreDesLieux,
  filtreDesRoles,
  filtreDuDispositif,
  filtreDuStatut,
} from '@/features/utilisateurs/ui/filtres/utilisateurs.filtre'
import type { BarreDesUtilisateursPresentee } from '@/features/utilisateurs/ui/presenters/barre-des-utilisateurs.presenter'
import { departements } from '@/libraries/departement/departements'
import { BarreDeFiltres } from '@/libraries/etat-d-url/filtres/BarreDeFiltres'
import { CaseACocher } from '@/libraries/etat-d-url/filtres/CaseACocher'
import { ChoixEnPopover } from '@/libraries/etat-d-url/filtres/ChoixEnPopover'
import { rechercherParmi } from '@/libraries/etat-d-url/filtres/combo-box-de-recherche'
import { RechercheEnPopover } from '@/libraries/etat-d-url/filtres/RechercheEnPopover'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { RECHERCHER_DES_COMMUNES_ACTION_KEY } from '../../action/rechercher-des-communes.key'
import { RECHERCHER_DES_COORDINATEURS_ACTION_KEY } from '../../action/rechercher-des-coordinateurs.key'
import { RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY } from '../../action/rechercher-des-employeuses.key'
import { RECHERCHER_DES_LIEUX_ACTION_KEY } from '../../action/rechercher-des-lieux.key'

const OPTIONS_DES_DEPARTEMENTS: readonly SelectOption[] = departements.map(
  ({ code, nom }) => ({ value: code, label: `${code} · ${nom}` }),
)

export const BarreDesUtilisateurs = ({
  barre,
  actions,
}: {
  barre: BarreDesUtilisateursPresentee
  actions: ReactNode
}) => (
  <BarreDeFiltres
    etiquettes={barre.etiquettes}
    sansFiltres={barre.sansFiltres}
    actions={actions}
  >
    <ChoixEnPopover
      titre="Rôle"
      sections={[{ filtre: filtreDesRoles, legende: 'Filtrer par rôle :' }]}
    />
    <ChoixEnPopover
      titre="Dispositif"
      sections={[
        { filtre: filtreDuDispositif, legende: 'Filtrer par dispositif :' },
      ]}
    />
    <ChoixEnPopover
      titre="Statut"
      sections={[{ filtre: filtreDuStatut, legende: 'Filtrer par statut :' }]}
    />
    <RechercheEnPopover
      titre="Employeuse"
      filtre={filtreDesEmployeuses}
      libelle="Filtrer par structure employeuse"
      placeholder="Nom, SIRET ou commune de la structure"
      selection={{
        singular: 'employeuse sélectionnée',
        plural: 'employeuses sélectionnées',
      }}
      rechercher={(input) =>
        inject(RECHERCHER_DES_EMPLOYEUSES_ACTION_KEY)(input)
      }
      choisies={barre.choisies.employeuses}
    />
    <RechercheEnPopover
      titre="Coordinateur"
      filtre={filtreDesCoordinateurs}
      libelle="Filtrer par coordinateur"
      placeholder="Nom, prénom ou courriel du coordinateur"
      selection={{
        singular: 'coordinateur sélectionné',
        plural: 'coordinateurs sélectionnés',
      }}
      rechercher={(input) =>
        inject(RECHERCHER_DES_COORDINATEURS_ACTION_KEY)(input)
      }
      choisies={barre.choisies.coordinateurs}
    />
    <RechercheEnPopover
      titre="Lieu d’activité"
      filtre={filtreDesLieux}
      libelle="Filtrer par lieu d’activité"
      placeholder="Nom, commune ou code postal du lieu"
      selection={{ singular: 'lieu sélectionné', plural: 'lieux sélectionnés' }}
      rechercher={(input) => inject(RECHERCHER_DES_LIEUX_ACTION_KEY)(input)}
      choisies={barre.choisies.lieux}
    />
    <RechercheEnPopover
      titre="Commune"
      filtre={filtreDesCommunes}
      libelle="Filtrer par commune de l’employeuse"
      placeholder="Nom ou code postal de la commune"
      selection={{
        singular: 'commune sélectionnée',
        plural: 'communes sélectionnées',
      }}
      rechercher={(input) => inject(RECHERCHER_DES_COMMUNES_ACTION_KEY)(input)}
      choisies={barre.choisies.communes}
      longueurMinimale={2}
    />
    <RechercheEnPopover
      titre="Département"
      filtre={filtreDesDepartements}
      libelle="Filtrer par département de l’employeuse"
      placeholder="Nom ou numéro du département"
      selection={{
        singular: 'département sélectionné',
        plural: 'départements sélectionnés',
      }}
      rechercher={rechercherParmi(OPTIONS_DES_DEPARTEMENTS)}
      choisies={barre.choisies.departements}
      longueurMinimale={1}
    />
    <CaseACocher
      filtre={filtreDesAnciensRattachements}
      valeur="ActuelsEtAnciens"
      libelle="Inclure les anciennes employeuses, équipes et lieux"
    />
  </BarreDeFiltres>
)
