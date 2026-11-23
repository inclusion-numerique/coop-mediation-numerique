'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  SourcesField,
  updateSourcesParams,
} from '@/features/activites/ui/forms/filtres/SourceField'
import type { StructureEmployeuse } from '@/features/activites/ui/forms/filtres/StructureEmployeuseComboBox'
import {
  StructuresEmployeusesField,
  updateStructuresEmployeusesParams,
} from '@/features/activites/ui/forms/filtres/StructuresEmployeusesField'
import {
  TagsField,
  tagToArray,
  updateTagsParams,
} from '@/features/activites/ui/forms/filtres/TagsField'
import {
  ThematiqueAdministrativesFiled,
  updateThematiqueAdministrativesParams,
} from '@/features/activites/ui/forms/filtres/ThematiqueAdministrativesField'
import {
  ThematiqueNonAdministrativesFiled,
  updateThematiqueNonAdministrativesParams,
} from '@/features/activites/ui/forms/filtres/ThematiqueNonAdministrativesField'
import type { SourceDansLURL } from '@/features/activites/ui/labels/libelles/source-de-l-activite.labels'
import type { OptionDeTag } from '@/features/activites/ui/presenters/filtres/filtres-de-la-liste.search-params'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { plusDeFiltresFormOptions } from '../../forms/plus-de-filtres.form-options'

const MoreFiltersModal = createModal({
  id: 'more-filters-modal',
  isOpenedByDefault: false,
})

export const MoreMediateurFilters = ({
  tagsOptions,
  structuresEmployeusesOptions,
  defaultValues,
  hasCrasV1,
}: {
  tagsOptions: readonly OptionDeTag[]
  structuresEmployeusesOptions: StructureEmployeuse[]
  defaultValues: {
    structuresEmployeuses: string[]
    thematiqueNonAdministratives: string[]
    thematiqueAdministratives: string[]
    tags: string[]
    source: SourceDansLURL | undefined
  }
  hasCrasV1: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const activeFiltersCount =
    defaultValues.structuresEmployeuses.length +
    defaultValues.tags.length +
    defaultValues.thematiqueNonAdministratives.length +
    defaultValues.thematiqueAdministratives.length +
    (defaultValues.source ? 1 : 0)

  const dismissModal = () => {
    router.replace(`?${params}`, { scroll: false })
    MoreFiltersModal.close()
    form.reset()
  }

  const structuresToArray = (ids: string[]): StructureEmployeuse[] =>
    ids
      .map((id) => structuresEmployeusesOptions.find((s) => s.id === id))
      .filter((s): s is StructureEmployeuse => s !== undefined)

  const form = useAppForm({
    ...plusDeFiltresFormOptions,
    defaultValues: {
      ...defaultValues,
      structuresEmployeuses: structuresToArray(
        defaultValues.structuresEmployeuses,
      ),
      tags: tagToArray([...tagsOptions])(defaultValues.tags),
    },
    onSubmit: (data) => {
      updateStructuresEmployeusesParams(params)(data)
      updateThematiqueAdministrativesParams(params)(data)
      updateThematiqueNonAdministrativesParams(params)(data)
      updateTagsParams(params)(data)
      updateSourcesParams(params)(data)
      dismissModal()
    },
  })

  const clearFilters = () => {
    params.delete('structuresEmployeuses')
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
          title={null}
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
              title: 'Valider',
              children: 'Valider',
              type: 'submit',
              priority: 'primary',
              doClosesModal: false,
            },
          ]}
        >
          {hasCrasV1 && (
            <>
              <SourcesField form={form} isPending={false} />
              <hr className="fr-separator-8v" />
            </>
          )}
          {structuresEmployeusesOptions.length > 1 && (
            <>
              <StructuresEmployeusesField
                form={form}
                isPending={false}
                initialStructuresEmployeusesOptions={
                  structuresEmployeusesOptions
                }
              />
              <hr className="fr-separator-8v" />
            </>
          )}
          <h2 className="fr-h6">
            Filtrer par thématique de médiation numérique
          </h2>
          <ThematiqueNonAdministrativesFiled form={form} isPending={false} />
          <hr className="fr-separator-8v" />
          <h2 className="fr-h6">
            Filtrer par thématique de démarches administratives
          </h2>
          <ThematiqueAdministrativesFiled form={form} isPending={false} />
          {tagsOptions.length > 0 && (
            <>
              <hr className="fr-separator-8v" />
              <h2 className="fr-h6">Filtrer par tags</h2>
              <TagsField
                form={form}
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
