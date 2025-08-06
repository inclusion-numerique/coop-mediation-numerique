'use client'

import {
  thematiquesAdministrativesLabels,
  thematiquesNonAdministrativesLabels,
} from '@app/web/features/activites/use-cases/cra/fields/thematique'
import {
  TypeActiviteSlug,
  typeActiviteSlugOptions,
} from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Accordion from '@codegouvfr/react-dsfr/Accordion'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { Thematique } from '@prisma/client'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

const MoreFiltersModal = createModal({
  id: 'more-filters-modal',
  isOpenedByDefault: false,
})

const conseillerNumeriqueOptions = [
  { label: 'Tous les rôles', value: '' },
  { label: 'Conseillers numériques', value: '1' },
  { label: 'Médiateurs numériques', value: '0' },
]

export const MoreCoordinateurFilters = ({
  tagsOptions,
  defaultValues,
}: {
  tagsOptions: { id: string; nom: string; scope: TagScope }[]
  defaultValues: {
    conseiller_numerique: '0' | '1' | undefined
    types: TypeActiviteSlug[]
    thematiqueNonAdministratives: string[]
    thematiqueAdministratives: string[]
    tags: string[]
  }
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const activeFiltersCount =
    (defaultValues.conseiller_numerique === '0' ||
    defaultValues.conseiller_numerique === '1'
      ? 1
      : 0) +
    defaultValues.tags.length +
    defaultValues.thematiqueNonAdministratives.length +
    defaultValues.thematiqueAdministratives.length

  const form = useAppForm({
    defaultValues: {
      ...defaultValues,
      tags:
        defaultValues.tags.length === 1 && tagsOptions.length === 1
          ? defaultValues.tags.at(0)
          : defaultValues.tags,
    },
    onSubmit: (data) => {
      data.value.conseiller_numerique !== '0' &&
      data.value.conseiller_numerique !== '1'
        ? params.delete('conseiller_numerique')
        : params.set('conseiller_numerique', data.value.conseiller_numerique)

      data.value.types.length > 0
        ? params.set('types', data.value.types.join(','))
        : params.delete('types')

      data.value.thematiqueNonAdministratives.length > 0
        ? params.set(
            'thematiqueNonAdministratives',
            data.value.thematiqueNonAdministratives.join(','),
          )
        : params.delete('thematiqueNonAdministratives')

      data.value.thematiqueAdministratives.length > 0
        ? params.set(
            'thematiqueAdministratives',
            data.value.thematiqueAdministratives.join(','),
          )
        : params.delete('thematiqueAdministratives')

      const tags: string[] =
        (data.value.tags == null || Array.isArray(data.value.tags)
          ? data.value.tags
          : [data.value.tags]) ?? []

      tags.length > 0
        ? params.set('tags', tags.join(','))
        : params.delete('tags')

      router.replace(`?${params}`, { scroll: false })

      MoreFiltersModal.close()
      form.reset()
    },
  })

  const clearFilters = () => {
    form.reset()
    params.delete('conseiller_numerique')
    params.delete('thematiqueNonAdministratives')
    params.delete('thematiqueAdministratives')
    params.delete('tags')
    router.replace(`?${params}`, { scroll: false })
    MoreFiltersModal.close()
  }

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <MoreFiltersModal.Component
          title="Plus de filtres"
          size="large"
          buttons={[
            {
              title: 'Effacer tout',
              priority: 'secondary',
              doClosesModal: true,
              children: 'Effacer tout',
              type: 'button',
              onClick: clearFilters,
            },
            {
              title: 'Appliquer le filtre',
              children: 'Appliquer le filtre',
              type: 'submit',
              priority: 'primary',
              doClosesModal: false,
            },
          ]}
        >
          <form.AppField name="conseiller_numerique">
            {(field) => (
              <field.RadioButtons
                isPending={false}
                isTiled={false}
                legend={
                  <h2 className="fr-h6 fr-mb-0">Filtrer par rôle&nbsp;:</h2>
                }
                options={conseillerNumeriqueOptions}
              />
            )}
          </form.AppField>
          <hr className="fr-separator-8v" />
          <form.AppField name="types">
            {(field) => (
              <field.Checkbox
                isPending={false}
                isTiled={false}
                legend={
                  <h2 className="fr-h6 fr-mb-0">
                    Filtrer par type d’activité&nbsp;:
                  </h2>
                }
                options={typeActiviteSlugOptions}
              />
            )}
          </form.AppField>
          <hr className="fr-separator-8v" />
          <h2 className="fr-h6">Filtrer par thématique et/ou tags&nbsp;:</h2>
          <div className="fr-accordions-group">
            <Accordion label="Thématiques de médiation numérique">
              <form.AppField name="thematiqueNonAdministratives">
                {(field) => (
                  <field.Checkbox
                    classes={{
                      content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-0',
                    }}
                    isPending={false}
                    isTiled={false}
                    legend="Filtrer par thématique de médiation numérique"
                    options={Object.entries(thematiquesNonAdministrativesLabels)
                      .map(([value, label]) => ({ label, value }))
                      .filter(
                        ({ value }) =>
                          value !== Thematique.AideAuxDemarchesAdministratives,
                      )}
                  />
                )}
              </form.AppField>
            </Accordion>
            <Accordion label="Thématiques de démarches administratives">
              <form.AppField name="thematiqueAdministratives">
                {(field) => (
                  <field.Checkbox
                    classes={{
                      content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-0',
                    }}
                    isPending={false}
                    isTiled={false}
                    legend="Filtrer par thématique de démarches adminsitratives"
                    options={Object.entries(
                      thematiquesAdministrativesLabels,
                    ).map(([value, label]) => ({ label, value }))}
                  />
                )}
              </form.AppField>
            </Accordion>
            {tagsOptions.length > 0 && (
              <Accordion label="Tags spécifiques">
                <form.AppField name="tags">
                  {(field) => (
                    <field.Checkbox
                      isPending={false}
                      isTiled={false}
                      legend="Filtrer par tags"
                      options={tagsOptions.map(({ id, nom, scope }) => {
                        return {
                          label: (
                            <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                              {nom}
                              <Badge
                                className={classNames(
                                  'fr-text--nowrap',
                                  scope === TagScope.Personnel
                                    ? 'fr-text-mention--grey'
                                    : undefined,
                                )}
                                severity={
                                  scope === TagScope.Personnel
                                    ? undefined
                                    : 'info'
                                }
                                noIcon
                              >
                                Tag {scope}
                              </Badge>
                            </span>
                          ),
                          value: id,
                        }
                      })}
                    />
                  )}
                </form.AppField>
              </Accordion>
            )}
          </div>
        </MoreFiltersModal.Component>
        <Button
          type="button"
          className={classNames(
            'fr-border-radius--4',
            activeFiltersCount > 0 && 'fr-background-alt--blue-france',
          )}
          priority={activeFiltersCount === 0 ? 'tertiary' : 'secondary'}
          iconId="fr-icon-equalizer-line"
          iconPosition="right"
          {...MoreFiltersModal.buttonProps}
        >
          Plus de filtres{activeFiltersCount > 0 && ` · ${activeFiltersCount}`}
        </Button>
      </form>
    </form.AppForm>
  )
}
