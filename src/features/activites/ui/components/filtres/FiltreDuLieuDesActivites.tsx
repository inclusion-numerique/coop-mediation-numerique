'use client'

import { useState } from 'react'
import { FiltresEnPopover } from '@/libraries/etat-d-url/filtres/FiltresEnPopover'
import { RechercheEnLigne } from '@/libraries/etat-d-url/filtres/RechercheEnLigne'
import { inject } from '@/libraries/nextjs/injection/client'
import type { SelectOption } from '@/libraries/ui/form/utils/options'
import {
  type GenreDuLieuRecherche,
  RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY,
} from '../../../action/rechercher-les-lieux-des-activites.key'
import {
  filtreDesCommunes,
  filtreDesDepartements,
  filtreDesLieux,
} from '../../filtres/activites.filtre'

type OptionsDesLieux = {
  readonly lieux: readonly SelectOption[]
  readonly communes: readonly SelectOption[]
  readonly departements: readonly SelectOption[]
}

const GENRES = [
  {
    cle: 'lieux',
    genre: 'LieuDActivite',
    filtre: filtreDesLieux,
    libelle: 'Lieu d’activité',
    placeholder: 'Choisir un lieu d’activité',
    selection: { singular: 'lieu', plural: 'lieux' },
  },
  {
    cle: 'communes',
    genre: 'Commune',
    filtre: filtreDesCommunes,
    libelle: 'Commune',
    placeholder: 'Choisir une commune',
    selection: { singular: 'commune', plural: 'communes' },
  },
  {
    cle: 'departements',
    genre: 'Departement',
    filtre: filtreDesDepartements,
    libelle: 'Département',
    placeholder: 'Choisir un département',
    selection: { singular: 'département', plural: 'départements' },
  },
] as const

const rechercherSelon =
  (genre: GenreDuLieuRecherche) =>
  ({ recherche }: { recherche: string }) =>
    inject(RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY)({ genre, recherche })

export const FiltreDuLieuDesActivites = ({
  suggestions,
  choisies,
}: {
  suggestions: OptionsDesLieux
  choisies: OptionsDesLieux
}) => {
  const [affiche, setAffiche] =
    useState<(typeof GENRES)[number]['cle']>('lieux')

  return (
    <FiltresEnPopover
      titre="Lieu"
      filtres={GENRES.map(({ filtre }) => filtre)}
      largeur={384}
    >
      <div className="fr-select-group">
        <label className="fr-label fr-text--bold" htmlFor="genre-de-lieu">
          Filtrer par&nbsp;:
        </label>
        <select
          className="fr-select"
          id="genre-de-lieu"
          value={affiche}
          onChange={(evenement) =>
            setAffiche(
              GENRES.find(({ cle }) => cle === evenement.target.value)?.cle ??
                'lieux',
            )
          }
        >
          {GENRES.map(({ cle, libelle }) => (
            <option key={cle} value={cle}>
              {libelle}
            </option>
          ))}
        </select>
      </div>
      {GENRES.map(({ cle, genre, filtre, libelle, placeholder, selection }) => (
        <div key={cle} hidden={cle !== affiche}>
          <RechercheEnLigne
            filtre={filtre}
            libelle={libelle}
            placeholder={placeholder}
            selection={selection}
            rechercher={rechercherSelon(genre)}
            choisies={choisies[cle]}
            suggestions={suggestions[cle]}
            longueurMinimale={1}
          />
        </div>
      ))}
    </FiltresEnPopover>
  )
}
