import { Options } from '@app/ui/components/Primitives/Options'
import IconInSquare from '@app/web/components/IconInSquare'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import {
  BeneficiaireComboBox,
  BeneficiaireOptions,
} from '@app/web/features/beneficiaires/combo-box/BeneficiaireComboBox'
import { withForm } from '@app/web/libs/form/use-app-form'
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

const isBeneficiaire = (field: {
  state: { value?: { prenom?: string | null; nom?: string | null } | null }
}): field is { state: { value: { prenom: string; nom: string } } } =>
  field.state.value?.prenom != null && field.state.value?.nom != null

export const isAnonyme = (field: {
  state: { value?: { prenom?: string | null; nom?: string | null } | null }
}) => !isBeneficiaire(field)

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
              {isBeneficiaire(field) && (
                <p className="fr-text--sm fr-text--bold fr-mb-1v">
                  BÉNÉFICIAIRE DE L’ACCOMPAGNEMENT
                </p>
              )}
              {isAnonyme(field) && !isSearching && (
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
              {isAnonyme(field) && isSearching && (
                <>
                  <field.ComboBox
                    isPending={isPending}
                    defaultItems={initialBeneficiairesOptions.map((option) => ({
                      id: option.value?.id ?? '',
                      prenom: option.value?.prenom ?? '',
                      nom: option.value?.nom ?? '',
                    }))}
                    resetValue={{}}
                    {...BeneficiaireComboBox()}
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
                              title="Voir la liste des bénéficiaires"
                              className="fr-border-left-0"
                              iconId="fr-icon-search-line"
                              {...getToggleButtonProps({ type: 'button' })}
                            />
                          }
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
              {isBeneficiaire(field) && (
                <p className="fr-text--lg fr-text-title--blue-france fr-text--bold fr-mb-0">
                  {field.state.value.prenom} {field.state.value.nom}
                </p>
              )}
            </div>
            {isAnonyme(field) && !isSearching && (
              <Button
                type="button"
                priority="secondary"
                iconId="fr-icon-add-line"
                onClick={() => {
                  setIsSearching(true)
                }}
              >
                Lier&nbsp;à&nbsp;un&nbsp;bénéficiaire
              </Button>
            )}
            {(isBeneficiaire(field) || isSearching) && (
              <Button
                type="button"
                priority="tertiary no outline"
                iconId="fr-icon-close-line"
                iconPosition="right"
                onClick={() => {
                  setIsSearching(false)
                  isBeneficiaire(field) && field.setValue({})
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
