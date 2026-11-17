'use client'

import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { usePathname, useRouter } from 'next/navigation'
import type { UtilisateursDataTableSearchParams } from './UtilisateursDataTable'

const CHAMP = 'recherche'

export const RechercheDUtilisateurs = ({
  searchParams = {},
}: {
  searchParams?: UtilisateursDataTableSearchParams
}) => {
  const pathname = usePathname()
  const router = useRouter()

  const form = useAppForm({
    defaultValues: { recherche: searchParams.recherche ?? '' },
    onSubmit: ({ value }) => {
      const parametres = Object.entries({
        ...searchParams,
        recherche: value.recherche,
      }).filter((entree): entree is [string, string] => Boolean(entree[1]))

      router.push(`${pathname}?${new URLSearchParams(parametres).toString()}`, {
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
                Rechercher un utilisateur
              </label>
              <input
                className="fr-input fr-input--white"
                autoFocus
                id={CHAMP}
                type="search"
                name={CHAMP}
                placeholder="Rechercher un utilisateur par nom, email ou identifiant"
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
