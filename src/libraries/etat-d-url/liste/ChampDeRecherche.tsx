'use client'

import { SearchBar } from '@codegouvfr/react-dsfr/SearchBar'
import classNames from 'classnames'
import { useEffect, useRef } from 'react'
import { rechercheLibre } from '../definition/recherche-libre'
import { useFiltre } from '../filtres/use-filtre'

export const ChampDeRecherche = ({
  placeholder,
  className,
}: {
  placeholder?: string | undefined
  className?: string | undefined
}) => {
  const [{ recherche }, ecrire] = useFiltre(rechercheLibre.parametres)
  const champ = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saisie = champ.current?.querySelector('input')
    if (saisie) saisie.value = recherche
  }, [recherche])

  return (
    <SearchBar
      className={classNames(className, 'fr-search-bar--inline')}
      onButtonClick={(texte) => ecrire({ recherche: texte.trim() })}
      allowEmptySearch
      ref={champ}
      {...(placeholder === undefined ? {} : { label: placeholder })}
      big
    />
  )
}
