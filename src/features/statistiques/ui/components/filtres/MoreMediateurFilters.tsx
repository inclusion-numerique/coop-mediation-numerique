'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ActiviteSource } from '@/features/statistiques/domain/filtres-des-activites'
import {
  SourcesField,
  updateSourcesParams,
} from '@/features/statistiques/ui/forms/filtres/SourceField'
import type { StructureEmployeuse } from '@/features/statistiques/ui/forms/filtres/StructureEmployeuseComboBox'
import {
  StructuresEmployeusesField,
  updateStructuresEmployeusesParams,
} from '@/features/statistiques/ui/forms/filtres/StructuresEmployeusesField'
import {
  TagsField,
  tagToArray,
  updateTagsParams,
} from '@/features/statistiques/ui/forms/filtres/TagsField'
import {
  ThematiqueAdministrativesFiled,
  updateThematiqueAdministrativesParams,
} from '@/features/statistiques/ui/forms/filtres/ThematiqueAdministrativesField'
import {
  ThematiqueNonAdministrativesFiled,
  updateThematiqueNonAdministrativesParams,
} from '@/features/statistiques/ui/forms/filtres/ThematiqueNonAdministrativesField'
import {
  plusDeFiltresFormOptions,
  type ValeursDePlusDeFiltres,
} from '@/features/statistiques/ui/forms/plus-de-filtres.form-options'
import type { VocabulaireDeLaBarre } from '@/features/statistiques/ui/labels/barre.labels'
import { TagScope } from '@/features/statistiques/ui/presenters/portee-de-tag'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { adresseAvec } from '@/libraries/parametres-d-url'

const MoreFiltersModal = createModal({
  id: 'more-filters-modal',
  isOpenedByDefault: false,
})

export const MoreMediateurFilters = ({
  tagsOptions,
  structuresEmployeusesOptions,
  defaultValues,
  vocabulaire,
  hasCrasV1,
}: {
  tagsOptions: { id: string; nom: string; scope: TagScope }[]
  structuresEmployeusesOptions: StructureEmployeuse[]
  vocabulaire: VocabulaireDeLaBarre
  defaultValues: {
    structuresEmployeuses: string[]
    thematiqueNonAdministratives: string[]
    thematiqueAdministratives: string[]
    tags: string[]
    source: ActiviteSource | undefined
  }
  hasCrasV1: boolean
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFiltersCount =
    defaultValues.structuresEmployeuses.length +
    defaultValues.tags.length +
    defaultValues.thematiqueNonAdministratives.length +
    defaultValues.thematiqueAdministratives.length +
    (defaultValues.source ? 1 : 0)

  const dismissModal = (
    parametres: Readonly<Record<string, string | null>>,
  ) => {
    router.replace(adresseAvec(`?${searchParams}`, parametres) || '?', {
      scroll: false,
    })
    MoreFiltersModal.close()
    form.reset()
  }

  const structuresToArray = (ids: string[]): StructureEmployeuse[] =>
    ids
      .map((id) => structuresEmployeusesOptions.find((s) => s.id === id))
      .filter((s): s is StructureEmployeuse => s !== undefined)

  const valeursInitiales: ValeursDePlusDeFiltres = {
    ...plusDeFiltresFormOptions.defaultValues,
    ...defaultValues,
    structuresEmployeuses: structuresToArray(
      defaultValues.structuresEmployeuses,
    ),
    tags: tagToArray(tagsOptions)(defaultValues.tags),
  }

  const form = useAppForm({
    ...plusDeFiltresFormOptions,
    defaultValues: valeursInitiales,
    onSubmit: (data) => {
      dismissModal({
        ...updateStructuresEmployeusesParams(data),
        ...updateThematiqueAdministrativesParams(data),
        ...updateThematiqueNonAdministrativesParams(data),
        ...updateTagsParams(data),
        ...updateSourcesParams(data),
      })
    },
  })

  const clearFilters = () =>
    dismissModal({
      structuresEmployeuses: null,
      thematiqueNonAdministratives: null,
      thematiqueAdministratives: null,
      tags: null,
      source: null,
    })

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
          <ThematiqueNonAdministrativesFiled
            form={form}
            isPending={false}
            mots={vocabulaire.thematiquesDeMediation}
          />
          <hr className="fr-separator-8v" />
          <h2 className="fr-h6">
            Filtrer par thématique de démarches administratives
          </h2>
          <ThematiqueAdministrativesFiled
            form={form}
            isPending={false}
            mots={vocabulaire.thematiquesAdministratives}
          />
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
