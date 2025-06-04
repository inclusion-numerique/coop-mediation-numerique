import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { Options } from '@app/ui/components/Primitives/Options'
import {
  Commune,
  CommuneComboBox,
  CommuneOptions,
} from '@app/web/features/adresse/combo-box/CommuneComboBox'
import { SyncWith } from '@app/web/libs/form/fields-components/SyncWith'
import { withForm } from '@app/web/libs/form/use-app-form'
import Button from '@codegouvfr/react-dsfr/Button'
import { Genre, StatutSocial, type TrancheAge } from '@prisma/client'
import { formOptions, useStore } from '@tanstack/react-form'
import type { DefaultValues } from 'react-hook-form'
import type { CraIndividuelData } from '../../validation/CraIndividuelValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraIndividuelData> & {
    mediateurId: string
  },
})

export const BeneficiaireAnonymeFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    genreOptions: SelectOption<Genre>[]
    trancheAgeOptions: SelectOption<TrancheAge>[]
    statutSocialOptions: SelectOption<StatutSocial>[]
  },
  render: ({
    form,
    isPending,
    genreOptions,
    trancheAgeOptions,
    statutSocialOptions,
  }) => {
    const lieuCommuneData = useStore(
      form.store,
      (state) => state.values.lieuCommuneData,
    )

    return (
      <>
        <h2 className="fr-h3 fr-mb-1v fr-text-title--blue-france">
          Informations optionnelles sur le bénéficiaire
        </h2>
        <p className="fr-text--xs fr-text-mention--grey fr-mb-12v">
          Vous pouvez renseigner des informations anonymes sur le bénéficiaire
          pour compléter vos statistiques.
        </p>
        <form.AppField name="beneficiaire.dejaAccompagne">
          {(field) => (
            <field.Checkbox
              className="fr-mb-8v"
              isPending={isPending}
              isTiled={false}
              options={[
                {
                  label: 'J’ai déjà accompagné ce bénéficiaire',
                  value: true,
                },
              ]}
            />
          )}
        </form.AppField>
        <form.AppField name="beneficiaire.communeResidence">
          {(field) => (
            <field.ComboBox isPending={isPending} {...CommuneComboBox}>
              {({
                getLabelProps,
                getInputProps,
                setInputValue,
                getToggleButtonProps,
                ...options
              }) => (
                <SyncWith
                  target={lieuCommuneData as Commune}
                  itemToKey={CommuneComboBox.itemToKey}
                  onUpdate={(commune: Commune) =>
                    setInputValue(CommuneComboBox.itemToString(commune))
                  }
                >
                  <div className="fr-mb-12v">
                    <field.Input
                      addonEnd={
                        <Button
                          title="Voir la liste des bénéficiaires"
                          className="fr-border-left-0"
                          iconId="fr-icon-search-line"
                          {...getToggleButtonProps({ type: 'button' })}
                        />
                      }
                      addinEnd={
                        field.state.value != null && (
                          <Button
                            title="Déselectionner le bénéficiaire"
                            type="button"
                            iconId="fr-icon-close-line"
                            priority="tertiary no outline"
                            onClick={() => {
                              field.setValue(null)
                              setInputValue('')
                            }}
                          />
                        )
                      }
                      isPending={isPending}
                      isConnected={false}
                      nativeLabelProps={getLabelProps()}
                      nativeInputProps={{
                        ...getInputProps(),
                        placeholder:
                          'Rechercher une commune par son nom ou son code postal',
                      }}
                      label="Commune de résidence du bénéficiaire"
                    />
                    <Options {...options} {...CommuneOptions} />
                  </div>
                </SyncWith>
              )}
            </field.ComboBox>
          )}
        </form.AppField>
        <form.AppField name="beneficiaire.genre">
          {(field) => (
            <field.RadioButtons
              className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-12v"
              classes={{
                content: 'fr-display-grid fr-grid--3x1 fr-grid-gap-2v',
              }}
              isPending={isPending}
              options={genreOptions}
              orientation="horizontal"
              legend="Genre"
            />
          )}
        </form.AppField>
        <div className="fr-flex fr-flex-gap-12v">
          <div className="fr-flex-basis-0 fr-flex-grow-1">
            <form.AppField name="beneficiaire.trancheAge">
              {(field) => (
                <field.RadioButtons
                  classes={{
                    content: 'fr-flex fr-direction-column fr-flex-gap-3v',
                  }}
                  isPending={isPending}
                  options={trancheAgeOptions}
                  legend="Tranche d’âge"
                />
              )}
            </form.AppField>
          </div>
          <div className="fr-flex-basis-0 fr-flex-grow-1">
            <form.AppField name="beneficiaire.statutSocial">
              {(field) => (
                <field.RadioButtons
                  classes={{
                    content: 'fr-flex fr-direction-column fr-flex-gap-3v',
                  }}
                  isPending={isPending}
                  options={statutSocialOptions}
                  legend="Statut du bénéficiaire"
                />
              )}
            </form.AppField>
          </div>
        </div>
      </>
    )
  },
})
