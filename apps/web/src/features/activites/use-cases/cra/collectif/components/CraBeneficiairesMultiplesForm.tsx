'use client'

import CustomSelectFormField from '@app/ui/components/Form/CustomSelectFormField'
import { useWatchSubscription } from '@app/ui/hooks/useWatchSubscription'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import IconInSquare from '@app/web/components/IconInSquare'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import { BeneficiaireData } from '@app/web/features/beneficiaires/validation/BeneficiaireValidation'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import {
  Control,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
} from 'react-hook-form'
import { CraCollectifData } from '../validation/CraCollectifValidation'
import CraBeneficiairesAnonymesForm from './CraBeneficiairesAnonymesForm'
import { useCraBeneficiaireLoadOptions } from './useCraBeneficiaireLoadOptions'

const CraBeneficiairesMultiplesForm = ({
  control,
  setValue,
  getValues,
  watch,
  mediateurId,
  initialBeneficiairesOptions,
  creerBeneficiaireRetourUrl,
  isLoading,
}: {
  getValues: UseFormGetValues<CraCollectifData>
  setValue: UseFormSetValue<CraCollectifData>
  watch: UseFormWatch<CraCollectifData>
  control: Control<CraCollectifData>
  mediateurId: string
  creerBeneficiaireRetourUrl: string
  initialBeneficiairesOptions: BeneficiaireOption[]
  isLoading?: boolean
}) => {
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'participants',
    keyName: '_formkey',
  })

  const router = useRouter()
  const participants = watch('participants')

  const beneficiaireOptions = useCraBeneficiaireLoadOptions({
    initialOptions: initialBeneficiairesOptions,
    participants,
  })

  const onCreer = () => {
    // When creating beneficiare, we redirect to the beneficiaire creation page but with the state of this form as a "next" or "back" url
    // so we can come back to this form in the same state, but with the created beneficiary selected

    const creationUrl = `/coop/mes-beneficiaires/nouveau?retour=${encodeURIComponent(
      creerBeneficiaireRetourUrl,
    )}&cra=${encodeSerializableState(getValues())}`

    router.push(creationUrl)
  }

  const suivisCount = fields.length

  const anonymesTotal = watch('participantsAnonymes.total') ?? 0

  const totalParticipants = suivisCount + anonymesTotal

  const participantsIds = useRef(new Set(fields.map((field) => field.id)))

  const addParticipantKey = watch('addParticipant')?.id ?? 'empty'

  useWatchSubscription(
    watch,
    useCallback(
      (data, { name, type }) => {
        if (name === 'addParticipant' && !!type && data.addParticipant?.id) {
          const participantToAdd = data.addParticipant as BeneficiaireData & {
            id: string
          }

          if (
            participantToAdd &&
            !participantsIds.current.has(participantToAdd.id)
          ) {
            participantsIds.current.add(participantToAdd.id)
            append({ ...participantToAdd, mediateurId })
          }
          // cannot setvalue during useWatchSubscription
          setTimeout(() => {
            setValue('addParticipant', null)
          }, 0)
        }
      },
      [append, mediateurId, setValue],
    ),
  )

  const onRemoveParticipant = (index: number, id: string) => {
    participantsIds.current.delete(id)
    remove(index)
  }

  return (
    <div className="fr-my-12v fr-border fr-border-radius--8 fr-width-full">
      <div className="fr-background-alt--blue-france fr-px-8v fr-py-6v fr-border-radius-top--8 fr-flex fr-flex-gap-8v fr-align-items-center">
        <IconInSquare
          iconId="fr-icon-user-heart-line"
          size="large"
          background="fr-background-default--grey"
        />
        <div className="fr-flex-grow-1">
          <p className="fr-text--bold fr-mb-1v">
            Bénéficiaire{sPluriel(suivisCount)} suivi{sPluriel(suivisCount)} ·{' '}
            {suivisCount}
          </p>
          <CustomSelectFormField
            key={addParticipantKey}
            label=" "
            path="addParticipant"
            placeholder="Rechercher parmi vos bénéficiaires enregistrés"
            control={control}
            disabled={isLoading}
            className="fr-mb-2v fr-mt-3v"
            loadOptions={beneficiaireOptions.loadOptions}
            defaultOptions={beneficiaireOptions.initialOptions}
            getOptionKey={(option) => option.value?.id ?? ''}
            getValueKey={(value) => value?.id ?? ''}
            filterOption={({ data }) =>
              // Display if has no id (info message)
              !data.value?.id ||
              // Display if not already in the list
              !participantsIds.current.has(data.value.id)
            }
          />
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
        </div>
      </div>
      {suivisCount > 0 && (
        <>
          <div className="fr-px-8v fr-pt-6v fr-pb-8v fr-flex fr-flex-gap-2v fr-flex-wrap">
            {fields.map((field, index) => (
              <Tag
                key={field._formkey}
                nativeButtonProps={{
                  onClick: () => onRemoveParticipant(index, field.id),
                }}
              >
                {getBeneficiaireDisplayName(field)}&nbsp;
                <span className="fr-icon-close-line fr-icon--sm" />
              </Tag>
            ))}
          </div>
          <hr className="fr-separator-1px" />
        </>
      )}
      <div className="fr-p-8v">
        <CraBeneficiairesAnonymesForm
          setValue={setValue}
          watch={watch}
          control={control}
          isLoading={isLoading}
        />
      </div>
      <hr className="fr-separator-1px" />
      <div className="fr-p-8v fr-flex fr-justify-content-space-between fr-align-items-center">
        <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
          {suivisCount} Bénéficiaire{sPluriel(suivisCount)} suivi
          {sPluriel(suivisCount)}&nbsp;·&nbsp;{anonymesTotal} Bénéficiaire
          {sPluriel(anonymesTotal)} anonyme{sPluriel(anonymesTotal)}
        </p>
        <p className="fr-text--lg fr-text--bold fr-mb-0">
          <span className="fr-icon-group-line fr-mr-1w" />
          Total des participants&nbsp;:{' '}
          <span className="fr-text-title--blue-france">
            {totalParticipants}
          </span>
        </p>
      </div>
    </div>
  )
}

export default CraBeneficiairesMultiplesForm
