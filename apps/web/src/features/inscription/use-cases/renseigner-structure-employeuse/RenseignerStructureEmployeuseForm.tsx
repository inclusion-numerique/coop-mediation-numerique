'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import { renseignerStructureEmployeuseAction } from '@app/web/app/_actions/inscription/renseigner-structure-employeuse.action'
import StructureCard from '@app/web/components/structure/StructureCard'
import SiretInputInfo from '@app/web/features/structures/siret/SiretInputInfo'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Alert from '@codegouvfr/react-dsfr/Alert'
import Button from '@codegouvfr/react-dsfr/Button'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RenseignerStructureEmployeuseValidation } from './renseigner-structure-employeuse.validation'
import {
  StructureEmployeuseComboBox,
  StructureEmployeuseOptions,
} from './StructureEmployeuseComboBox'
import type { StructureSearchResult } from './searchStructureEmployeuseCombined'

const RenseignerStructureEmployeuseForm = ({
  nextStepPath,
}: {
  nextStepPath: string
}) => {
  const router = useRouter()
  const [apiUnavailable, setApiUnavailable] = useState(false)

  const erreurEnregistrement = () =>
    createToast({
      priority: 'error',
      message:
        'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
    })

  const form = useAppForm({
    validators: { onSubmit: RenseignerStructureEmployeuseValidation },
    defaultValues: { structure: null as StructureSearchResult | null },
    onSubmit: async ({ value: { structure } }) => {
      if (!structure) return

      try {
        const result = await renseignerStructureEmployeuseAction({ structure })

        // `rattachee: false` = l'employeuse n'a pas pu être garantie côté
        // Entrepôt (géocodage ou API indisponible). Rien n'a été enregistré :
        // on le dit et on laisse l'utilisateur réessayer plutôt que de
        // l'avancer sans employeuse.
        if (!result.success || !result.data.rattachee) {
          erreurEnregistrement()
          return
        }

        router.push(nextStepPath)
        router.refresh()
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isPending = useStore(form.store, (state) => state.isSubmitting)
  // La carte récapitulative n'apparaît qu'une fois le choix fait : c'est aussi
  // ce qui autorise la soumission.
  const structureChoisie = useStore(
    form.store,
    (state) => state.values.structure,
  )

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        {apiUnavailable && (
          <Alert
            severity="warning"
            small
            className="fr-mb-4v"
            title="Service de recherche temporairement indisponible"
            description="La recherche dans l'annuaire des entreprises est momentanément indisponible. Seules les structures déjà enregistrées sont affichées. Veuillez réessayer ultérieurement."
          />
        )}
        <form.AppField name="structure">
          {(field) => (
            <field.ComboBox
              isPending={isPending}
              resetValue={null}
              {...StructureEmployeuseComboBox(setApiUnavailable)}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps,
                ...options
              }) => (
                <>
                  <field.Input
                    addonEnd={
                      <Button
                        title="Rechercher une structure"
                        className="fr-border-left-0"
                        iconId="fr-icon-search-line"
                        {...getToggleButtonProps({ type: 'button' })}
                      />
                    }
                    isConnected={false}
                    isPending={isPending}
                    nativeLabelProps={getLabelProps()}
                    nativeInputProps={{
                      ...getInputProps(),
                      placeholder: 'Rechercher',
                    }}
                    label="Rechercher par SIRET, nom ou adresse de votre structure"
                    hintText={<SiretInputInfo />}
                  />
                  <Options {...options} {...StructureEmployeuseOptions} />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        {structureChoisie && (
          <StructureCard
            className="fr-mt-6v fr-mb-6v"
            structure={structureChoisie}
          />
        )}

        <hr className="fr-separator-12v" />

        <div className="fr-btns-group">
          <form.Submit isPending={isPending} disabled={!structureChoisie}>
            Continuer
          </form.Submit>
        </div>
      </form>
    </form.AppForm>
  )
}

export default RenseignerStructureEmployeuseForm
