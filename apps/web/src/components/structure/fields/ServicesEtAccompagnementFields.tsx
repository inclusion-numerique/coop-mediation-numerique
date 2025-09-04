import CheckboxGroupFormField from '@app/ui/components/Form/CheckboxGroupFormField'
import MultipleSelectFormField from '@app/ui/components/Form/MultipleSelectFormField'
import { optionsWithEmptyValue } from '@app/ui/components/Form/utils/options'
import { modaliteAccompagnementOptions } from '@app/web/features/structures/modaliteAccompagnement'
import { ServicesEtAccompagnementData } from '@app/web/features/structures/ServicesEtAccompagnementValidation'
import { serviceOptions } from '@app/web/features/structures/service'
import Notice from '@codegouvfr/react-dsfr/Notice'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'

export const ServicesEtAccompagnementFields = <
  T extends Omit<ServicesEtAccompagnementData, 'id'>,
>({
  form,
  isServicesRequired = false,
}: {
  form: UseFormReturn<T>
  isServicesRequired?: boolean
}) => {
  const { control, formState } =
    form as unknown as UseFormReturn<ServicesEtAccompagnementData>

  return (
    <>
      <Notice
        className="fr-notice--warning fr-notice--flex fr-align-items-center fr-mb-6v "
        title={
          <span className="fr-text-default--grey fr-text--regular fr-text--sm">
            Il est obligatoire de renseigner les services d’inclusion numérique
            proposés afin d’être visible sur la cartographie.
          </span>
        }
      />
      <MultipleSelectFormField
        asterisk={isServicesRequired}
        path="services"
        options={optionsWithEmptyValue(serviceOptions)}
        label="Thématiques des services d’inclusion numérique"
        hint="Renseignez ici les services proposés dans ce lieu."
        control={control}
        disabled={formState.isSubmitting}
      />
      <CheckboxGroupFormField
        path="modalitesAccompagnement"
        options={modaliteAccompagnementOptions}
        label="Types d’accompagnements proposés"
        control={control}
        disabled={formState.isSubmitting}
        className="fr-mb-0"
      />
    </>
  )
}
