'use client'

import {
  SourcesField,
  updateSourcesParams,
} from '@app/web/components/filters/more-filters/SourceField'
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
import type { ActiviteSource } from '@app/web/features/activites/use-cases/source/activiteSource'
import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

const MoreFiltersModal = createModal({
  id: 'more-filters-modal',
  isOpenedByDefault: false,
})

export const MoreMediateurFilters = ({
  tagsOptions,
  defaultValues,
  hasCrasV1,
}: {
  tagsOptions: { id: string; nom: string; scope: TagScope }[]
  defaultValues: {
    thematiqueNonAdministratives: string[]
    thematiqueAdministratives: string[]
    tags: string[]
    source: ActiviteSource | undefined
  }
  hasCrasV1: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const activeFiltersCount =
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
      updateThematiqueAdministrativesParams(params)(data)
      updateThematiqueNonAdministrativesParams(params)(data)
      updateTagsParams(params)(data)
      updateSourcesParams(params)(data)
      dismissModal()
    },
  })

  const clearFilters = () => {
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
          {hasCrasV1 && (
            <>
              <SourcesField form={form as any} isPending={false} />
              <hr className="fr-separator-8v" />
            </>
          )}
          <h2 className="fr-h6">
            Filtrer par thématique de médiation numérique
          </h2>
          <ThematiqueNonAdministrativesFiled
            form={form as any}
            isPending={false}
          />
          <hr className="fr-separator-8v" />
          <h2 className="fr-h6">
            Filtrer par thématique de démarches administratives
          </h2>
          <ThematiqueAdministrativesFiled
            form={form as any}
            isPending={false}
          />
          {tagsOptions.length > 0 && (
            <>
              <hr className="fr-separator-8v" />
              <h2 className="fr-h6">Filtrer par tags</h2>
              <TagsField
                form={form as any}
                tagsOptions={tagsOptions}
                isPending={false}
              />
            </>
          )}
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
