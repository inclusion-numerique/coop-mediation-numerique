import CheckboxFormField from '@app/ui/components/Form/CheckboxFormField'
import InputFormField from '@app/ui/components/Form/InputFormField'
import MultipleSelectFormField from '@app/ui/components/Form/MultipleSelectFormField'
import RequiredFieldsDisclaimer from '@app/ui/components/Form/RequiredFieldsDisclaimer'
import { optionsWithEmptyValue } from '@app/ui/components/Form/utils/options'
import AdresseBanFormField, {
  type AdressBanFormFieldOption,
} from '@app/web/components/form/AdresseBanFormField'
import { InformationsGeneralesData } from '@app/web/features/structures/InformationsGeneralesValidation'
import RnaInputInfo from '@app/web/features/structures/rna/RnaInputInfo'
import SiretInputInfo from '@app/web/features/structures/siret/SiretInputInfo'
import { typologieStructureOptions } from '@app/web/features/structures/typologieStructure'
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
      <CheckboxFormField
        className="fr-mt-6v fr-mb-2v"
        path="lieuItinerant"
        label="Lieu d’activité itinérant (exemple : bus)"
        control={control}
        disabled={formState.isSubmitting}
      />
      <InputFormField
        path="complementAdresse"
        label="Complément d’adresse"
        control={control}
        disabled={formState.isSubmitting}
      />
      <MultipleSelectFormField
        asterisk
        control={control}
        disabled={formState.isSubmitting}
        path="typologies"
        label="Typologies de la structure"
        options={optionsWithEmptyValue(typologieStructureOptions)}
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
