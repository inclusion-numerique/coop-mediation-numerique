import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import {
  type Commune,
  CommuneComboBox,
  CommuneOptions,
} from '@app/web/features/adresse/combo-box/CommuneComboBox'
import {
  LieuActiviteComboBox,
  LieuActiviteOptions,
} from '@app/web/features/lieux-activite/combo-box/LieuActiviteComboBox'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { type DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { formOptions } from '@tanstack/react-form'
import { typeLieuOptionsWithExtras } from '../../fields/type-lieu'
import { CraData } from '../../validation/CraValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraData>,
})

const shouldResetLieuCommuneData = (value?: string) =>
  value != null && ['LieuActivite', 'ADistance'].includes(value)

const shouldResetStructure = (value?: string) =>
  value != null && ['Autre', 'Domicile', 'ADistance'].includes(value)

const toLieuActiviteOption = ({
  value,
  extra,
}: {
  value: string
  extra?: { nom: string; adresse: string; mostUsed: boolean }
}) => ({
  id: value,
  nom: extra?.nom ?? '',
  adresse: extra?.adresse ?? '',
  mostUsed: extra?.mostUsed ?? false,
})

const mostUsedOption = ({ mostUsed }: { mostUsed: boolean }) => mostUsed

export const RendezVousFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    dureeOptions: SelectOption[]
    lieuActiviteOptions: LieuActiviteOption[]
    onSelectLieuCommuneData?: (item: Commune) => void
  },
  render: ({
    form,
    isPending,
    dureeOptions,
    lieuActiviteOptions,
    onSelectLieuCommuneData,
  }) => {
    const resetDetailsFields = ({ value }: { value?: string }) => {
      if (shouldResetLieuCommuneData(value))
        form.setFieldValue('lieuCommuneData', null)
      if (shouldResetStructure(value))
        form.setFieldValue(
          'structure',
          lieuActiviteOptions.map(toLieuActiviteOption).find(mostUsedOption),
        )
    }

    return (
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
              <div className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v">
                <field.Select
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
                    <form.AppField
                      name="duree.dureePersonnaliseeHeures"
                      defaultValue={0}
                    >
                      {(field) => (
                        <div className="fr-flex-basis-0 fr-flex-grow-1">
                          <field.Input
                            isPending={isPending}
                            addinEnd={
                              <span className="fr-mr-4v fr-line-height-2">
                                h
                              </span>
                            }
                            nativeInputProps={{
                              type: 'number',
                              min: 0,
                              max: 23,
                              step: 1,
                            }}
                            label=""
                          />
                        </div>
                      )}
                    </form.AppField>
                    <form.AppField
                      name="duree.dureePersonnaliseeMinutes"
                      defaultValue={0}
                    >
                      {(field) => (
                        <div className="fr-flex-basis-0 fr-flex-grow-1">
                          <field.Input
                            isPending={isPending}
                            addinEnd={
                              <span className="fr-mr-2v fr-line-height-2">
                                min
                              </span>
                            }
                            nativeInputProps={{
                              type: 'number',
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
              </div>
            )}
          </form.AppField>
        </div>
        <form.AppField
          name="typeLieu"
          listeners={{ onChange: resetDetailsFields }}
        >
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
                    Lieu de l’accompagnement <RedAsterisk />
                  </>
                }
              />
              {field.state.value === 'LieuActivite' && (
                <form.AppField name="structure">
                  {(field) => (
                    <field.ComboBox
                      isPending={isPending}
                      defaultItems={lieuActiviteOptions.map(
                        toLieuActiviteOption,
                      )}
                      {...LieuActiviteComboBox}
                    >
                      {({
                        getLabelProps,
                        getInputProps,
                        getToggleButtonProps,
                        ...options
                      }) => (
                        <>
                          <field.Input
                            addonEnd={
                              <Button
                                title="Voir la liste des lieux d’activité"
                                className="fr-border-left-0"
                                iconId="fr-icon-search-line"
                                {...getToggleButtonProps({ type: 'button' })}
                              />
                            }
                            addinEnd={
                              field.state.value != null && (
                                <Button
                                  title="Déselectionner le lieu d’activité"
                                  type="button"
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
                    <field.ComboBox
                      isPending={isPending}
                      {...CommuneComboBox}
                      onSelect={onSelectLieuCommuneData}
                    >
                      {({
                        getLabelProps,
                        getInputProps,
                        getToggleButtonProps,
                        ...options
                      }) => (
                        <>
                          <field.Input
                            addonEnd={
                              <Button
                                title="Voir la liste des communes"
                                className="fr-border-left-0"
                                iconId="fr-icon-search-line"
                                {...getToggleButtonProps({ type: 'button' })}
                              />
                            }
                            addinEnd={
                              field.state.value != null && (
                                <Button
                                  title="Déselectionner la commune"
                                  type="button"
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
    )
  },
})
