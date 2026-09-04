'use client'

import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { usePathname, useRouter } from 'next/navigation'
import type { LieuxDataTableSearchParams } from './LieuxDataTable'

const CHAMP = 'recherche'

/**
 * La barre de recherche de l'annuaire d'administration.
 *
 * Ce qu'elle soumet ne part pas au serveur mais dans l'URL : la recherche est
 * un paramètre de page, ce qui la rend partageable, et survit au rechargement.
 * Les autres paramètres — tri, page, taille — voyagent avec elle, sauf ceux que
 * la recherche vide, qu'on retire plutôt que de traîner à blanc.
 */
export const RechercheDeLieux = ({
  searchParams = {},
}: {
  searchParams?: LieuxDataTableSearchParams
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
                Rechercher un lieu d’activité
              </label>
              <input
                className="fr-input fr-input--white"
                // biome-ignore lint/a11y/noAutofocus: l'écran n'existe que pour chercher
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
