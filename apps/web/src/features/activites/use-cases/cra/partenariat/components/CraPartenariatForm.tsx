'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import { DefaultValues } from 'react-hook-form'
import { Tag } from '../../../tags/components/TagsComboBox'
import styles from '../../components/CraForm.module.css'
import { TagsFields } from '../../components/fields/TagsFields'
import {
  ECHELON_TERRITORIAL_OPTIONS,
  NATURE_OPTIONS,
  TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS,
} from '../labels'
import {
  CraPartenariatData,
  CraPartenariatValidation,
} from '../validation/CraPartenariatValidation'

type CraPartenariatFormProps = {
  defaultValues: DefaultValues<CraPartenariatData> & { coordinateurId: string }
  initialTagsOptions: Tag[]
  retour?: string
}

const valueMatching =
  (item: string) =>
  ({ value }: { value: string }) =>
    value === item

const CraPartenariatForm = ({
  defaultValues,
  initialTagsOptions,
  retour,
}: CraPartenariatFormProps) => {
  const router = useRouter()
  const mutation = trpc.cra.partenariat.useMutation()
  const isPending = mutation.isPending

  const form = useAppForm({
    validators: {
      onSubmit: CraPartenariatValidation,
    },
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => {
        replaceRouteWithoutRerender(
          `/coop/mes-coordinations/cra/partenariat?v=${encodeSerializableState(
            formApi.state.values,
          )}`,
        )
      },
    },
    onSubmit: async (data) => {
      if (isPending) return

      try {
        await mutation.mutateAsync(data.value as CraPartenariatData)
        createToast({
          priority: 'success',
          message: 'Le partenariat a bien été enregistré.',
        })
        router.push(retour ?? '/coop/mes-coordinations')
        router.refresh()
      } catch (mutationError) {
        createToast({
          priority: 'error',
          message:
            'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
        })
        throw mutationError
      }
    },
  })

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <form.AppField name="date">
          {(field) => (
            <field.Input
              className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
              isPending={isPending}
              nativeInputProps={{ type: 'date' }}
              classes={{ nativeInputOrTextArea: styles.tallInput }}
              label={
                <>
                  Date de lancement du partenariat <RedAsterisk />
                </>
              }
              hintText="Renseignez la date à laquelle le partenariat avec la ou les structure·s partenaire·s a commencé."
            />
          )}
        </form.AppField>
        <form.AppField name="naturePartenariat">
          {(field) => (
            <div className="fr-py-4v">
              <field.MultiSelect
                isPending={isPending}
                options={NATURE_OPTIONS}
                placeholder="Sélectionnez la ou les natures du partenariat"
                hint="Vous pouvez sélectionner un ou plusieurs choix."
                nativeSelectProps={{ className: 'fr-py-4v' }}
                label={
                  <>
                    Nature du partenariat <RedAsterisk />
                  </>
                }
              />
              {(field.state.value?.length ?? 0) > 0 && (
                <field.SelectedItems
                  itemToString={(item: string) =>
                    NATURE_OPTIONS.find(valueMatching(item))?.label ?? ''
                  }
                  itemToKey={(item: string) => item}
                />
              )}
              {field.state.value?.includes('Autre') && (
                <form.AppField name="naturePartenariatAutre">
                  {(field) => (
                    <field.Input
                      label="Veuillez préciser le choix “Autre” :"
                      className="fr-mb-8v"
                      size="x-large"
                      nativeInputProps={{ placeholder: 'À compléter' }}
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              )}
            </div>
          )}
        </form.AppField>
        <form.AppField name="echelonTerritorial">
          {(field) => (
            <field.Select
              isPending={isPending}
              options={ECHELON_TERRITORIAL_OPTIONS}
              className="fr-py-4v"
              placeholder="Sélectionnez l’échelon territorial du partenariat"
              label="Échelon territorial du partenariat"
            />
          )}
        </form.AppField>
        <hr className="fr-separator-12v" />
        <p className="fr-text--bold fr-mb-0">Structure·s partenaire·s</p>
        <p className="fr-text--xs fr-text-mention--grey fr-mb-4v">
          Vous pouvez renseigner une ou plusieurs structure·s partenaires
        </p>
        <form.Field name="structuresPartenaires" mode="array">
          {(field) => (
            <>
              {field.state.value?.map((_, index: number) => (
                <div
                  key={index}
                  className="fr-border fr-px-8v fr-my-6v fr-border-radius--4"
                >
                  <div className="fr-flex fr-justify-content-space-between fr-align-items-center">
                    <p className="fr-my-6v fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase">
                      Partenaire #{index + 1}
                    </p>
                    {(field.state.value?.length ?? 0) > 1 && (
                      <Button
                        type="button"
                        size="small"
                        priority="tertiary no outline"
                        iconId="fr-icon-close-circle-line"
                        iconPosition="right"
                        onClick={() => field.removeValue(index)}
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                  <form.AppField name={`structuresPartenaires[${index}].nom`}>
                    {(subField) => (
                      <subField.Input
                        label={
                          <>
                            Nom de la structure partenaire <RedAsterisk />
                          </>
                        }
                        className="fr-mb-2v"
                        size="x-large"
                        nativeInputProps={{
                          placeholder:
                            'Renseignez le nom de la structure partenaire',
                        }}
                        isPending={isPending}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name={`structuresPartenaires[${index}].type`}>
                    {(subField) => (
                      <>
                        <subField.Select
                          isPending={isPending}
                          options={TYPE_DE_STRUCTURE_PARTENAIRE_OPTIONS}
                          className="fr-py-4v"
                          placeholder="Sélectionnez le type de structure"
                          label={
                            <>
                              Type de la structure partenaire <RedAsterisk />
                            </>
                          }
                        />
                        {subField.state.value === 'Autre' && (
                          <form.AppField
                            name={`structuresPartenaires[${index}].typeAutre`}
                          >
                            {(field) => (
                              <field.Input
                                label="Veuillez préciser le choix “Autre” :"
                                className="fr-mb-8v"
                                size="x-large"
                                nativeInputProps={{
                                  placeholder: 'À compléter',
                                }}
                                isPending={isPending}
                              />
                            )}
                          </form.AppField>
                        )}
                      </>
                    )}
                  </form.AppField>
                </div>
              ))}
              <Button
                type="button"
                priority="secondary"
                size="large"
                iconId="fr-icon-add-line"
                className="fr-width-full fr-justify-content-center"
                onClick={() => {
                  field.pushValue({ nom: undefined, type: undefined })
                  form.validate('change')
                }}
              >
                Ajouter une structure partenaire
              </Button>
            </>
          )}
        </form.Field>
        <hr className="fr-separator-12v" />
        <TagsFields
          form={form as any}
          isPending={isPending}
          initialTagsOptions={initialTagsOptions}
        />
        <form.AppField name="notes">
          {(field) => (
            <field.RichTextarea
              label="Notes sur l’accompagnement"
              hint={
                <>
                  Vous pouvez rédiger ici une note contextuelle sur l’activité
                  réalisée.
                  <br />
                  Ces notes sont personnelles et vous les retrouverez dans votre
                  historique d’activités.
                </>
              }
              isPending={isPending}
              className="fr-mt-12v"
            />
          )}
        </form.AppField>
        <div className="fr-btns-group fr-mt-12v fr-mb-30v">
          <form.Submit isPending={isPending}>
            Enregistrer l’activité
          </form.Submit>
          <Button priority="secondary" linkProps={{ href: retour ?? '/coop' }}>
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}

export default withTrpc(CraPartenariatForm)
