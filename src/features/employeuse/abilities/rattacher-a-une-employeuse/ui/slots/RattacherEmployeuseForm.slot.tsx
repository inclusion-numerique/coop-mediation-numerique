'use client'

import Alert from '@codegouvfr/react-dsfr/Alert'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import SiretInputInfo from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/components/SiretInputInfo'
import StructureAdministrativeCard from '@/features/employeuse/ui/slots/StructureAdministrativeCard.slot'
import { handleSubmit, useAppForm } from '@/libraries/formulaire/hooks'
import { inject } from '@/libraries/nextjs/injection'
import { Options } from '@/libraries/ui/primitives'
import { createToast } from '@/libraries/ui/toast'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '../../action/renseigner-structure-employeuse.key'
import { RenseignerStructureEmployeuseValidation } from '../../action/renseigner-structure-employeuse.validation'
import type { StructureTrouvee } from '../../domain/structure-trouvee'
import {
  StructureEmployeuseComboBox,
  StructureEmployeuseOptions,
} from '../forms/StructureEmployeuseComboBox'

const RattacherEmployeuseForm = ({
  nextStepPath,
}: {
  nextStepPath: Route | null
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
    defaultValues: { structure: null as StructureTrouvee | null },
    onSubmit: async ({ value: { structure } }) => {
      if (!structure) return

      try {
        const result = await inject(RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY)(
          {
            structure,
          },
        )

        if (!result.success || !result.data.rattachee) {
          erreurEnregistrement()
          return
        }

        if (nextStepPath) router.push(nextStepPath)
        router.refresh()
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isPending = useSelector(form.store, (state) => state.isSubmitting)
  const structureChoisie = useSelector(
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
          <StructureAdministrativeCard
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

export default RattacherEmployeuseForm
