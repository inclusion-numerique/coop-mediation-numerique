'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { requeteDeRecherche } from '@/libraries/parametres-d-url'
import type { ListeDesLieuxSearchParams } from '../search-params/lister-tous-les-lieux.search-params'

const CHAMP = 'recherche'

export const RechercheDeLieux = ({
  searchParams = {},
}: {
  searchParams?: ListeDesLieuxSearchParams
}) => {
  const router = useRouter()

  const form = useAppForm({
    defaultValues: { recherche: searchParams.recherche ?? '' },
    onSubmit: ({ value }) => {
      router.push(requeteDeRecherche(searchParams, value.recherche), {
        scroll: false,
      })
    },
  })

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)} className="fr-width-full">
        <form.AppField name={CHAMP}>
          {(field) => (
            <div className="fr-search-bar fr-search-bar--lg" role="search">
              <label className="fr-sr-only" htmlFor={CHAMP}>
                Rechercher un lieu d’activité
              </label>
              <input
                className="fr-input fr-input--white"
                autoFocus
                id={CHAMP}
                type="search"
                name={CHAMP}
                placeholder="Rechercher un lieu d’activité par nom, SIRET ou adresse"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <Button type="submit">Rechercher</Button>
            </div>
          )}
        </form.AppField>
      </form>
    </form.AppForm>
  )
}
