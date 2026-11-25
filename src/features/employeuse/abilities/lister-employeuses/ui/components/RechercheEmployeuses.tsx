'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import type { FormEventHandler } from 'react'
import { rechercheLibre } from '@/libraries/etat-d-url'
import { useFiltre } from '@/libraries/etat-d-url/filtres'

const RechercheEmployeuses = () => {
  const [{ recherche }, ecrire] = useFiltre(rechercheLibre.parametres)

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const saisie = new FormData(event.currentTarget).get('recherche')
    ecrire({ recherche: typeof saisie === 'string' ? saisie.trim() : '' })
  }

  return (
    <form onSubmit={onSubmit} className="fr-width-full">
      <div
        className={classNames('fr-search-bar fr-search-bar--lg')}
        role="search"
      >
        <input
          key={recherche}
          defaultValue={recherche}
          className="fr-input fr-input--white"
          autoFocus
          id="recherche"
          type="recherche"
          name="recherche"
          placeholder="Rechercher une structure employeuse par nom, SIRET ou adresse"
        />

        <Button type="submit">Rechercher</Button>
      </div>
    </form>
  )
}

export default RechercheEmployeuses
