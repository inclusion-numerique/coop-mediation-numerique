'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { typologieStructureOptions } from '@/features/lieux-activite/ui/labels/options-du-lieu.labels'
import { libelleDeTypologie } from '@/features/lieux-activite/ui/labels/typologie.labels'
import {
  AdresseBanComboBox,
  AdresseBanOptions,
} from '@/libraries/adresse/AdresseBanComboBox'
import { withForm } from '@/libraries/formulaire/use-app-form'
import RedAsterisk from '@/libraries/ui/components/form/RedAsterisk'
import RequiredFieldsDisclaimer from '@/libraries/ui/components/form/RequiredFieldsDisclaimer'
import { optionsWithEmptyValue } from '@/libraries/ui/components/form/utils/options'
import { Options } from '@/libraries/ui/components/primitives/Options'
import { creerLieuActiviteFormOptions } from '../creer-lieu-activite.form-options'

export const InformationsGeneralesFields = withForm({
  ...creerLieuActiviteFormOptions,
  props: {} as { isPending: boolean; className?: string },
  render: ({ form, isPending, className }) => (
    <div className={className}>
      <RequiredFieldsDisclaimer className="fr-mb-4v" />

      <form.AppField name="nom">
        {(field) => (
          <field.Input
            isPending={isPending}
            label={
              <>
                Nom du lieu d’activité <RedAsterisk />
              </>
            }
          />
        )}
      </form.AppField>

      <form.AppField name="adresseBan">
        {(field) => (
          <field.ComboBox isPending={isPending} {...AdresseBanComboBox}>
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
                      className="fr-border-left-0"
                      iconId="fr-icon-search-line"
                      disabled={isPending}
                      {...getToggleButtonProps({ type: 'button' })}
                    />
                  }
                  addinEnd={
                    field.state.value != null &&
                    !isPending && (
                      <Button
                        title="Vider l’adresse"
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
                  isPending={isPending}
                  nativeLabelProps={getLabelProps()}
                  nativeInputProps={{
                    ...getInputProps(),
                    placeholder: 'Rechercher l’adresse',
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
            className="fr-mt-8v fr-mb-6v"
            isPending={isPending}
            isTiled={false}
            options={[
              {
                label: 'Lieu d’activité itinérant (exemple : bus)',
                value: true,
              },
            ]}
          />
        )}
      </form.AppField>

      <form.AppField name="complementAdresse">
        {(field) => (
          <field.Input isPending={isPending} label="Complément d’adresse" />
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
              itemToString={libelleDeTypologie}
              itemToKey={(item: string) => item}
            />
          </>
        )}
      </form.AppField>
    </div>
  ),
})
