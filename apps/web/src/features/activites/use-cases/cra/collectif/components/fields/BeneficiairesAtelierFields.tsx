import { Options } from '@app/ui/components/Primitives/Options'
import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import {
  genreLabels,
  genreValues,
  statutSocialLabels,
  statutSocialValues,
  trancheAgeLabels,
  trancheAgeValues,
} from '@app/web/beneficiaire/beneficiaire'
import IconInSquare from '@app/web/components/IconInSquare'
import { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import {
  BeneficiaireComboBox,
  BeneficiaireOptions,
  BeneficiaireSelectedItems,
} from '@app/web/features/beneficiaires/combo-box/BeneficiaireComboBox'
import { DefaultValues, withForm } from '@app/web/libs/form/use-app-form'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import Button from '@codegouvfr/react-dsfr/Button'
import { formOptions, useStore } from '@tanstack/react-form'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { Fragment, useCallback } from 'react'
import { CraCollectifData } from '../../validation/CraCollectifValidation'
import {
  countGenreNonCommunique,
  countStatutSocialNonCommunique,
  countTrancheAgeNonCommunique,
  participantsAnonymesDefault,
} from '../../validation/participantsAnonymes'

const options = formOptions({
  defaultValues: {} as DefaultValues<CraCollectifData>,
})

const NonCommuniqueCount = ({
  count,
  label,
  className,
}: {
  label: string
  count: number
  className?: string
}) => (
  <div className={className}>
    <div className="fr-mt-2v fr-p-4v  fr-border-radius--4 fr-flex fr-justify-content-space-between fr-border-default--grey">
      <span className="fr-text--sm fr-mb-0 fr-text--medium">{label}</span>
      {Math.max(count, 0)}
    </div>
  </div>
)

export const BeneficiairesAtelierFields = withForm({
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

    const participants =
      useStore(form.store, (state) => state.values.participants) ?? []

    const participantsAnonymes = useStore(
      form.store,
      (state) => state.values.participantsAnonymes,
    ) ?? { total: 0 }

    const onCreer = () => {
      const creationUrl = `/coop/mes-beneficiaires/nouveau?retour=${encodeURIComponent(
        creerBeneficiaireRetourUrl,
      )}&cra=${encodeSerializableState(form.state.values)}`
      router.push(creationUrl)
    }

    const onGenreStepperChange = useCallback(() => {
      // Update non communique count
      if (!form.state.values.participantsAnonymes) return // should not happen but here for type safety

      form.setFieldValue(
        'participantsAnonymes.genreNonCommunique',
        countGenreNonCommunique(form.state.values.participantsAnonymes),
      )
    }, [form])

    const onTrancheAgeStepperChange = useCallback(() => {
      // Update non communique count
      if (!form.state.values.participantsAnonymes) return // should not happen but here for type safety
      form.setFieldValue(
        'participantsAnonymes.trancheAgeNonCommunique',
        countTrancheAgeNonCommunique(form.state.values.participantsAnonymes),
      )
    }, [form])

    const onStatutSocialStepperChange = useCallback(() => {
      // Update non communique count
      if (!form.state.values.participantsAnonymes) return // should not happen but here for type safety
      form.setFieldValue(
        'participantsAnonymes.statutSocialNonCommunique',
        countStatutSocialNonCommunique(form.state.values.participantsAnonymes),
      )
    }, [form])

    const onTotalStepperChange = useCallback(
      ({ value = 0 }: { value?: number }) => {
        // Safety if negative value
        if (value <= 0) {
          form.setFieldValue(
            'participantsAnonymes',
            participantsAnonymesDefault,
          )
          return
        }
        // Recompute nonCommunique counts
        if (!form.state.values.participantsAnonymes) return // should not happen but here for type safety

        form.setFieldValue(
          'participantsAnonymes.genreNonCommunique',
          countGenreNonCommunique(form.state.values.participantsAnonymes),
        )
        form.setFieldValue(
          'participantsAnonymes.trancheAgeNonCommunique',
          countTrancheAgeNonCommunique(form.state.values.participantsAnonymes),
        )
        form.setFieldValue(
          'participantsAnonymes.statutSocialNonCommunique',
          countStatutSocialNonCommunique(
            form.state.values.participantsAnonymes,
          ),
        )
      },
      [form],
    )

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
                    {...BeneficiaireComboBox(field.state.value)}
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
                      onClick={onCreer}
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
        <div className="fr-p-8v">
          <form.AppField
            name="participantsAnonymes.total"
            listeners={{ onChange: onTotalStepperChange }}
          >
            {(field) => (
              <>
                <field.Stepper
                  className="fr-grid-row fr-flex-sm fr-align-items-center"
                  classes={{
                    label:
                      'fr-col-12 fr-col-sm-9 fr-mb-0 fr-text--medium fr-my-1v',
                    wrap: 'fr-col-12 fr-col-sm-3 fr-mt-0',
                    nativeInputOrTextArea: 'fr-input--plus-minus',
                  }}
                  label="Bénéficiaires anonymes"
                  addTitle="Ajouter un bénéficiaire anonyme"
                  removeTitle="Retirer un bénéficiaire anonyme"
                  size="small"
                  isPending={isPending}
                />
                {(participantsAnonymes.total ?? 0) > 0 && (
                  <>
                    <p className="fr-text--xs fr-text-mention--grey fr-my-6v">
                      Ajoutez des informations anonymes sur les bénéficiaires
                      que vous ne souhaitez pas enregistrer afin d’enrichir vos
                      statistiques.
                    </p>
                    <form.AppField name="participantsAnonymes.dejaAccompagne">
                      {(field) => (
                        <>
                          <field.StepperStacked
                            classes={
                              (field.state?.value ?? 0) >
                              (participantsAnonymes.total ?? 0)
                                ? { label: 'fr-text-default--error' }
                                : {}
                            }
                            label="Bénéficiaires déjà accompagnés"
                            addTitle="Ajouter un bénéficiaire déjà accompagné"
                            removeTitle="Retirer un bénéficiaire déjà accompagné"
                            max={participantsAnonymes.total ?? 0}
                            isPending={isPending}
                          />
                          {(field.state?.value ?? 0) >
                            (participantsAnonymes.total ?? 0) && (
                            <p className="fr-error-text fr-my-0">
                              Le nombre de bénéficiaires déjà accompagné
                              renseignés dépasse le nombre de bénéficiaires
                              anonymes
                            </p>
                          )}
                        </>
                      )}
                    </form.AppField>
                    <p
                      className={classNames(
                        'fr-text--medium fr-mb-3v fr-mt-6v',
                        (participantsAnonymes.genreNonCommunique ?? 0) < 0 &&
                          'fr-text-default--error',
                      )}
                    >
                      Genre
                    </p>
                    <div className="fr-grid-row fr-grid-row-sm--gutters">
                      {genreValues.map((genre) => (
                        <Fragment key={genre}>
                          {genre === 'NonCommunique' ? (
                            <NonCommuniqueCount
                              className="fr-col-sm-4 fr-col-12"
                              label={genreLabels[genre]}
                              count={
                                participantsAnonymes.genreNonCommunique ?? 0
                              }
                            />
                          ) : (
                            <form.AppField
                              name={`participantsAnonymes.genre${genre}`}
                              listeners={{
                                onChange: onGenreStepperChange,
                              }}
                            >
                              {(field) => (
                                <field.StepperStacked
                                  classes={{
                                    label: 'fr-mt-1v',
                                  }}
                                  className="fr-col-12 fr-col-sm-4"
                                  label={genreLabels[genre]}
                                  addTitle={`Ajouter un genre ${genreLabels[genre]}`}
                                  removeTitle={`Retirer un genre ${genreLabels[genre]}`}
                                  max={
                                    participantsAnonymes.genreNonCommunique ??
                                    0 + (field.state.value ?? 0)
                                  }
                                  isPending={isPending}
                                />
                              )}
                            </form.AppField>
                          )}
                        </Fragment>
                      ))}
                      {(participantsAnonymes.genreNonCommunique ?? 0) < 0 && (
                        <p className="fr-error-text fr-my-0 fr-mx-3v">
                          Le nombre de genres renseignés dépasse le nombre de
                          bénéficiaires anonymes
                        </p>
                      )}
                    </div>
                    <div className="fr-grid-row fr-grid-row-sm--gutters">
                      <div className="fr-col-sm-6 fr-col-12">
                        <p
                          className={classNames(
                            'fr-text--medium fr-mb-3v fr-mt-6v',
                            (participantsAnonymes.trancheAgeNonCommunique ??
                              0) < 0 && 'fr-text-default--error',
                          )}
                        >
                          Tranche d’âge
                        </p>
                        {trancheAgeValues.map((trancheAge) => (
                          <Fragment key={trancheAge}>
                            {trancheAge === 'NonCommunique' ? (
                              <NonCommuniqueCount
                                label={trancheAgeLabels[trancheAge]}
                                count={
                                  participantsAnonymes.trancheAgeNonCommunique ??
                                  0
                                }
                              />
                            ) : (
                              <form.AppField
                                name={`participantsAnonymes.trancheAge${trancheAge}`}
                                listeners={{
                                  onChange: onTrancheAgeStepperChange,
                                }}
                              >
                                {(field) => (
                                  <field.StepperStacked
                                    label={trancheAgeLabels[trancheAge]}
                                    addTitle={`Ajouter une tranche d’âge ${trancheAgeLabels[trancheAge]}`}
                                    removeTitle={`Retirer une tranche d’âge ${trancheAgeLabels[trancheAge]}`}
                                    max={
                                      (participantsAnonymes.trancheAgeNonCommunique ??
                                        0) + (field.state.value ?? 0)
                                    }
                                    isPending={isPending}
                                  />
                                )}
                              </form.AppField>
                            )}
                          </Fragment>
                        ))}
                        {(participantsAnonymes.trancheAgeNonCommunique ?? 0) <
                          0 && (
                          <p className="fr-error-text">
                            Le nombre de tranches d’âge renseignées dépasse le
                            nombre de bénéficiaires anonymes
                          </p>
                        )}
                      </div>
                      <div className="fr-col-sm-6 fr-col-12">
                        <p
                          className={classNames(
                            'fr-text--medium fr-mb-3v fr-mt-6v',
                            (participantsAnonymes.statutSocialNonCommunique ??
                              0) < 0 && 'fr-text-default--error',
                          )}
                        >
                          Statut du bénéficiaire
                        </p>
                        {statutSocialValues.map((statutSocial) => (
                          <Fragment key={statutSocial}>
                            {statutSocial === 'NonCommunique' ? (
                              <NonCommuniqueCount
                                label={statutSocialLabels[statutSocial]}
                                count={
                                  participantsAnonymes.statutSocialNonCommunique ??
                                  0
                                }
                              />
                            ) : (
                              <form.AppField
                                name={`participantsAnonymes.statutSocial${statutSocial}`}
                                listeners={{
                                  onChange: onStatutSocialStepperChange,
                                }}
                              >
                                {(field) => (
                                  <field.StepperStacked
                                    label={statutSocialLabels[statutSocial]}
                                    addTitle={`Ajouter un statut social ${statutSocialLabels[statutSocial]}`}
                                    removeTitle={`Retirer un statut social ${statutSocialLabels[statutSocial]}`}
                                    max={
                                      (participantsAnonymes.statutSocialNonCommunique ??
                                        0) + (field.state.value ?? 0)
                                    }
                                    isPending={isPending}
                                  />
                                )}
                              </form.AppField>
                            )}
                          </Fragment>
                        ))}
                        {(participantsAnonymes.statutSocialNonCommunique ?? 0) <
                          0 && (
                          <p className="fr-error-text">
                            Le nombre de statuts renseignés dépasse le nombre de
                            bénéficiaires anonymes
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </form.AppField>
        </div>
        <hr className="fr-separator-1px" />
        <div className="fr-p-8v fr-flex fr-justify-content-space-between fr-align-items-center">
          <p className="fr-text-mention--grey fr-text--sm fr-mb-0">
            {participants.length} Bénéficiaire{sPluriel(participants.length)}{' '}
            suivi
            {sPluriel(participants.length)}&nbsp;·&nbsp;
            {participantsAnonymes.total ?? 0} Bénéficiaire
            {sPluriel(participantsAnonymes.total ?? 0)} anonyme
            {sPluriel(participantsAnonymes.total ?? 0)}
          </p>
          <p className="fr-text--lg fr-text--bold fr-mb-0">
            <span className="fr-icon-group-line fr-mr-1w" />
            Total des participants&nbsp;:{' '}
            <span className="fr-text-title--blue-france">
              {participants.length + (participantsAnonymes.total ?? 0)}
            </span>
          </p>
        </div>
      </div>
    )
  },
})
