'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { rechercheLibre } from '@/libraries/etat-d-url'
import { useFiltre } from '@/libraries/etat-d-url/filtres'
import { handleSubmit } from '@/libraries/formulaire'
import { useAppForm } from '@/libraries/formulaire/hooks'

const CHAMP = 'recherche'

export const RechercheDUtilisateurs = () => {
  const [{ recherche }, ecrire] = useFiltre(rechercheLibre.parametres)

  const form = useAppForm({
    defaultValues: { recherche },
    onSubmit: ({ value }) => ecrire({ recherche: value.recherche.trim() }),
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
