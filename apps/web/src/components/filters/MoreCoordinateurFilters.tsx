'use client'

import {
  RolesField,
  roleCount,
  updateRolesParams,
} from '@app/web/components/filters/more-filters/RolesField'
import {
  TagsField,
  tagToArray,
  updateTagsParams,
} from '@app/web/components/filters/more-filters/TagsField'
import {
  ThematiqueAdministrativesFiled,
  updateThematiqueAdministrativesParams,
} from '@app/web/components/filters/more-filters/ThematiqueAdministrativesField'
import {
  ThematiqueNonAdministrativesFiled,
  updateThematiqueNonAdministrativesParams,
} from '@app/web/components/filters/more-filters/ThematiqueNonAdministrativesField'
import {
  TypesField,
  updateTypesParams,
} from '@app/web/components/filters/more-filters/TypesField'
import type { TypeActiviteSlug } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { ActiviteSource } from '@app/web/features/activites/use-cases/source/activiteSource'
import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Accordion from '@codegouvfr/react-dsfr/Accordion'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { SourcesField, updateSourcesParams } from './more-filters/SourceField'

const MoreFiltersModal = createModal({
  id: 'more-filters-modal',
  isOpenedByDefault: false,
})

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
    source: ActiviteSource | undefined
  }
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const activeFiltersCount =
    roleCount(defaultValues) +
    defaultValues.tags.length +
    defaultValues.thematiqueNonAdministratives.length +
    defaultValues.thematiqueAdministratives.length +
    (defaultValues.source ? 1 : 0)

  const dismissModal = () => {
    router.replace(`?${params}`, { scroll: false })
    MoreFiltersModal.close()
    form.reset()
  }

  const form = useAppForm({
    defaultValues: {
      ...defaultValues,
      tags: tagToArray(tagsOptions)(defaultValues.tags),
    },
    onSubmit: (data) => {
      updateRolesParams(params)(data)
      updateTypesParams(params)(data)
      updateThematiqueAdministrativesParams(params)(data)
      updateThematiqueNonAdministrativesParams(params)(data)
      updateTagsParams(params)(data)
      updateSourcesParams(params)(data)
      dismissModal()
    },
  })

  const clearFilters = () => {
    params.delete('conseiller_numerique')
    params.delete('types')
    params.delete('thematiqueNonAdministratives')
    params.delete('thematiqueAdministratives')
    params.delete('tags')
    params.delete('source')
    dismissModal()
  }

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <MoreFiltersModal.Component
          title="Filtrer par"
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
          <RolesField form={form as any} isPending={false} />
          <hr className="fr-separator-8v" />
          <TypesField form={form as any} isPending={false} />
          <hr className="fr-separator-8v" />
          <SourcesField form={form as any} isPending={false} />
          <hr className="fr-separator-8v" />
          <h2 className="fr-h6">Filtrer par thématique et/ou tags&nbsp;:</h2>
          <div className="fr-accordions-group">
            <Accordion label="Thématiques de médiation numérique">
              <ThematiqueNonAdministrativesFiled
                form={form as any}
                isPending={false}
              />
            </Accordion>
            <Accordion label="Thématiques de démarches administratives">
              <ThematiqueAdministrativesFiled
                form={form as any}
                isPending={false}
              />
            </Accordion>
            {tagsOptions.length > 0 && (
              <Accordion label="Tags spécifiques">
                <TagsField
                  form={form as any}
                  tagsOptions={tagsOptions}
                  isPending={false}
                />
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
