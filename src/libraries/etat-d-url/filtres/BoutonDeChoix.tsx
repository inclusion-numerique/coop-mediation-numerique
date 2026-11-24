'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import type { ParserMap } from 'nuqs'
import type { ReactNode } from 'react'
import type { FiltreQuelconque } from '../definition/filtre'
import { useFiltre } from './use-filtre'

const enListe = (valeur: unknown): readonly string[] =>
  Array.isArray(valeur) ? valeur : []

export const BoutonDeChoix = ({
  filtre,
  valeur,
  children,
}: {
  filtre: FiltreQuelconque & { readonly cle: string }
  valeur: string
  children: ReactNode
}) => {
  const [lues, ecrire] = useFiltre<ParserMap>(filtre.parametres)
  const choisies = enListe(lues[filtre.cle])
  const actif = choisies.includes(valeur)

  return (
    <Button
      type="button"
      className={classNames(
        'fr-border-radius--4',
        actif && 'fr-background-alt--blue-france',
      )}
      priority={actif ? 'secondary' : 'tertiary'}
      onClick={() =>
        ecrire({
          [filtre.cle]: actif
            ? choisies.filter((autre) => autre !== valeur)
            : [...choisies, valeur],
        })
      }
    >
      {children}
    </Button>
  )
}
