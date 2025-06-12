import type { SelectOption } from '@app/ui/components/Form/utils/options'
import {
  CommuneComboBox,
  CommuneOptions,
} from '@app/web/features/adresse/combo-box/CommuneComboBox'
import { withForm } from '@app/web/libs/form/use-app-form'
import { Options } from '@app/web/libs/ui/primitives/Options'
import { Genre, StatutSocial, type TrancheAge } from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import React from 'react'
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
              {({ getLabelProps, getInputProps, ...options }) => (
                <div className="fr-mb-12v">
                  <field.Input
                    isConnected={false}
                    isPending={isPending}
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
