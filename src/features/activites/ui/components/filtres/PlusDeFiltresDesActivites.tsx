'use client'

import { ChoixEnLigne } from '@/libraries/etat-d-url/filtres/ChoixEnLigne'
import { FiltresEnModale } from '@/libraries/etat-d-url/filtres/FiltresEnModale'
import { RechercheEnLigne } from '@/libraries/etat-d-url/filtres/RechercheEnLigne'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '../../../action/rechercher-employeuses.key'
import {
  filtreDeLaSource,
  filtreDesEmployeuses,
  filtreDesTags,
  filtreDesThematiquesAdministratives,
  filtreDesThematiquesDeMediation,
  filtreDuDispositif,
} from '../../filtres/activites.filtre'
import { RechercheDesTags } from './RechercheDesTags'

const rechercherDesEmployeuses = async ({
  recherche,
}: {
  recherche: string
}) => {
  const resultat = await inject(RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY)({
    recherche,
    exclues: [],
  })
  return resultat.success
    ? {
        success: true as const,
        data: resultat.data.map(({ id, nom, commune }) => ({
          value: id,
          label: commune === null ? nom : `${nom} · ${commune}`,
        })),
      }
    : resultat
}

type OptionsDeRecherche = {
  readonly suggestions: readonly SelectOption[]
  readonly choisies: readonly SelectOption[]
}

export const PlusDeFiltresDesActivites = ({
  importsV1,
  avecDispositif = false,
  employeuses,
  tags,
}: {
  importsV1: boolean
  avecDispositif?: boolean
  employeuses: OptionsDeRecherche
  tags: OptionsDeRecherche
}) => (
  <FiltresEnModale
    titre="Plus de filtres"
    filtres={[
      filtreDuDispositif,
      filtreDeLaSource,
      filtreDesEmployeuses,
      filtreDesThematiquesDeMediation,
      filtreDesThematiquesAdministratives,
      filtreDesTags,
    ]}
  >
    {avecDispositif && (
      <>
        <ChoixEnLigne filtre={filtreDuDispositif} legende="Filtrer par rôle" />
        <hr className="fr-separator-8v" />
      </>
    )}
    {importsV1 && (
      <>
        <ChoixEnLigne
          filtre={filtreDeLaSource}
          legende="Filtrer par source de données"
        />
        <hr className="fr-separator-8v" />
      </>
    )}
    {employeuses.suggestions.length > 1 && (
      <>
        <RechercheEnLigne
          filtre={filtreDesEmployeuses}
          libelle="Filtrer par structure employeuse"
          placeholder="Rechercher une structure employeuse"
          selection={{
            singular: 'structure employeuse',
            plural: 'structures employeuses',
          }}
          rechercher={rechercherDesEmployeuses}
          choisies={employeuses.choisies}
          suggestions={employeuses.suggestions}
        />
        <hr className="fr-separator-8v" />
      </>
    )}
    <ChoixEnLigne
      filtre={filtreDesThematiquesDeMediation}
      legende="Filtrer par thématique de médiation numérique"
    />
    <hr className="fr-separator-8v" />
    <ChoixEnLigne
      filtre={filtreDesThematiquesAdministratives}
      legende="Filtrer par thématique de démarches administratives"
    />
    <hr className="fr-separator-8v" />
    <RechercheDesTags suggestions={tags.suggestions} choisies={tags.choisies} />
  </FiltresEnModale>
)
