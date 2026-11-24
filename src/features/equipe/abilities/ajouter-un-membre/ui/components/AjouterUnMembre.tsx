'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { hrefDeLEquipeDuCoordinateurEnAdministration } from '@/features/equipe/ui/presenters/liens.presenter'
import type { ComboBoxData } from '@/libraries/formulaire/fields-components/ComboBox'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { useHydrated } from '@/libraries/formulaire/use-hydrated'
import { inject } from '@/libraries/nextjs/injection/client'
import { Options, type OptionsData } from '@/libraries/ui/primitives/Options'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { buttonLoadingClassname } from '@/libraries/ui/utils/button-loading-classname'
import { AJOUTER_UN_MEMBRE_ACTION_KEY } from '../../action/ajouter-un-membre.key'
import { RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY } from '../../action/rechercher-des-mediateurs-a-ajouter.key'
import type { EquipeAComplementer, MediateurAAjouter } from '../../domain'

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
        hrefDeLEquipeDuCoordinateurEnAdministration(equipe.utilisateurId),
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
