'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { rechercheEnRequete } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/search-params/lister-les-utilisateurs.search-params'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import type { ParametresDeLaListe } from '../search-params/lister-les-utilisateurs.search-params'

const CHAMP = 'recherche'

export const RechercheDUtilisateurs = ({
  searchParams = {},
}: {
  searchParams?: ParametresDeLaListe
}) => {
  const router = useRouter()

  const form = useAppForm({
    defaultValues: { recherche: searchParams.recherche ?? '' },
    onSubmit: ({ value }) => {
      router.push(rechercheEnRequete(searchParams, value.recherche), {
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
