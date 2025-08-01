import {
  thematiquesAdministrativesLabels,
  thematiquesNonAdministrativesLabels,
} from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import { Thematique } from '@prisma/client'
import classNames from 'classnames'

const MoreFiltersModal = createModal({
  id: 'more-filters-modal',
  isOpenedByDefault: false,
})

export const MoreFilters = () => {
  const form = useAppForm({
    validators: {},
    defaultValues: {
      thematiqueNonAdministratives: [] as string[],
      thematiqueAdministratives: [] as string[],
      tags: [] as string[],
    },
    onSubmit: () => {
      MoreFiltersModal.close()
    },
  })

  return (
    <>
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
          },
          {
            title: 'Appliquer le filtre',
            children: 'Appliquer le filtre',
            type: 'submit',
            priority: 'primary',
          },
        ]}
      >
        <form.AppForm>
          <form onSubmit={handleSubmit(form)}>
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
            <hr className="fr-separator-8v" />
            <form.AppField name="thematiqueAdministratives">
              {(field) => (
                <field.Checkbox
                  classes={{
                    content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-0',
                  }}
                  isPending={false}
                  isTiled={false}
                  legend="Filtrer par thématique de démarches adminsitratives"
                  options={Object.entries(thematiquesAdministrativesLabels).map(
                    ([value, label]) => ({ label, value }),
                  )}
                />
              )}
            </form.AppField>
            <hr className="fr-separator-8v" />
            <form.AppField name="tags">
              {(field) => (
                <field.Checkbox
                  isPending={false}
                  isTiled={false}
                  legend="Filtrer par tags"
                  options={Object.entries(thematiquesAdministrativesLabels).map(
                    ([value, label]) => {
                      const scope = TagScope.Personnel
                      return {
                        label: (
                          <span className="fr-flex fr-align-items-center fr-flex-gap-4v">
                            {label}
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
                        value,
                      }
                    },
                  )}
                />
              )}
            </form.AppField>
          </form>
        </form.AppForm>
      </MoreFiltersModal.Component>
      <Button
        className="fr-border-radius--4"
        priority="tertiary"
        iconId="fr-icon-equalizer-line"
        iconPosition="right"
        {...MoreFiltersModal.buttonProps}
      >
        Plus de filtres
      </Button>
    </>
  )
}
