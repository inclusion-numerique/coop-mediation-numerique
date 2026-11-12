import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import { typeLieuOptionsWithExtras } from '@app/web/features/activites/ui/libelles/type-lieu'
import {
  CommuneComboBox,
  CommuneOptions,
} from '@app/web/features/activites/ui/saisie/commune/commune-combo-box'
import type { CommuneDuCra } from '@app/web/features/activites/ui/saisie/commune/commune-du-cra'
import {
  LieuComboBox,
  LieuOptions,
} from '@app/web/features/activites/ui/saisie/lieu/lieu-combo-box'
import {
  type LieuDuCra,
  lieuLePlusUtilise,
} from '@app/web/features/activites/ui/saisie/lieu/lieu-du-cra'
import {
  debutDispositifConum,
  derniereDateDuFormulaire,
} from '@app/web/features/activites/ui/saisie/validation/CraDateValidation'
import { CraData } from '@app/web/features/activites/ui/saisie/validation/CraValidation'
import {
  type DefaultValues,
  withFieldGroup,
} from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'

const valeursDuGroupe: Pick<
  DefaultValues<CraData>,
  'date' | 'duree' | 'typeLieu' | 'structure' | 'lieuCommuneData'
> = {}

const shouldResetLieuCommuneData = (value?: string) =>
  value != null && ['LieuActivite', 'ADistance'].includes(value)

const shouldResetStructure = (value?: string) =>
  value != null && ['Autre', 'Domicile', 'ADistance'].includes(value)

export const RendezVousFields = withFieldGroup({
  defaultValues: valeursDuGroupe,
  props: {} as {
    isPending: boolean
    dureeOptions: SelectOption[]
    lieuxProposes: readonly LieuDuCra[]
    onSelectLieuCommuneData?: (item: CommuneDuCra) => void
    onSelectTypeLieuDomicile?: () => void
  },
  render: ({
    group,
    isPending,
    dureeOptions,
    lieuxProposes,
    onSelectLieuCommuneData,
    onSelectTypeLieuDomicile,
  }) => {
    const resetDetailsFields = ({ value }: { value?: string }) => {
      if (shouldResetLieuCommuneData(value))
        group.setFieldValue('lieuCommuneData', null)
      if (shouldResetStructure(value))
        group.setFieldValue('structure', lieuLePlusUtilise(lieuxProposes))
      if (value === 'Domicile') onSelectTypeLieuDomicile?.()
    }

    return (
      <>
        <div className="fr-flex fr-direction-column fr-direction-md-row fr-flex-gap-0 fr-flex-gap-md-4v">
          <group.AppField name="date">
            {(field) => (
              <field.Input
                className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
                isPending={isPending}
                nativeInputProps={{
                  type: 'date',
                  min: debutDispositifConum,
                  max: derniereDateDuFormulaire(),
                }}
                classes={{ nativeInputOrTextArea: 'fr-input--tall' }}
                label={
                  <>
                    Date de l’accompagnement <RedAsterisk />
                  </>
                }
              />
            )}
          </group.AppField>
          <group.AppField name="duree.duree">
            {(field) => (
              <div className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v">
                <field.Select
                  isPending={isPending}
                  options={dureeOptions}
                  className="fr-input--tall"
                  placeholder="Sélectionnez une durée"
                  label={
                    <>
                      Durée <RedAsterisk />
                    </>
                  }
                />
                {field.state.value === 'personnaliser' && (
                  <div className="fr-flex fr-flex-gap-4v">
                    <group.AppField name="duree.dureePersonnaliseeHeures">
                      {(field) => (
                        <div className="fr-flex-basis-0 fr-flex-grow-1">
                          <field.Input
                            isPending={isPending}
                            addinEnd={
                              <span
                                className="fr-mr-4v"
                                style={{ lineHeight: '56px' }}
                              >
                                h
                              </span>
                            }
                            classes={{
                              nativeInputOrTextArea: 'fr-input--tall',
                            }}
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
                    </group.AppField>
                    <group.AppField name="duree.dureePersonnaliseeMinutes">
                      {(field) => (
                        <div className="fr-flex-basis-0 fr-flex-grow-1">
                          <field.Input
                            isPending={isPending}
                            addinEnd={
                              <span
                                className="fr-mr-2v"
                                style={{ lineHeight: '56px' }}
                              >
                                min
                              </span>
                            }
                            classes={{
                              nativeInputOrTextArea: 'fr-input--tall',
                            }}
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
                    </group.AppField>
                  </div>
                )}
              </div>
            )}
          </group.AppField>
        </div>
        <group.AppField
          name="typeLieu"
          listeners={{ onChange: resetDetailsFields }}
        >
          {(field) => (
            <>
              <field.RadioButtons
                className="fr-flex-basis-0 fr-flex-grow-1"
                classes={{
                  content:
                    'fr-display-grid fr-grid--2x1 fr-grid-md--4x1 fr-grid-gap-2v',
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
                <group.AppField name="structure">
                  {(field) => (
                    <field.ComboBox
                      isPending={isPending}
                      defaultItems={[...lieuxProposes]}
                      {...LieuComboBox}
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
                                className="fr-border-left-0 fr-py-7v fr-pl-4v"
                                style={{
                                  width: 56,
                                  maxWidth: 56,
                                  minWidth: 56,
                                }}
                                priority="tertiary"
                                iconId="fr-icon-arrow-down-s-line"
                                {...getToggleButtonProps({ type: 'button' })}
                              />
                            }
                            addinEnd={
                              field.state.value != null && (
                                <Button
                                  title="Déselectionner le lieu d’activité"
                                  type="button"
                                  iconId="fr-icon-close-circle-fill"
                                  className="fr-border-left-0 fr-py-7v fr-pl-4v"
                                  style={{
                                    width: 56,
                                    maxWidth: 56,
                                    minWidth: 56,
                                  }}
                                  priority="tertiary no outline"
                                  onClick={() => {
                                    field.setValue(null)
                                    options.setInputValue('')
                                  }}
                                />
                              )
                            }
                            classes={{
                              nativeInputOrTextArea: 'fr-input--tall',
                            }}
                            isConnected={false}
                            isPending={isPending}
                            nativeLabelProps={getLabelProps()}
                            nativeInputProps={{
                              ...getInputProps(),
                              placeholder: 'Rechercher un lieu d’activité',
                            }}
                            label=""
                          />
                          <Options {...options} {...LieuOptions} showEmpty />
                        </>
                      )}
                    </field.ComboBox>
                  )}
                </group.AppField>
              )}
              {(field.state.value === 'Autre' ||
                field.state.value === 'Domicile') && (
                <group.AppField name="lieuCommuneData">
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
                </group.AppField>
              )}
            </>
          )}
        </group.AppField>
      </>
    )
  },
})
