import { Options } from '@app/ui/components/Primitives/Options'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import IconInSquare from '@app/web/components/IconInSquare'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import {
  BeneficiaireComboBox,
  BeneficiaireOptions,
  BeneficiaireSelectedItems,
} from '@app/web/features/beneficiaires/combo-box/BeneficiaireComboBox'
import { DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { formOptions, useStore } from '@tanstack/react-form'
import { CraCollectifData } from '../../../collectif/validation/CraCollectifValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraCollectifData>,
})

export const BeneficiairesAtelierFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    initialBeneficiairesOptions: BeneficiaireOption[]
  },
  render: ({ form, isPending, initialBeneficiairesOptions }) => {
    const participants =
      useStore(form.store, (state) => state.values.participants) ?? []

    return (
      <div className="fr-my-12v fr-border fr-border-radius--8 fr-width-full">
        <form.AppField name="participants">
          {(field) => (
            <>
              <div className="fr-background-alt--blue-france fr-px-8v fr-py-6v fr-border-radius-top--8 fr-flex fr-flex-gap-8v fr-align-items-center">
                <IconInSquare
                  iconId="fr-icon-user-heart-line"
                  size="large"
                  background="fr-background-default--grey"
                />
                <div className="fr-flex-grow-1">
                  <field.ComboBox
                    isPending={isPending}
                    defaultItems={initialBeneficiairesOptions.map((option) => ({
                      id: option.value?.id ?? '',
                      prenom: option.value?.prenom ?? '',
                      nom: option.value?.nom ?? '',
                    }))}
                    {...BeneficiaireComboBox}
                  >
                    {({ getLabelProps, getInputProps, ...options }) => (
                      <>
                        <field.Input
                          isConnected={false}
                          isPending={isPending}
                          nativeLabelProps={getLabelProps()}
                          nativeInputProps={{
                            ...getInputProps(),
                            placeholder:
                              'Rechercher parmi vos bénéficiaires enregistrés',
                          }}
                          label={
                            <>
                              Bénéficiaire{sPluriel(participants.length)} suivi
                              {sPluriel(participants.length)} ·{' '}
                              {participants.length}
                            </>
                          }
                        />
                        <Options {...options} {...BeneficiaireOptions} />
                      </>
                    )}
                  </field.ComboBox>
                  <div>
                    Ou{' '}
                    <button
                      type="button"
                      className="fr-px-1v fr-link fr-text--medium"
                    >
                      Créer un bénéficiaire
                    </button>
                  </div>
                </div>
              </div>
              {(field.state.value?.length ?? 0) > 0 && (
                <>
                  <field.SelectedItems
                    className="fr-px-8v fr-pt-6v fr-pb-8v fr-flex fr-flex-gap-2v fr-flex-wrap"
                    {...BeneficiaireSelectedItems}
                  />
                  <hr className="fr-separator-1px" />
                </>
              )}
            </>
          )}
        </form.AppField>
        {/*{suivisCount > 0 && (*/}

        {/*)}*/}
        <div className="fr-p-8v">todo: Bénéficiaires anonymes</div>
        <hr className="fr-separator-1px" />
        <div className="fr-p-8v fr-flex fr-justify-content-space-between fr-align-items-center">
          <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
            {participants.length} Bénéficiaire{sPluriel(participants.length)}{' '}
            suivi
            {sPluriel(participants.length)}&nbsp;·&nbsp;{0} Bénéficiaire
            {sPluriel(0)} anonyme{sPluriel(0)}
          </p>
          <p className="fr-text--lg fr-text--bold fr-mb-0">
            <span className="fr-icon-group-line fr-mr-1w" />
            Total des participants&nbsp;:{' '}
            <span className="fr-text-title--blue-france">
              {participants.length}
            </span>
          </p>
        </div>
      </div>
    )
  },
})
