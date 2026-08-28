'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import RequiredFieldsDisclaimer from '@app/ui/components/Form/RequiredFieldsDisclaimer'
import { optionsWithEmptyValue } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import {
  AdresseBanComboBox,
  AdresseBanOptions,
} from '@app/web/features/adresse/combo-box/AdresseBanComboBox'
import {
  typologieStructureLabels,
  typologieStructureOptions,
} from '@app/web/features/structures/typologieStructure'
import { withForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { creerLieuActiviteFormOptions } from '../creerLieuActiviteFormData'

/**
 * Identité du lieu à créer : ni SIRET ni RNA. On n'arrive sur ce formulaire
 * qu'après une recherche restée sans résultat — redemander une immatriculation
 * reviendrait à redemander ce qu'on vient de ne pas trouver.
 */
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
            className="fr-mt-6v fr-mb-6v"
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
              itemToString={(item: string) =>
                typologieStructureLabels[
                  item as keyof typeof typologieStructureLabels
                ] ?? item
              }
              itemToKey={(item: string) => item}
            />
          </>
        )}
      </form.AppField>
    </div>
  ),
})
