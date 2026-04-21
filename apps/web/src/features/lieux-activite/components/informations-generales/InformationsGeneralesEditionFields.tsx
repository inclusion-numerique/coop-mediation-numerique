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
    const nomOfficiel = useStore(form.store, (state) => state.values.nom)
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
                ...optionsProps
              }) => (
                <>
                  <field.Input
                    addonEnd={
                      <Button
                        title="Rechercher"
                        className="fr-border-left-0 fr-py-7v fr-pl-4v"
                        style={{ width: 56, maxWidth: 56, minWidth: 56 }}
                        iconId="fr-icon-search-line"
                        {...getToggleButtonProps({ type: 'button' })}
                      />
                    }
                    isConnected={false}
                    isPending={protectedFieldsDisabled || noSiret}
                    nativeLabelProps={getLabelProps()}
                    nativeInputProps={{
                      ...getInputProps(),
                      placeholder:
                        "Saisissez un nom d'entreprise ou un SIRET...",
                    }}
                    label={
                      <>
                        Rechercher par nom ou SIRET
                        {!noSiret && (
                          <>
                            {' '}
                            <RedAsterisk />
                          </>
                        )}
                      </>
                    }
                  />
                  <Options {...optionsProps} {...SiretSearchOptions} />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        <form.AppField name="noSiret">
          {(field) => (
            <field.Checkbox
              className="fr-mb-2v"
              isPending={protectedFieldsDisabled}
              isTiled={false}
              options={[
                {
                  label: "Il n'y a pas de SIRET de structure pour ce lieu",
                  value: true,
                },
              ]}
            />
          )}
        </form.AppField>

        <hr />

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
                    : nomOfficiel
                      ? nomOfficiel
                      : undefined
                }
              />
            )}
          </form.AppField>
        )}

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
                ...optionsProps
              }) => (
                <>
                  <field.Input
                    addonEnd={
                      <Button
                        title="Rechercher une adresse"
                        className="fr-border-left-0 fr-py-7v fr-pl-4v"
                        style={{ width: 56, maxWidth: 56, minWidth: 56 }}
                        iconId="fr-icon-search-line"
                        {...getToggleButtonProps({ type: 'button' })}
                      />
                    }
                    isConnected={false}
                    isPending={protectedFieldsDisabled}
                    nativeLabelProps={getLabelProps()}
                    nativeInputProps={{
                      ...getInputProps(),
                      placeholder: "Rechercher l'adresse",
                    }}
                    label={
                      <>
                        Adresse <RedAsterisk />
                      </>
                    }
                  />
                  <Options {...optionsProps} {...AdresseBanOptions} />
                </>
              )}
            </field.ComboBox>
          )}
        </form.AppField>

        <form.AppField name="lieuItinerant">
          {(field) => (
            <field.Checkbox
              className="fr-mt-6v fr-mb-2v"
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
