'use client'

import Accordion from '@codegouvfr/react-dsfr/Accordion'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import { ActiviteSource } from '@/features/statistiques/domain/filtres-des-activites'
import {
  RolesField,
  roleCount,
} from '@/features/statistiques/ui/forms/filtres/RolesField'
import { SourcesField } from '@/features/statistiques/ui/forms/filtres/SourceField'
import type { StructureEmployeuse } from '@/features/statistiques/ui/forms/filtres/StructureEmployeuseComboBox'
import { StructuresEmployeusesField } from '@/features/statistiques/ui/forms/filtres/StructuresEmployeusesField'
import {
  TagsField,
  tagToArray,
} from '@/features/statistiques/ui/forms/filtres/TagsField'
import { ThematiqueAdministrativesFiled } from '@/features/statistiques/ui/forms/filtres/ThematiqueAdministrativesField'
import { ThematiqueNonAdministrativesFiled } from '@/features/statistiques/ui/forms/filtres/ThematiqueNonAdministrativesField'
import { TypesField } from '@/features/statistiques/ui/forms/filtres/TypesField'
import {
  plusDeFiltresFormOptions,
  type ValeursDePlusDeFiltres,
} from '@/features/statistiques/ui/forms/plus-de-filtres.form-options'
import type { VocabulaireDeLaBarre } from '@/features/statistiques/ui/labels/barre.labels'
import { TagScope } from '@/features/statistiques/ui/labels/portee-de-tag.labels'
import {
  type CleDePlusDeFiltres,
  plusDeFiltresEnParametres,
  sansPlusDeFiltres,
} from '@/features/statistiques/ui/search-params/filtres-de-la-barre.search-params'
import { handleSubmit } from '@/libraries/formulaire/handle-submit'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { requeteAvec } from '@/libraries/parametres-d-url'

const CLES: readonly CleDePlusDeFiltres[] = [
  'conseiller_numerique',
  'structuresEmployeuses',
  'types',
  'thematiqueNonAdministratives',
  'thematiqueAdministratives',
  'tags',
  'source',
]

const MoreFiltersModal = createModal({
  id: 'more-filters-modal',
  isOpenedByDefault: false,
})

export const MoreCoordinateurFilters = ({
  tagsOptions,
  structuresEmployeusesOptions,
  defaultValues,
  vocabulaire,
}: {
  tagsOptions: { id: string; nom: string; scope: TagScope }[]
  structuresEmployeusesOptions: StructureEmployeuse[]
  vocabulaire: VocabulaireDeLaBarre
  defaultValues: {
    conseiller_numerique: '0' | '1' | undefined
    structuresEmployeuses: string[]
    types: string[]
    thematiqueNonAdministratives: string[]
    thematiqueAdministratives: string[]
    tags: string[]
    source: ActiviteSource | undefined
  }
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFiltersCount =
    roleCount(defaultValues) +
    defaultValues.structuresEmployeuses.length +
    defaultValues.tags.length +
    defaultValues.thematiqueNonAdministratives.length +
    defaultValues.thematiqueAdministratives.length +
    (defaultValues.source ? 1 : 0)

  const dismissModal = (
    parametres: Readonly<Record<string, string | null>>,
  ) => {
    router.replace(requeteAvec(searchParams, parametres), { scroll: false })
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
    conseiller_numerique: defaultValues.conseiller_numerique ?? '',
    structuresEmployeuses: structuresToArray(
      defaultValues.structuresEmployeuses,
    ),
    tags: tagToArray(tagsOptions)(defaultValues.tags),
  }

  const form = useAppForm({
    ...plusDeFiltresFormOptions,
    defaultValues: valeursInitiales,
    onSubmit: (data) => {
      dismissModal(plusDeFiltresEnParametres(data.value, CLES))
    },
  })

  const clearFilters = () => dismissModal(sansPlusDeFiltres(CLES))

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
          <SourcesField form={form} isPending={false} />
          <hr className="fr-separator-8v" />
          <RolesField form={form} isPending={false} />
          <hr className="fr-separator-8v" />
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
          <TypesField
            form={form}
            isPending={false}
            mots={vocabulaire.typesDActivite}
          />
          <hr className="fr-separator-8v" />
          <h2 className="fr-h6">Filtrer par thématique et/ou tags&nbsp;:</h2>
          <div className="fr-accordions-group">
            <Accordion label="Thématiques de médiation numérique">
              <ThematiqueNonAdministrativesFiled
                form={form}
                isPending={false}
                mots={vocabulaire.thematiquesDeMediation}
              />
            </Accordion>
            <Accordion label="Thématiques de démarches administratives">
              <ThematiqueAdministrativesFiled
                form={form}
                isPending={false}
                mots={vocabulaire.thematiquesAdministratives}
              />
            </Accordion>
            {tagsOptions.length > 0 && (
              <Accordion label="Tags spécifiques">
                <TagsField
                  form={form}
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
