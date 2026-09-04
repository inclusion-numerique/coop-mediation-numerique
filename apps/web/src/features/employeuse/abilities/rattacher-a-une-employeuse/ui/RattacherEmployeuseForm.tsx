'use client'

import { Options } from '@app/ui/components/Primitives/Options'
import { createToast } from '@app/ui/toast/createToast'
import { renseignerStructureEmployeuseAction } from '@app/web/app/_actions/employeuse/renseigner-structure-employeuse.action'
import SiretInputInfo from '@app/web/components/siret/SiretInputInfo'
import StructureCard from '@app/web/components/structure/StructureCard'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Alert from '@codegouvfr/react-dsfr/Alert'
import Button from '@codegouvfr/react-dsfr/Button'
import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  RenseignerStructureEmployeuseValidation,
  type StructureSearchResult,
} from '../domain/employeuse-choisie'
import {
  StructureEmployeuseComboBox,
  StructureEmployeuseOptions,
} from './StructureEmployeuseComboBox'

/**
 * Choix d'une structure employeuse, puis rattachement.
 *
 * Deux contextes l'utilisent, et c'est `nextStepPath` qui les distingue :
 * l'inscription enchaîne sur l'étape suivante, tandis que la garde d'une page
 * qui exige une employeuse (la saisie d'un CRA) passe `null` — il n'y a alors
 * nulle part où aller, la page demandée s'affiche d'elle-même une fois la
 * garde levée, et un simple rafraîchissement suffit à la révéler.
 */
const RattacherEmployeuseForm = ({
  nextStepPath,
}: {
  nextStepPath: string | null
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

        if (nextStepPath) router.push(nextStepPath)
        router.refresh()
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isPending = useSelector(form.store, (state) => state.isSubmitting)
  // La carte récapitulative n'apparaît qu'une fois le choix fait : c'est aussi
  // ce qui autorise la soumission.
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

export default RattacherEmployeuseForm
