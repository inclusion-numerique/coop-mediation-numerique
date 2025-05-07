'use client'

import InlinePlusMinusNumberFormField from '@app/ui/components/Form/InlinePlusMinusNumberFormField'
import PlusMinusNumberFormField from '@app/ui/components/Form/PlusMinusNumberFormField'
import {
  genreLabels,
  genreValues,
  statutSocialLabels,
  statutSocialValues,
  trancheAgeLabels,
  trancheAgeValues,
} from '@app/web/beneficiaire/beneficiaire'
import classNames from 'classnames'
import React, { useEffect } from 'react'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { CraCollectifData } from '../validation/CraCollectifValidation'
import {
  countGenreNonCommunique,
  countStatutSocialNonCommunique,
  countTotalGenre,
  countTotalStatutSocial,
  countTotalTrancheAge,
  countTrancheAgeNonCommunique,
} from '../validation/participantsAnonymes'
import styles from './CraBeneficiairesAnonymesForm.module.css'

const NonCommuniqueCount = ({
  count,
  label,
}: {
  label: string
  count: number
}) => (
  <div className={styles.nonCommuniqueCountContainer}>
    <p
      className={classNames(
        'fr-text--sm fr-text--medium fr-m-0',
        styles.nonCommuniqueCountLabel,
      )}
    >
      {label}
    </p>
    <p
      className={classNames(
        styles.nonCommuniqueCountNumber,
        'fr-text--md fr-text--medium fr-m-0',
      )}
    >
      {count}
    </p>
  </div>
)

const CraBeneficiairesMultiplesForm = ({
  control,
  setValue,
  watch,
  isLoading,
}: {
  isLoading?: boolean
  setValue: UseFormSetValue<CraCollectifData>
  watch: UseFormWatch<CraCollectifData>
  control: Control<CraCollectifData>
}) => {
  const participantsAnonymesCount = watch('participantsAnonymes')

  const { total } = participantsAnonymesCount
  const totalGenre = countTotalGenre(participantsAnonymesCount)
  const totalTrancheAge = countTotalTrancheAge(participantsAnonymesCount)
  const totalStatutSocial = countTotalStatutSocial(participantsAnonymesCount)

  const genreNonCommuniqueCount = watch(
    'participantsAnonymes.genreNonCommunique',
  )
  const trancheAgeNonCommuniqueCount = watch(
    'participantsAnonymes.trancheAgeNonCommunique',
  )
  const statutSocialNonCommuniqueCount = watch(
    'participantsAnonymes.statutSocialNonCommunique',
  )
  const dejaAccompagneCount = watch('participantsAnonymes.dejaAccompagne')

  const disableAddGenre = totalGenre - genreNonCommuniqueCount >= total
  const disableAddTrancheAge =
    totalTrancheAge - trancheAgeNonCommuniqueCount >= total
  const disableAddStatutSocial =
    totalStatutSocial - statutSocialNonCommuniqueCount >= total

  const showCounters =
    total !== 0 ||
    totalGenre !== 0 ||
    totalTrancheAge !== 0 ||
    totalStatutSocial !== 0

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to trigger when total or totalGenre value change
  useEffect(() => {
    setValue(
      'participantsAnonymes.genreNonCommunique',
      Math.max(countGenreNonCommunique(participantsAnonymesCount), 0),
    )
  }, [total, totalGenre, setValue, participantsAnonymesCount])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to trigger when total or totalTrancheAge value change
  useEffect(() => {
    setValue(
      'participantsAnonymes.trancheAgeNonCommunique',
      Math.max(countTrancheAgeNonCommunique(participantsAnonymesCount), 0),
    )
  }, [total, totalTrancheAge, setValue, participantsAnonymesCount])

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to trigger when total or totalStatutSocial value change
  useEffect(() => {
    setValue(
      'participantsAnonymes.statutSocialNonCommunique',
      Math.max(countStatutSocialNonCommunique(participantsAnonymesCount), 0),
    )
  }, [total, totalStatutSocial, setValue, participantsAnonymesCount])

  return (
    <>
      <InlinePlusMinusNumberFormField
        control={control}
        disabled={isLoading}
        path="participantsAnonymes.total"
        min={0}
        step={1}
        label="Bénéficiaires anonymes"
        className="fr-mb-0"
        classes={{
          label: 'fr-text--bold fr-text--md fr-m-0',
          input: 'fr-input--white fr-text--medium',
        }}
      />
      {showCounters && (
        <>
          <p className="fr-text--xs fr-text-mention--grey fr-my-6v">
            Ajoutez des informations anonymes sur les bénéficiaires que vous ne
            souhaitez pas enregistrer afin d’enrichir vos statistiques.
          </p>
          <PlusMinusNumberFormField
            control={control}
            disabled={isLoading}
            path="participantsAnonymes.dejaAccompagne"
            min={0}
            label="Bénéficiaires déjà accompagnés"
            disabledAdd={dejaAccompagneCount >= total}
          />
          <p className="fr-text--medium fr-mb-3v fr-mt-6v">Genre</p>
          <div className={styles.genreContainer}>
            {genreValues.map((genre) =>
              genre === 'NonCommunique' ? (
                <NonCommuniqueCount
                  label={genreLabels[genre]}
                  key={genre}
                  count={genreNonCommuniqueCount}
                />
              ) : (
                <PlusMinusNumberFormField
                  key={genre}
                  control={control}
                  disabled={isLoading}
                  path={`participantsAnonymes.genre${genre}`}
                  min={0}
                  label={genreLabels[genre]}
                  disabledAdd={disableAddGenre}
                />
              ),
            )}
          </div>

          <div className="fr-flex fr-flex-gap-12v">
            <div className="fr-flex-basis-0 fr-flex-grow-1">
              <p className="fr-text--medium fr-mb-3v fr-mt-6v">Tranche d’âge</p>
              {trancheAgeValues.map((trancheAge) =>
                trancheAge === 'NonCommunique' ? (
                  <NonCommuniqueCount
                    label={trancheAgeLabels[trancheAge]}
                    key={trancheAge}
                    count={trancheAgeNonCommuniqueCount}
                  />
                ) : (
                  <PlusMinusNumberFormField
                    key={trancheAge}
                    control={control}
                    disabled={isLoading}
                    path={`participantsAnonymes.trancheAge${trancheAge}`}
                    min={0}
                    label={trancheAgeLabels[trancheAge]}
                    disabledAdd={disableAddTrancheAge}
                  />
                ),
              )}
            </div>
            <div className="fr-flex-basis-0 fr-flex-grow-1">
              <p className="fr-text--medium fr-mb-3v fr-mt-6v">
                Statut du bénéficiaire
              </p>
              {statutSocialValues.map((statutSocial) =>
                statutSocial === 'NonCommunique' ? (
                  <NonCommuniqueCount
                    label={statutSocialLabels[statutSocial]}
                    key={statutSocial}
                    count={statutSocialNonCommuniqueCount}
                  />
                ) : (
                  <PlusMinusNumberFormField
                    key={statutSocial}
                    control={control}
                    disabled={isLoading}
                    path={`participantsAnonymes.statutSocial${statutSocial}`}
                    min={0}
                    label={statutSocialLabels[statutSocial]}
                    disabledAdd={disableAddStatutSocial}
                  />
                ),
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default CraBeneficiairesMultiplesForm
