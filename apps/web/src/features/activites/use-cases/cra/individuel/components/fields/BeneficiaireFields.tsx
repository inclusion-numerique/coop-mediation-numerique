import IconInSquare from '@app/web/components/IconInSquare'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import {
  BeneficiaireComboBox,
  BeneficiaireOptions,
} from '@app/web/features/beneficiaires/combo-box/BeneficiaireComboBox'
import { withForm } from '@app/web/libs/form/use-app-form'
import { Options } from '@app/web/libs/ui/primitives/Options'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import Button from '@codegouvfr/react-dsfr/Button'
import { formOptions } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { DefaultValues } from 'react-hook-form'
import type { CraIndividuelData } from '../../validation/CraIndividuelValidation'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraIndividuelData> & {
    mediateurId: string
  },
})

export const BeneficiaireFields = withForm({
  ...options,
  props: {} as {
    isPending: boolean
    creerBeneficiaireRetourUrl: string
    initialBeneficiairesOptions: BeneficiaireOption[]
  },
  render: ({
    form,
    isPending,
    creerBeneficiaireRetourUrl,
    initialBeneficiairesOptions,
  }) => {
    const router = useRouter()

    const [isSearching, setIsSearching] = useState<boolean>(false)

    const onCreer = () => {
      const creationUrl = `/coop/mes-beneficiaires/nouveau?retour=${encodeURIComponent(
        creerBeneficiaireRetourUrl,
      )}&cra=${encodeSerializableState(form.state.values)}`
      router.push(creationUrl)
    }

    return (
      <form.AppField name="beneficiaire">
        {(field) => (
          <div className="fr-background-alt--blue-france fr-px-8v fr-py-6v fr-border-radius--8 fr-my-12v fr-flex fr-flex-gap-8v fr-align-items-center">
            <IconInSquare
              iconId="fr-icon-user-heart-line"
              size="large"
              background="fr-background-default--grey"
            />
            <div className="fr-width-full">
              {field.state.value?.id != null && (
                <p className="fr-text--sm fr-text--bold fr-mb-1v">
                  BÉNÉFICIAIRE DE L’ACCOMPAGNEMENT
                </p>
              )}
              {field.state.value?.id == null && !isSearching && (
                <>
                  <p className="fr-text--bold fr-mb-1v">
                    Lier à un bénéficiaire
                  </p>
                  <p className="fr-text--sm fr-mb-0">
                    Si vous ne liez pas cette activité à un bénéficiaire, alors
                    il restera anonyme.
                  </p>
                </>
              )}
              {field.state.value?.id == null && isSearching && (
                <>
                  <field.ComboBox
                    isPending={isPending}
                    defaultItems={initialBeneficiairesOptions.map((option) => ({
                      id: option.value?.id ?? '',
                      prenom: option.value?.prenom ?? '',
                      nom: option.value?.nom ?? '',
                    }))}
                    defaultValue={{}}
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
                          label="Lier à un bénéficiaire"
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
                      onClick={onCreer}
                    >
                      Créer un bénéficiaire
                    </button>
                  </div>
                </>
              )}
              {field.state.value?.id != null && (
                <p className="fr-text--lg fr-text-title--blue-france fr-text--bold fr-mb-0">
                  {field.state.value.prenom} {field.state.value.nom}
                </p>
              )}
            </div>
            {field.state.value?.id == null && (
              <Button
                type="button"
                priority="secondary"
                iconId="fr-icon-add-line"
                onClick={() => {
                  field.setValue({})
                  setIsSearching(true)
                }}
              >
                Lier&nbsp;à&nbsp;un&nbsp;bénéficiaire
              </Button>
            )}
            {field.state.value?.id != null && (
              <Button
                type="button"
                priority="tertiary no outline"
                iconId="fr-icon-close-line"
                iconPosition="right"
                onClick={() => {
                  setIsSearching(false)
                  field.setValue({})
                }}
              >
                Annuler
              </Button>
            )}
          </div>
        )}
      </form.AppField>
    )
  },
})
