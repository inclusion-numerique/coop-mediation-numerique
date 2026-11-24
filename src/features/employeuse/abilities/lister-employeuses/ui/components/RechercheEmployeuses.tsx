'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { type FormEventHandler, useRef } from 'react'
import type { DataTableUrlState } from '@/libraries/data-table'
import { requeteDeRecherche } from '@/libraries/parametres-d-url'

const RechercheEmployeuses = ({ state }: { state: DataTableUrlState }) => {
  const router = useRouter()

  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!formRef.current) return
    const data = new FormData(formRef.current)
    const recherche = data.get('recherche') as string

    router.push(requeteDeRecherche(state, recherche), { scroll: false })
  }

  return (
    <form onSubmit={onSubmit} ref={formRef} className="fr-width-full">
      <div
        className={classNames('fr-search-bar fr-search-bar--lg')}
        role="search"
      >
        <input
          defaultValue={state.recherche}
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
