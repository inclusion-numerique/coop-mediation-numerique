'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { optionsWithEmptyValue } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import {
  AdresseBanComboBox,
  AdresseBanOptions,
} from '@app/web/features/adresse/combo-box/AdresseBanComboBox'
import {
  SiretSearchComboBox,
  SiretSearchOptions,
} from '@app/web/features/structures/siret/SiretSearchComboBox'
import { typologieStructureOptions } from '@app/web/features/structures/typologieStructure'
import { withForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import { useStore } from '@tanstack/react-form'
import { informationsGeneralesFormOptions } from './informationsGeneralesFormData'

export const InformationsGeneralesEditionFields = withForm({
  ...informationsGeneralesFormOptions,
  props: {} as {
    isPending: boolean
    hasActiveEmployees?: boolean
  },
  render: ({ form, isPending, hasActiveEmployees }) => {
    const noSiret = useStore(
      form.store,
      (state) => state.values.noSiret === true,
    )
    const siretSearch = useStore(
      form.store,
      (state) => state.values.siretSearch,
    )

    const protectedFieldsDisabled = hasActiveEmployees || isPending

    return (
      <div className="fr-mb-4w">
        {hasActiveEmployees && (
          <Notice
            className="fr-notice--flex fr-align-items-center fr-mb-4v"
            title={
              <span className="fr-text--sm fr-text--regular fr-text-default--grey">
                Cette structure emploie des médiateurs. Le nom, l'adresse et le
                SIRET ne peuvent pas être modifiés.
              </span>
            }
          />
        )}

        <form.AppField name="siretSearch">
          {(field) => (
            <field.ComboBox
              isPending={isPending}
              onSelect={(item) => form.setFieldValue('nom', item.nom)}
              {...SiretSearchComboBox}
            >
              {({
                getLabelProps,
                getInputProps,
                getToggleButtonProps,
                setInputValue,
                ...optionsProps
              }) => (
                <>
                  <field.Input
                    addonEnd={
                      <Button
                        title="Rechercher"
                        className="fr-border-left-0 fr-pl-3v"
                        style={{ width: 48, maxWidth: 48, minWidth: 48 }}
                        iconId="fr-icon-search-line"
                        disabled={protectedFieldsDisabled || noSiret}
                        {...getToggleButtonProps({ type: 'button' })}
                      />
                    }
                    addinEnd={
                      field.state.value != null &&
                      !protectedFieldsDisabled &&
                      !noSiret && (
                        <Button
                          title="Vider la recherche"
                          type="button"
                          iconId="fr-icon-close-line"
                          priority="tertiary no outline"
                          className="fr-border-top fr-border-bottom"
                          onClick={() => {
                            field.setValue(null)
                            setInputValue('')
                          }}
                        />
                      )
                    }
                    isConnected={false}
                    isPending={protectedFieldsDisabled || noSiret}
                    nativeLabelProps={getLabelProps()}
                    nativeInputProps={{
                      ...getInputProps(),
                      style: noSiret
                        ? { backgroundColor: 'var(--background-disabled-grey)' }
                        : undefined,
                    }}
                    label={
                      <>
                        Nom ou SIRET du lieu d’activité
                        {!noSiret && (
                          <>
                            {' '}
                            <RedAsterisk />
                          </>
                        )}
                      </>
                    }
                  />
                  <Options
                    className="fr-mt-n4v"
                    {...optionsProps}
                    {...SiretSearchOptions}
                  />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        {!hasActiveEmployees && (
          <>
            {' '}
            <form.AppField
              name="noSiret"
              listeners={{
                onChange: () => {
                  for (const field of [
                    'siretSearch',
                    'nom',
                    'adresseBan',
                  ] as const) {
                    form.setFieldMeta(field, (prev) => ({
                      ...prev,
                      errors: [],
                      errorMap: {},
                    }))
                  }
                },
              }}
            >
              {(field) => (
                <field.Checkbox
                  className="fr-mb-6v"
                  isPending={isPending}
                  isTiled={false}
                  options={[
                    {
                      label: 'Il n’y a pas de SIRET pour ce lieu',
                      value: true,
                    },
                  ]}
                />
              )}
            </form.AppField>
            <hr />
          </>
        )}

        <p className="fr-text--sm fr-text-mention--grey">
          Les champs avec <RedAsterisk /> sont obligatoires.
        </p>

        {noSiret ? (
          <form.AppField name="nom">
            {(field) => (
              <field.Input
                isPending={protectedFieldsDisabled}
                label={
                  <>
                    Nom du lieu d'activité <RedAsterisk />
                  </>
                }
              />
            )}
          </form.AppField>
        ) : (
          <form.AppField name="nomUsage">
            {(field) => (
              <field.Input
                isPending={isPending}
                label="Nom du lieu d'activité"
                hintText={
                  siretSearch
                    ? `${siretSearch.nom} (${siretSearch.siret})`
                    : undefined
                }
              />
            )}
          </form.AppField>
        )}

        {noSiret ? (
          <>
            <form.AppField name="adresseBan">
              {(field) => (
                <field.ComboBox
                  isPending={protectedFieldsDisabled}
                  {...AdresseBanComboBox}
                >
                  {({
                    getLabelProps,
                    getInputProps,
                    getToggleButtonProps,
                    setInputValue,
                    ...optionsProps
                  }) => (
                    <>
                      <field.Input
                        addonEnd={
                          <Button
                            title="Rechercher"
                            className="fr-border-left-0 fr-pl-3v"
                            style={{ width: 48, maxWidth: 48, minWidth: 48 }}
                            iconId="fr-icon-search-line"
                            disabled={protectedFieldsDisabled}
                            {...getToggleButtonProps({ type: 'button' })}
                          />
                        }
                        addinEnd={
                          field.state.value != null &&
                          !protectedFieldsDisabled && (
                            <Button
                              title="Vider l'adresse"
                              type="button"
                              iconId="fr-icon-close-line"
                              priority="tertiary no outline"
                              className="fr-border-top fr-border-bottom"
                              onClick={() => {
                                field.setValue(null)
                                setInputValue('')
                              }}
                            />
                          )
                        }
                        isConnected={false}
                        isPending={protectedFieldsDisabled}
                        nativeLabelProps={getLabelProps()}
                        nativeInputProps={{
                          ...getInputProps(),
                        }}
                        label={
                          <>
                            Adresse <RedAsterisk />
                          </>
                        }
                      />
                      <Options
                        className="fr-mt-n4v"
                        {...optionsProps}
                        {...AdresseBanOptions}
                      />
                    </>
                  )}
                </field.ComboBox>
              )}
            </form.AppField>

            <form.AppField name="lieuItinerant">
              {(field) => (
                <field.Checkbox
                  className="fr-mt-6v fr-mb-6v"
                  isPending={isPending}
                  isTiled={false}
                  options={[
                    {
                      label: "Lieu d'activité itinérant (exemple : bus)",
                      value: true,
                    },
                  ]}
                />
              )}
            </form.AppField>
          </>
        ) : (
          siretSearch && (
            <div className="fr-mb-4v">
              <span className="fr-text-mention--grey">Adresse</span>
              <div className="fr-text--medium">
                {siretSearch.adresse}, {siretSearch.codePostal}{' '}
                {siretSearch.commune}
              </div>
            </div>
          )
        )}

        <form.AppField name="complementAdresse">
          {(field) => (
            <field.Input isPending={isPending} label="Complément d'adresse" />
          )}
        </form.AppField>

        <form.AppField name="typologies">
          {(field) => (
            <>
              <field.MultiSelect
                isPending={isPending}
                label={
                  <>
                    Typologies de la structure <RedAsterisk />
                  </>
                }
                options={optionsWithEmptyValue(typologieStructureOptions)}
              />
              <field.SelectedItems
                itemToString={(item: string) =>
                  typologieStructureOptions.find((o) => o.value === item)
                    ?.label ?? item
                }
                itemToKey={(item: string) => item}
              />
            </>
          )}
        </form.AppField>
      </div>
    )
  },
})
