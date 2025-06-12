import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { typeLieuOptionsWithExtras } from '@app/web/features/activites/use-cases/cra/fields/type-lieu'
import {
  CommuneComboBox,
  CommuneOptions,
} from '@app/web/features/adresse/combo-box/CommuneComboBox'
import {
  LieuActiviteComboBox,
  LieuActiviteOptions,
} from '@app/web/features/lieux-activite/combo-box/LieuActiviteComboBox'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { Options } from '@app/web/libs/ui/primitives/Options'
import { formOptions } from '@tanstack/react-form'
import { type CraIndividuelData } from '../../validation/CraIndividuelValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraIndividuelData> & {
    mediateurId: string
  },
})

export const RendezVousFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    dureeOptions: SelectOption[]
    lieuActiviteOptions: LieuActiviteOption[]
  },
  render: ({ form, isPending, dureeOptions, lieuActiviteOptions }) => (
    <>
      <div className="fr-flex fr-flex-gap-12v">
        <form.AppField name="date">
          {(field) => (
            <field.Input
              className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
              isPending={isPending}
              nativeInputProps={{ type: 'date' }}
              label={
                <>
                  Date de l’accompagnement <RedAsterisk />
                </>
              }
            />
          )}
        </form.AppField>
        <form.AppField name="duree.duree">
          {(field) => (
            <>
              <field.Select
                className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
                isPending={isPending}
                options={dureeOptions}
                placeholder="Sélectionnez une durée"
                label={
                  <>
                    Durée <RedAsterisk />
                  </>
                }
              />
              {field.state.value === 'personnaliser' && (
                <div className="fr-flex fr-flex-gap-4v">
                  <form.AppField name="duree.dureePersonnaliseeHeures">
                    {(field) => (
                      <div className="fr-flex-basis-0 fr-flex-grow-1">
                        <field.Input
                          isPending={isPending}
                          addon={
                            <span className="fr-badge fr-border fr-px-4v fr-border-left-0">
                              h
                            </span>
                          }
                          nativeInputProps={{
                            type: 'number',
                            value: 0,
                            min: 0,
                            max: 23,
                            step: 1,
                          }}
                          label=""
                        />
                      </div>
                    )}
                  </form.AppField>
                  <form.AppField name="duree.dureePersonnaliseeMinutes">
                    {(field) => (
                      <div className="fr-flex-basis-0 fr-flex-grow-1">
                        <field.Input
                          isPending={isPending}
                          addon={
                            <span className="fr-badge fr-border fr-border-left-0">
                              min
                            </span>
                          }
                          nativeInputProps={{
                            type: 'number',
                            value: 0,
                            min: 0,
                            max: 59,
                            step: 1,
                          }}
                          label=""
                        />
                      </div>
                    )}
                  </form.AppField>
                </div>
              )}
            </>
          )}
        </form.AppField>
      </div>
      <form.AppField name="typeLieu">
        {(field) => (
          <>
            <field.RadioButtons
              className="fr-flex-basis-0 fr-flex-grow-1"
              classes={{
                content: 'fr-display-grid fr-grid--4x1 fr-grid-gap-2v',
              }}
              isPending={isPending}
              options={typeLieuOptionsWithExtras}
              orientation="horizontal"
              legend={
                <>
                  Lieu d’accompagnement <RedAsterisk />
                </>
              }
            />
            {field.state.value === 'LieuActivite' && (
              <form.AppField name="structureId">
                {(field) => (
                  <field.ComboBox
                    isPending={isPending}
                    defaultItems={lieuActiviteOptions.map(
                      ({ value, extra }) => ({
                        id: value,
                        nom: extra?.nom ?? '',
                        adresse: extra?.adresse ?? '',
                      }),
                    )}
                    {...LieuActiviteComboBox}
                  >
                    {({ getLabelProps, getInputProps, ...options }) => (
                      <>
                        <field.Input
                          isConnected={false}
                          isPending={isPending}
                          nativeLabelProps={getLabelProps()}
                          nativeInputProps={{
                            ...getInputProps(),
                            placeholder: 'Rechercher un lieu d’activité',
                          }}
                          label=""
                        />
                        <Options
                          {...options}
                          {...LieuActiviteOptions}
                          showEmpty
                        />
                      </>
                    )}
                  </field.ComboBox>
                )}
              </form.AppField>
            )}
            {(field.state.value === 'Autre' ||
              field.state.value === 'Domicile') && (
              <form.AppField name="lieuCommuneData">
                {(field) => (
                  <field.ComboBox isPending={isPending} {...CommuneComboBox}>
                    {({ getLabelProps, getInputProps, ...options }) => (
                      <>
                        <field.Input
                          isConnected={false}
                          isPending={isPending}
                          nativeLabelProps={getLabelProps()}
                          nativeInputProps={{
                            ...getInputProps(),
                            placeholder:
                              'Rechercher une commune par son nom ou son code postal',
                          }}
                          label=""
                        />
                        <Options {...options} {...CommuneOptions} />
                      </>
                    )}
                  </field.ComboBox>
                )}
              </form.AppField>
            )}
          </>
        )}
      </form.AppField>
    </>
  ),
})
