'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { createDynamicModal } from '@app/ui/components/Modal/createDynamicModal'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useRouter } from 'next/navigation'
import React, { ReactNode, useState } from 'react'
import { Equipe } from '../equipe'
import { TagScope } from '../tagScope'
import { saveTagModalVariants } from './saveTagModalVariants'
import {
  descriptionMaxLength,
  nomMaxLength,
  SaveTagValidation,
} from './saveTagValidation'

type Tag = {
  id: string
  nom: string
  description?: string | null
}

type SaveTagDynamicModalInitialState = {
  id?: string | null
  nom?: string | null
  description?: string | null
  scope?: TagScope | null
  equipeId?: string | null
  onTagSaved?: (tag: Tag) => void
}

export const SaveTagDynamicModal =
  createDynamicModal<SaveTagDynamicModalInitialState>({
    id: 'save-tag-modal',
    isOpenedByDefault: false,
    initialState: {
      id: null,
      nom: '',
      description: null,
      scope: null,
    },
  })

const nomInfo = (nom?: string | null) =>
  `${nom?.length ?? 0}/${nomMaxLength} caractères`

const descriptionInfo = (description?: string | null) =>
  `${description?.length ?? 0}/${descriptionMaxLength} caractères`

const tagScopeContents: Record<
  TagScope.Equipe | TagScope.Personnel | TagScope.Departemental,
  { label: string; hintText: string; illustration: ReactNode }
> = {
  [TagScope.Personnel]: {
    label: 'Tag personnel',
    hintText: 'Visible uniquement par vous.',
    illustration: (
      <span
        className="ri-account-circle-line ri-xl fr-line-height-1 fr-text-mention--grey fr-background-contrast--grey fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
  [TagScope.Equipe]: {
    label: "Tag d'équipe",
    hintText: 'Visible et éditable par les membres de cette équipe.',
    illustration: (
      <span
        className="ri-group-2-line ri-xl fr-line-height-1 fr-text-title--brown-caramel-sun-425 fr-background-alt--brown-caramel-950 fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
  [TagScope.Departemental]: {
    label: 'Tag départemental',
    hintText:
      "Visible par l'ensemble des médiateurs numériques du département.",
    illustration: (
      <span
        className="ri-map-pin-range-line ri-xl fr-line-height-1 fr-text-default--info fr-background-contrast--info fr-p-2w fr-my-2w fr-border-radius--8"
        aria-hidden="true"
      />
    ),
  },
}

const SaveTagModal = ({
  isMediateur,
  isCoordinateur,
  equipes,
}: {
  isMediateur: boolean
  isCoordinateur: boolean
  equipes: Equipe[]
}) => {
  const { id, nom, description, scope, equipeId, onTagSaved } =
    SaveTagDynamicModal.useState()

  const {
    title,
    content,
    selectVisibility,
    cancelButtonLabel,
    submitButtonLabel,
  } = saveTagModalVariants(isMediateur, isCoordinateur, id)
  const router = useRouter()
  const mutation = trpc.tags.save.useMutation()
  const isPending = mutation.isPending

  const encodeVisibilite = (s: TagScope, eId?: string | null) =>
    s === TagScope.Equipe && eId ? `equipe:${eId}` : s

  const decodeVisibilite = (value: string) => {
    if (value.startsWith('equipe:')) {
      return { scope: TagScope.Equipe, equipeId: value.replace('equipe:', '') }
    }
    return { scope: value as TagScope, equipeId: null }
  }

  const defaultVisibilite = encodeVisibilite(
    scope ?? TagScope.Personnel,
    equipeId,
  )

  const [visibilite, setVisibilite] = useState(defaultVisibilite)

  const handleVisibiliteChange = (value: string) => {
    setVisibilite(value)
    const { scope: newScope, equipeId: newEquipeId } = decodeVisibilite(value)
    form.setFieldValue('scope', newScope)
    form.setFieldValue('equipeId', newEquipeId)
  }

  const visibiliteOptions = [
    {
      label: tagScopeContents[TagScope.Personnel].label,
      value: TagScope.Personnel,
      extra: tagScopeContents[TagScope.Personnel],
    },
    ...equipes.map((equipe, index) => ({
      label:
        equipes.length === 1 ? (
          tagScopeContents[TagScope.Equipe].label
        ) : (
          <>
            {tagScopeContents[TagScope.Equipe].label} {index + 1}{' '}
            <span className="fr-text--sm fr-text-mention--grey">
              (Coordonnée par {equipe.nom})
            </span>
          </>
        ),
      value: `equipe:${equipe.id}`,
      extra: tagScopeContents[TagScope.Equipe],
    })),
    ...(isCoordinateur
      ? [
          {
            label: tagScopeContents[TagScope.Departemental].label,
            value: TagScope.Departemental,
            extra: tagScopeContents[TagScope.Departemental],
          },
        ]
      : []),
  ]

  const form = useAppForm({
    validators: {
      onChange: SaveTagValidation,
    },
    defaultValues: {
      id: id ?? null,
      nom: nom ?? '',
      description: (description ?? null) as string | null,
      scope: scope ?? TagScope.Personnel,
      equipeId: equipeId ?? null,
    },
    onSubmit: async (data) => {
      if (isPending) return

      try {
        await mutation.mutateAsync(data.value).then((tagSaved) => {
          SaveTagDynamicModal.close()
          form.reset()

          if (tagSaved != null) {
            createToast({
              priority: 'success',
              message: `Le tag ${tagSaved.nom} a bien été ${id ? 'modifié' : 'créé'}.`,
            })
            onTagSaved?.(tagSaved)
          }

          router.refresh()
        })
      } catch {
        createToast({
          priority: 'error',
          message: `Une erreur est survenue lors de la ${id ? 'modification' : 'création'} du tag.`,
        })
      }
    },
  })

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <SaveTagDynamicModal.Component
          title={title(nom)}
          buttons={[
            {
              children: cancelButtonLabel,
              priority: 'secondary',
              disabled: mutation.isPending,
              type: 'button',
              onClick: () => form.reset(),
            },
            {
              children: submitButtonLabel,
              type: 'submit',
              ...buttonLoadingClassname(mutation.isPending),
              doClosesModal: false,
            },
          ]}
        >
          {content && <p>{content}</p>}
          {scope === TagScope.Departemental && (
            <Notice
              className="fr-notice--flex fr-align-items-center fr-my-8v"
              title={
                <span className="fr-text-default--grey fr-text--regular">
                  Les modifications seront visibles par l’ensemble des
                  médiateurs numériques du département
                </span>
              }
            />
          )}
          <form.AppField name="nom">
            {(field) => (
              <field.Input
                label={
                  <>
                    Nom du tag <RedAsterisk />
                  </>
                }
                info={nomInfo(field.state.value)}
                isPending={isPending}
              />
            )}
          </form.AppField>
          {id == null
            ? selectVisibility?.(isMediateur, isCoordinateur) && (
                <>
                  <p className="fr-label fr-text--medium fr-mb-2v">
                    Sélectionnez la visibilité de ce tag&nbsp;:
                  </p>
                  <fieldset className="fr-fieldset">
                    <div className="fr-fieldset__content">
                      {visibiliteOptions.map((option) => (
                        <div
                          key={option.value}
                          className="fr-radio-group fr-radio-rich"
                        >
                          <input
                            type="radio"
                            id={`visibilite-${option.value}`}
                            name="visibilite"
                            value={option.value}
                            checked={visibilite === option.value}
                            onChange={() =>
                              handleVisibiliteChange(option.value)
                            }
                            disabled={isPending}
                            className="fr-border-radius--16"
                          />
                          <label
                            className="fr-label"
                            htmlFor={`visibilite-${option.value}`}
                          >
                            <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                              <span className="fr-flex-grow-1">
                                {option.label}
                                {option.extra.hintText && (
                                  <span className="fr-hint-text">
                                    {option.extra.hintText}
                                  </span>
                                )}
                              </span>
                              {option.extra.illustration}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                  {id &&
                    scope === TagScope.Departemental &&
                    visibilite === TagScope.Personnel && (
                      <Notice
                        className="fr-notice--warning fr-notice--flex fr-align-items-center fr-mb-8v"
                        title={
                          <span className="fr-text--regular fr-text-default--grey">
                            En passant la visibilité de ce tag de départemental
                            à personnel, Il ne sera plus visible par l'ensemble
                            des médiateurs numériques du département.
                          </span>
                        }
                      />
                    )}
                </>
              )
            : scope &&
              scope !== TagScope.National && (
                <div className="fr-px-4v fr-my-8v fr-border-radius--8 fr-border">
                  <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                    <span className="fr-flex-grow-1">
                      <span className="fr-text--bold">
                        {scope === TagScope.Equipe
                          ? equipes.length === 1
                            ? tagScopeContents[TagScope.Equipe].label
                            : `${tagScopeContents[TagScope.Equipe].label} (${equipes.find((e) => e.id === equipeId)?.nom ?? ''})`
                          : tagScopeContents[scope].label}
                      </span>
                      <span className="fr-hint-text">
                        {tagScopeContents[scope].hintText}
                      </span>
                    </span>
                    {tagScopeContents[scope].illustration}
                  </span>
                </div>
              )}
          <form.AppField name="description">
            {(field) => (
              <field.Input
                label="Description courte de votre tag"
                hintText="Ajoutez plus de contexte."
                info={descriptionInfo(field.state.value)}
                isPending={isPending}
                textArea
                nativeTextAreaProps={{ rows: 5 }}
              />
            )}
          </form.AppField>
        </SaveTagDynamicModal.Component>
      </form>
    </form.AppForm>
  )
}

export default withTrpc(SaveTagModal)
