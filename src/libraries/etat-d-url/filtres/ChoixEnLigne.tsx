'use client'

import classNames from 'classnames'
import type { ParserMap } from 'nuqs'
import { type ReactNode, useState } from 'react'
import type { FiltreQuelconque } from '../definition'
import { useChampDeFiltre } from './conteneur-de-filtres'
import { useFiltre } from './use-filtre'

type FiltreAChoisir = FiltreQuelconque & {
  readonly cle: string
  readonly choix: Readonly<Record<string, string>>
  readonly unique: boolean
}

const enListe = (valeur: unknown): readonly string[] =>
  Array.isArray(valeur) ? valeur : typeof valeur === 'string' ? [valeur] : []

export const ChoixEnLigne = ({
  filtre,
  legende,
  petit = false,
}: {
  filtre: FiltreAChoisir
  legende: ReactNode
  petit?: boolean
}) => {
  const [lues, ecrire] = useFiltre<ParserMap>(filtre.parametres)
  const [choisies, setChoisies] = useState(enListe(lues[filtre.cle]))

  const enUrl = (valeurs: readonly string[]) => ({
    [filtre.cle]: filtre.unique ? (valeurs.at(0) ?? null) : valeurs,
  })

  useChampDeFiltre({
    valider: () => ecrire(enUrl(choisies)),
    effacer: () => ecrire(enUrl([])),
  })

  const basculer = (valeur: string, coche: boolean) =>
    setChoisies(
      filtre.unique
        ? coche
          ? [valeur]
          : []
        : coche
          ? [...choisies, valeur]
          : choisies.filter((autre) => autre !== valeur),
    )

  return (
    <fieldset className="fr-fieldset fr-mb-0">
      <legend className="fr-fieldset__legend fr-text--bold">{legende}</legend>
      {Object.entries(filtre.choix).map(([valeur, libelle]) => (
        <div className="fr-fieldset__element" key={valeur}>
          <div
            className={classNames(
              filtre.unique ? 'fr-radio-group' : 'fr-checkbox-group',
              petit &&
                (filtre.unique
                  ? 'fr-radio-group--sm'
                  : 'fr-checkbox-group--sm'),
            )}
          >
            <input
              type={filtre.unique ? 'radio' : 'checkbox'}
              id={`filtre-${filtre.cle}-${valeur}`}
              name={filtre.cle}
              checked={choisies.includes(valeur)}
              onChange={(evenement) =>
                basculer(valeur, evenement.target.checked)
              }
            />
            <label
              className="fr-label fr-whitespace-nowrap"
              htmlFor={`filtre-${filtre.cle}-${valeur}`}
            >
              {libelle}
            </label>
          </div>
        </div>
      ))}
    </fieldset>
  )
}
