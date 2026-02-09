'use client'

import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { Options } from '@app/ui/components/Primitives/Options'
import { useModalVisibility } from '@app/ui/hooks/useModalVisibility'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import TagScopeBadge from '@app/web/features/activites/use-cases/tags/components/TagScopeBadge'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { Fragment, useCallback, useRef, useState } from 'react'
import { TagItem } from '../components/TagItem'
import { TagScope } from '../tagScope'
import {
  MergeDestinationTag,
  MergeTagComboBox,
  MergeTagOptions,
  renderItem,
} from './MergeTagComboBox'

type MergeTagDynamicModalInitialState = {
  id?: string | null
  nom?: string | null
  description?: string | null
  scope?: TagScope | null
  accompagnementsCount?: number | null
  equipeNumber?: number | null
  equipeCoordinateurNom?: string | null
  defaultMergeDestinations?: MergeDestinationTag[]
}

export const MergeTagDynamicModal =
  createDynamicModal<MergeTagDynamicModalInitialState>({
    id: 'merge-tag-modal',
    isOpenedByDefault: false,
    initialState: {
      id: null,
      nom: '',
      description: null,
      scope: null,
      accompagnementsCount: null,
      equipeNumber: null,
      equipeCoordinateurNom: null,
      defaultMergeDestinations: [],
    },
  })

type Step = 'selection' | 'confirmation'

const MergeTagModal = () => {
  const {
    id,
    nom,
    description,
    scope,
    accompagnementsCount,
    equipeNumber,
    equipeCoordinateurNom,
    defaultMergeDestinations,
  } = MergeTagDynamicModal.useState()
  const [step, setStep] = useState<Step>('selection')
  const [formKey, setFormKey] = useState(0)
  const inputContainerRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const mutation = trpc.tags.merge.useMutation()
  const isPending = mutation.isPending

  const form = useAppForm({
    defaultValues: {
      sourceTagId: id ?? '',
      destinationTag: null as MergeDestinationTag | null,
    },
    onSubmit: async (data) => {
      if (isPending) return
      if (!data.value.destinationTag) return

      try {
        await mutation.mutateAsync({
          sourceTagId: data.value.sourceTagId,
          destinationTagId: data.value.destinationTag.id,
        })

        MergeTagDynamicModal.close()
        form.reset()
        setStep('selection')

        createToast({
          priority: 'success',
          message: `Le tag "${nom}" a bien été fusionné`,
        })

        router.refresh()
      } catch {
        createToast({
          priority: 'error',
          message: 'Une erreur est survenue lors de la fusion du tag.',
        })
      }
    },
  })

  const selectedDestinationTag = useStore(
    form.store,
    (state) => state.values.destinationTag,
  )

  const handleCancel = () => {
    if (step === 'confirmation') {
      setStep('selection')
    } else {
      form.reset()
    }
  }

  const handleFusionner = () => {
    setStep('confirmation')
  }

  const handleConfirm = () => {
    form.handleSubmit()
  }

  const resetModal = useCallback(() => {
    setStep('selection')
    form.reset()
    setFormKey((k) => k + 1)
  }, [form])

  useModalVisibility(MergeTagDynamicModal.id, {
    onClosed: resetModal,
  })

  return (
    <form.AppForm>
      <MergeTagDynamicModal.Component
        title={
          step === 'selection' ? 'Fusion de tag' : 'Confirmation de la fusion'
        }
        buttons={
          step === 'selection'
            ? [
                {
                  children: 'Annuler',
                  priority: 'secondary',
                  disabled: isPending,
                  type: 'button',
                  onClick: handleCancel,
                },
                {
                  children: 'Continuer',
                  type: 'button',
                  disabled: !selectedDestinationTag,
                  onClick: handleFusionner,
                  doClosesModal: false,
                },
              ]
            : [
                {
                  children: 'Retour',
                  priority: 'secondary',
                  disabled: isPending,
                  type: 'button',
                  onClick: handleCancel,
                  doClosesModal: false,
                },
                {
                  children: 'Confirmer la fusion',
                  type: 'button',
                  onClick: handleConfirm,
                  ...buttonLoadingClassname(isPending),
                  doClosesModal: false,
                },
              ]
        }
      >
        {step === 'selection' &&
          id &&
          nom &&
          scope &&
          accompagnementsCount != null && (
            <Fragment key={`${id}-${formKey}`}>
              <p>
                En fusionnant ce tag, les activités qui lui sont liées seront
                ajoutées au tag de destination que vous allez sélectionner.
              </p>
              <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8">
                <TagItem
                  id={id}
                  nom={nom}
                  description={description ?? undefined}
                  scope={scope}
                  accompagnementsCount={accompagnementsCount}
                  equipeNumber={equipeNumber ?? undefined}
                  equipeCoordinateurNom={equipeCoordinateurNom ?? undefined}
                  small
                />
              </div>
              <hr className="fr-separator-8v" />
              <form.AppField name="destinationTag">
                {(field) => (
                  <field.ComboBox
                    isPending={isPending}
                    defaultItems={defaultMergeDestinations}
                    {...MergeTagComboBox(id ?? '')}
                  >
                    {({
                      getLabelProps,
                      getInputProps,
                      getToggleButtonProps,
                      ...options
                    }) => (
                      <>
                        <div ref={inputContainerRef}>
                          <field.Input
                            addonEnd={
                              <Button
                                title="Voir la liste des tags"
                                className="fr-border-left-0 fr-py-7v fr-pl-4v"
                                iconId="fr-icon-search-line"
                                {...getToggleButtonProps({ type: 'button' })}
                              />
                            }
                            addinEnd={
                              field.state.value != null && (
                                <Button
                                  title="Désélectionner le tag"
                                  type="button"
                                  size="large"
                                  iconId="fr-icon-close-line"
                                  priority="tertiary no outline"
                                  onClick={() => {
                                    field.setValue(null)
                                    options.setInputValue('')
                                  }}
                                />
                              )
                            }
                            isConnected={false}
                            isPending={isPending}
                            nativeLabelProps={getLabelProps()}
                            classes={{
                              nativeInputOrTextArea: 'fr-input--tall',
                            }}
                            nativeInputProps={{
                              ...getInputProps(),
                              placeholder: 'Rechercher un tag de destination',
                            }}
                            label="Sélectionner le tag de destination&nbsp;:"
                          />
                        </div>
                        <Options
                          {...options}
                          {...MergeTagOptions}
                          anchorRef={inputContainerRef}
                          className="fr-index-2000"
                        />
                      </>
                    )}
                  </field.ComboBox>
                )}
              </form.AppField>
              {selectedDestinationTag && (
                <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8 fr-mt-3v">
                  {renderItem({ item: selectedDestinationTag })}
                </div>
              )}
              {selectedDestinationTag == null &&
                scope === TagScope.Departemental && (
                  <div className="fr-mt-4v fr-background-alt--blue-france fr-px-6v fr-py-4v fr-border-radius--8">
                    <div className="fr-mb-3v fr-text--sm">
                      Un tag départemental peut fusionner uniquement vers&nbsp;:
                    </div>
                    <div className="fr-flex fr-flex-gap-2v">
                      <TagScopeBadge scope={TagScope.Departemental} small />
                      <TagScopeBadge scope={TagScope.National} small />
                    </div>
                  </div>
                )}
              {selectedDestinationTag == null && scope === TagScope.Equipe && (
                <div className="fr-mt-4v fr-background-alt--blue-france fr-px-6v fr-py-4v fr-border-radius--8">
                  <div className="fr-mb-3v fr-text--sm">
                    Un tag d’équipe peut fusionner uniquement vers&nbsp;:
                  </div>
                  <div className="fr-flex fr-flex-gap-2v">
                    <TagScopeBadge scope={TagScope.Equipe} small />
                    <TagScopeBadge scope={TagScope.Departemental} small />
                    <TagScopeBadge scope={TagScope.National} small />
                  </div>
                </div>
              )}
            </Fragment>
          )}
        {step === 'confirmation' &&
          selectedDestinationTag &&
          id &&
          nom &&
          scope &&
          accompagnementsCount != null && (
            <div className="fr-flex fr-direction-column fr-flex-gap-4v">
              <Notice
                className="fr-notice--info fr-my-4v"
                title={
                  <span className="fr-text--regular fr-text-default--grey">
                    La fusion des tags est définitive.
                  </span>
                }
              />
              <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8">
                <TagItem
                  id={id}
                  nom={nom}
                  description={description ?? undefined}
                  scope={scope}
                  accompagnementsCount={accompagnementsCount}
                  equipeNumber={equipeNumber ?? undefined}
                  equipeCoordinateurNom={equipeCoordinateurNom ?? undefined}
                  small
                />
              </div>
              <span className="fr-flex fr-flex-gap-2v fr-align-items-center fr-justify-content-center">
                <span
                  className="ri-arrow-down-line ri-xl fr-text-label--blue-france fr-text--center"
                  aria-hidden
                />
                <Badge
                  severity="info"
                  noIcon
                  className="fr-text-label--blue-france"
                >
                  <span className="ri-service-line" aria-hidden />
                  &nbsp;
                  <span className="ri-add-line" aria-hidden />{' '}
                  {accompagnementsCount} accompagnement
                  {accompagnementsCount > 1 ? 's' : ''}
                </Badge>
              </span>
              <div className="fr-px-4v fr-py-6v fr-border fr-border-radius--8">
                <TagItem {...selectedDestinationTag} small />
              </div>
            </div>
          )}
      </MergeTagDynamicModal.Component>
    </form.AppForm>
  )
}

export default withTrpc(MergeTagModal)
