'use client'

import {
  Options,
  type OptionsData,
} from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import type { ComboBoxData } from '@app/web/libs/form/fields-components/ComboBox'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useHydrated } from '@app/web/libs/form/use-hydrated'
import { inject } from '@app/web/libs/injection/client'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { AJOUTER_UN_MEMBRE_ACTION_KEY } from '../action/ajouter-un-membre.key'
import { RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY } from '../action/rechercher-des-mediateurs-a-ajouter.key'
import type { EquipeAComplementer, MediateurAAjouter } from '../domain'

const cleDe = ({ utilisateurId }: MediateurAAjouter): string => utilisateurId

const optionsDesMediateurs: OptionsData<MediateurAAjouter> = {
  itemToKey: cleDe,
  renderItem: ({ item }) => (
    <span className="fr-flex fr-direction-column">
      <span>{item.nom}</span>
      <span className="fr-text--xs fr-text-mention--grey fr-mb-0">
        {item.email}
      </span>
    </span>
  ),
}

const mediateurComboBox = (
  coordinateurId: string,
): ComboBoxData<MediateurAAjouter> => ({
  itemToString: (mediateur) =>
    mediateur ? `${mediateur.nom} (${mediateur.email})` : '',
  itemToKey: cleDe,
  loadSuggestions: async (recherche) => {
    if (recherche.trim().length < 2) return { items: [] }
    const resultat = await inject(
      RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY,
    )({ coordinateurId, recherche })
    return { items: resultat.success ? [...resultat.data] : [] }
  },
})

const aucun = (): MediateurAAjouter | null => null

export const AjouterUnMembre = ({
  equipe,
}: {
  equipe: EquipeAComplementer
}) => {
  const router = useRouter()
  const champRef = useRef<HTMLDivElement>(null)
  const enAttente = !useHydrated()
  const [choisi, setChoisi] = useState<MediateurAAjouter | null>(null)
  const [enCours, demarrer] = useTransition()
  const form = useAppForm({ defaultValues: { mediateur: aucun() } })

  const ajouter = () =>
    demarrer(async () => {
      if (choisi === null) return
      const resultat = await inject(AJOUTER_UN_MEMBRE_ACTION_KEY)({
        utilisateurId: choisi.utilisateurId,
        coordinateurId: equipe.coordinateurId,
      })

      if (!resultat.success) {
        createToast({ priority: 'error', message: resultat.error })
        return
      }

      createToast({
        priority: 'success',
        message: `L'utilisateur a été ajouté à l'équipe`,
      })
      router.push(
        `/administration/utilisateurs/${equipe.utilisateurId}#coordinateur`,
      )
      router.refresh()
    })

  return (
    <div className="fr-border-radius--8 fr-border fr-p-8v fr-mb-6v">
      <h2 className="fr-h6">Rechercher l’utilisateur à ajouter à l’équipe</h2>
      <form.AppForm>
        <form.AppField name="mediateur">
          {(field) => (
            <field.ComboBox
              isPending={enAttente}
              onSelect={setChoisi}
              {...mediateurComboBox(equipe.coordinateurId)}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps: _,
                ...optionsProps
              }) => (
                <>
                  <div ref={champRef}>
                    <field.Input
                      isConnected={false}
                      isPending={enAttente}
                      nativeLabelProps={getLabelProps()}
                      nativeInputProps={{
                        ...getInputProps(),
                        placeholder: 'Nom ou adresse e-mail',
                      }}
                      label="Médiateur à ajouter"
                    />
                  </div>
                  <Options
                    {...optionsProps}
                    {...optionsDesMediateurs}
                    anchorRef={champRef}
                    className="fr-index-2000"
                  />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>
      </form.AppForm>
      <Button
        type="button"
        onClick={ajouter}
        iconId="fr-icon-user-add-line"
        disabled={choisi === null}
        {...buttonLoadingClassname(enCours)}
      >
        Ajouter
      </Button>
    </div>
  )
}
