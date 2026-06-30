'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import StructureCard from '@app/web/components/structure/StructureCard'
import {
  type RenseignerStructureEmployeuseFormData,
  renseignerStructureEmployeuseFormShape,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse'
import SiretInputInfo from '@app/web/features/structures/siret/SiretInputInfo'
import type { ServerActionResult } from '@app/web/libraries/nextjs'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Alert from '@codegouvfr/react-dsfr/Alert'
import Button from '@codegouvfr/react-dsfr/Button'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  type StructureEmployeuseItem,
  structureEmployeuseComboBox,
  structureEmployeuseOptions,
} from './structure-employeuse-combo-box'

export type EnregistrerStructureEmployeuse = (
  data: RenseignerStructureEmployeuseFormData,
) => Promise<ServerActionResult<{ structureId: string }>>

type FormValues = { structureEmployeuse: StructureEmployeuseItem | null }

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

/**
 * Recherche et sélection de la structure employeuse via le ComboBox async (même
 * patron que la recherche d'adresse de la feature bénéficiaire). La sélection
 * peuple le champ `structureEmployeuse` ; la soumission est bloquée tant qu'aucune
 * structure n'est choisie. La route lie la server action `save`.
 */
const RenseignerStructureEmployeuseForm = ({
  save,
  nextStepPath,
}: {
  save: EnregistrerStructureEmployeuse
  nextStepPath: string
}) => {
  const router = useRouter()
  const [apiUnavailable, setApiUnavailable] = useState(false)

  const defaultValues: FormValues = {
    structureEmployeuse: null,
  }

  const form = useAppForm({
    validators: { onSubmit: renseignerStructureEmployeuseFormShape },
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await save(
          renseignerStructureEmployeuseFormShape.parse(value),
        )
        if (!result.success) {
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
  const selected = useStore(
    form.store,
    (state) => state.values.structureEmployeuse,
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
        <form.AppField name="structureEmployeuse">
          {(field) => (
            <field.ComboBox
              isPending={isPending}
              {...structureEmployeuseComboBox(setApiUnavailable)}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps,
                ...options
              }) => (
                <div className="fr-mb-2v">
                  <field.Input
                    addonEnd={
                      <Button
                        title="Rechercher une structure"
                        className="fr-border-left-0 fr-pl-3v"
                        iconId="fr-icon-search-line"
                        {...getToggleButtonProps({ type: 'button' })}
                      />
                    }
                    isPending={isPending}
                    isConnected={false}
                    nativeLabelProps={getLabelProps()}
                    nativeInputProps={{
                      ...getInputProps(),
                      placeholder:
                        'Rechercher par SIRET, nom ou adresse de votre structure',
                    }}
                    label={
                      <span className="fr-text--medium fr-mb-1v fr-display-block">
                        Rechercher votre structure employeuse
                      </span>
                    }
                  />
                  <Options {...options} {...structureEmployeuseOptions} />
                </div>
              )}
            </field.ComboBox>
          )}
        </form.AppField>
        <SiretInputInfo />
        {selected && (
          <StructureCard
            className="fr-mt-6v fr-mb-6v"
            structure={{
              nom: selected.nom,
              siret: selected.siret,
              adresse: selected.adresseBan.nom,
              commune: selected.adresseBan.commune,
              codePostal: selected.adresseBan.codePostal,
              typologies: selected.typologies ?? null,
              rna: null,
            }}
          />
        )}
        <hr className="fr-separator-12v" />
        <div className="fr-btns-group">
          <form.Submit isPending={isPending} disabled={!selected}>
            Continuer
          </form.Submit>
        </div>
      </form>
    </form.AppForm>
  )
}

export default RenseignerStructureEmployeuseForm
