import InputFormField from '@app/ui/components/Form/InputFormField'
import RequiredFieldsDisclaimer from '@app/ui/components/Form/RequiredFieldsDisclaimer'
import AdresseBanFormField, {
  type AdressBanFormFieldOption,
} from '@app/web/components/form/AdresseBanFormField'
import { InformationsGeneralesData } from '@app/web/features/structures/InformationsGeneralesValidation'
import RnaInputInfo from '@app/web/features/structures/rna/RnaInputInfo'
import SiretInputInfo from '@app/web/features/structures/siret/SiretInputInfo'
import { UseFormReturn } from 'react-hook-form'

export const InformationsGeneralesFields = <
  T extends Omit<InformationsGeneralesData, 'id'>,
>({
  nom,
  form,
  className,
  initialAdresseBanOptions,
  adresseBanDefaultValue,
}: {
  nom?: string
  form: UseFormReturn<T>
  className?: string
  initialAdresseBanOptions?: AdressBanFormFieldOption[]
  adresseBanDefaultValue?: AdressBanFormFieldOption
}) => {
  const { control, formState } =
    form as unknown as UseFormReturn<InformationsGeneralesData>

  return (
    <div className={className}>
      <RequiredFieldsDisclaimer className="fr-mb-4v" />
      <InputFormField
        asterisk
        path="nom"
        label="Nom de la structure"
        control={control}
        disabled={formState.isSubmitting}
      />
      <AdresseBanFormField
        asterisk
        path="adresseBan"
        label="Adresse"
        placeholder="Rechercher l’adresse"
        control={control}
        disabled={formState.isSubmitting}
        defaultOptions={initialAdresseBanOptions}
        defaultValue={adresseBanDefaultValue}
      />
      <InputFormField
        path="complementAdresse"
        label="Complément d’adresse"
        control={control}
        disabled={formState.isSubmitting}
      />
      <InputFormField
        path="siret"
        label="SIRET structure (ou RNA)"
        control={control}
        disabled={formState.isSubmitting}
        className="fr-mb-0"
        info={
          <>
            <SiretInputInfo className="fr-mb-0" searchTerm={nom} />
            <RnaInputInfo />
          </>
        }
      />
    </div>
  )
}
