'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { EcosystemIcon } from '@app/web/features/pictograms/digital/EcosystemIcon'
import { InnovationIcon } from '@app/web/features/pictograms/digital/InnovationIcon'
import { DocumentSignature } from '@app/web/features/pictograms/document/DocumentSignature'
import { CommunityIcon } from '@app/web/features/pictograms/leisure/CommunityIcon'
import { Compass } from '@app/web/features/pictograms/map/Compass'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import React, { useId } from 'react'
import { DefaultValues } from 'react-hook-form'
import { Tag } from '../../../tags/components/TagsComboBox'
import styles from '../../components/CraForm.module.css'
import { TagsFields } from '../../components/fields/TagsFields'
import {
  CraAnimationData,
  CraAnimationValidation,
  InitiativeValue,
  ThematiqueAnimationValue,
  TypeAnimationValue,
} from '../validation/CraAnimationValidation'

type CraAnimationFormProps = {
  defaultValues: DefaultValues<CraAnimationData> & { coordinateurId: string }
  dureeOptions: SelectOption[]
  initialTagsOptions: Tag[]
  retour?: string
}

const INITIATIVE_OPTIONS: SelectOption<InitiativeValue>[] = [
  { label: 'Intervention à mon initiative', value: 'Initiative' },
  { label: 'Réponse à un besoin/une problématique', value: 'Demande' },
]

const TYPE_ANIMATION_OPTIONS: SelectOption<TypeAnimationValue>[] = [
  {
    label:
      'Assemblée / présentation officielle (Ex : conseil municipal, conseil communautaire, conseil départemental, CA d’association)',
    value: 'Assemblee',
  },
  { label: 'Comité technique / de pilotage', value: 'Comite' },
  { label: 'Groupe de travail', value: 'GroupeDeTravail' },
  { label: 'Moment d’échange / aide / soutien', value: 'Echange' },
  {
    label:
      'Réunion de coordination (coordinateurs, médiateurs et conseillers numériques, préfectures, Hubs...)',
    value: 'ReunionCoordination',
  },
  { label: 'Webinaire', value: 'Webinaire' },
  { label: 'Autre', value: 'Autre' },
]

const THEMATIQUE_ANIMATION_OPTIONS: SelectOption<ThematiqueAnimationValue>[] = [
  {
    label: 'Échanges de bonnes pratiques / partage d’informations',
    value: 'Partage',
    hint: 'Accompagner les médiateurs dans leur pratique quotidienne de la médiation numérique (Bonnes pratiques, comment améliorer/faire évoluer ses accompagnements...)',
    extra: {
      illustration: CommunityIcon,
      tooltips: [
        'Information sur le dispositif Conseiller numérique',
        'Échange sur la posture professionnelle',
        'Organisation d’atelier',
        'Prodiguer une recommandation',
        'Problématique psychosociale d’un usager',
        'Rencontre avec un(e) médiateur/trice',
      ],
    },
  },
  {
    label: 'Maillage territorial - faire réseau / créer du lien',
    value: 'Reseau',
    hint: 'Accompagnement à la mise en place de partenariats, mise en relation intra services, positionnement territorial...',
    extra: {
      illustration: EcosystemIcon,
      tooltips: [
        'Accompagnement à la mise en place de partenariats',
        'Information sur actions et partenariats locaux',
        'Mise en relation intra services',
        'Positionnement territorial',
      ],
    },
  },
  {
    label: 'Soutien technique et/ou organisationnel',
    value: 'Soutien',
    hint: 'Accompagner un médiateur et/ou une structure sur des besoins logistiques, financiers, d’organisation du temps du travail...',
    extra: {
      illustration: InnovationIcon,
      tooltips: [
        'Accompagnement à la recherche de financements',
        'Accompagnement à l’organisation d’évènements',
        'Demande d’intervention technique / Dépannage',
        'Périmètre d’action conseiller numérique',
        'Planning',
        'Recherche de local',
        'Réorganisation du temps de travail',
      ],
    },
  },
  {
    label: 'Projet / Parcours professionnel',
    value: 'Professionnel',
    hint: "Proposition de formation, posture professionnelle, embarquement d'un nouveau médiateur numérique, bilan d'activité...",
    extra: {
      illustration: Compass,
      tooltips: [
        'Formation interne',
        'Identification/proposition de formation',
        'Onboarding d’un(e) médiateur/trice',
        'Report hiérarchique',
        'Point sur l’activité / Bilan d’activité',
      ],
    },
  },
  {
    label: 'Soutien RH auprès des structures',
    value: 'RH',
    hint: 'Aide au recrutement, convention, fin de contrat...',
    extra: {
      illustration: DocumentSignature,
      tooltips: ['Remplacement / renfort', 'RH (recrutement, fin de contrat)'],
    },
  },
  {
    label: 'Autre thématique',
    value: 'Autre',
    hint: 'Sélectionnez “autre thématique” si votre intervention ne correspond pas aux thématiques proposées.',
  },
]

const CraAnimationForm = ({
  defaultValues,
  dureeOptions,
  initialTagsOptions,
  retour,
}: CraAnimationFormProps) => {
  const router = useRouter()
  const mutation = trpc.cra.animation.useMutation()
  const participantsId = useId()
  const isPending = mutation.isPending

  const form = useAppForm({
    validators: {
      onSubmit: CraAnimationValidation,
    },
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => {
        replaceRouteWithoutRerender(
          `/coop/mes-activites/cra/animation?v=${encodeSerializableState(
            formApi.state.values,
          )}`,
        )
      },
    },
    onSubmit: async (data) => {
      if (isPending) return

      try {
        await mutation.mutateAsync(data.value as CraAnimationData)
        createToast({
          priority: 'success',
          message: 'L’animation a bien été enregistrée.',
        })
        router.push(retour ?? '/coop/mes-activites')
        router.refresh()
      } catch (mutationError) {
        createToast({
          priority: 'error',
          message:
            'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
        })
        throw mutationError
      }
    },
  })

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <div className="fr-flex fr-direction-column fr-direction-md-row fr-flex-gap-0 fr-flex-gap-md-4v">
          <form.AppField name="date">
            {(field) => (
              <field.Input
                className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
                isPending={isPending}
                nativeInputProps={{ type: 'date' }}
                classes={{ nativeInputOrTextArea: styles.tallInput }}
                label={
                  <>
                    Date de l’intervention <RedAsterisk />
                  </>
                }
              />
            )}
          </form.AppField>
          <form.AppField name="duree.duree">
            {(field) => (
              <div className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v">
                <field.Select
                  isPending={isPending}
                  options={dureeOptions}
                  className={styles.tallInput}
                  placeholder="Sélectionnez une durée"
                  label={
                    <>
                      Durée de l’intervention <RedAsterisk />
                    </>
                  }
                />
                {field.state.value === 'personnaliser' && (
                  <div className="fr-flex fr-flex-gap-4v">
                    <form.AppField
                      name="duree.dureePersonnaliseeHeures"
                      defaultValue={0}
                    >
                      {(field) => (
                        <div className="fr-flex-basis-0 fr-flex-grow-1">
                          <field.Input
                            isPending={isPending}
                            addinEnd={
                              <span
                                className="fr-mr-4v"
                                style={{ lineHeight: '56px' }}
                              >
                                h
                              </span>
                            }
                            classes={{
                              nativeInputOrTextArea: styles.tallInput,
                            }}
                            nativeInputProps={{
                              type: 'number',
                              min: 0,
                              max: 23,
                              step: 1,
                            }}
                            label=""
                          />
                        </div>
                      )}
                    </form.AppField>
                    <form.AppField
                      name="duree.dureePersonnaliseeMinutes"
                      defaultValue={0}
                    >
                      {(field) => (
                        <div className="fr-flex-basis-0 fr-flex-grow-1">
                          <field.Input
                            isPending={isPending}
                            addinEnd={
                              <span
                                className="fr-mr-2v"
                                style={{ lineHeight: '56px' }}
                              >
                                min
                              </span>
                            }
                            classes={{
                              nativeInputOrTextArea: styles.tallInput,
                            }}
                            nativeInputProps={{
                              type: 'number',
                              min: 0,
                              max: 59,
                              step: 1,
                            }}
                            label=""
                          />
                        </div>
                      )}
                    </form.AppField>
                  </div>
                )}
              </div>
            )}
          </form.AppField>
        </div>
        <fieldset
          className="fr-fieldset"
          id={participantsId}
          aria-labelledby={`${participantsId}-legend`}
        >
          <legend
            className="fr-fieldset__legend fr-text--semi-bold fr-pb-0"
            id={`${participantsId}-legend`}
          >
            Auprès de qui êtes-vous intervenu ? <RedAsterisk />
          </legend>

          <div className="fr-fieldset__element">
            <p className="fr-text-mention--grey fr-text--xs">
              Renseignez le nombre de participants
            </p>
            <ul className="fr-list-group fr-list-group--bordered fr-border-default--grey fr-border-radius--8">
              <li>
                <form.AppField name="mediateurs">
                  {(field) => (
                    <field.Stepper
                      className="fr-grid-row fr-flex-sm fr-align-items-center fr-p-6v fr-m-0"
                      classes={{
                        label:
                          'fr-col-12 fr-col-md-10 fr-col-sm-9 fr-mb-0 fr-text--medium fr-my-1v',
                        wrap: 'fr-col-12 fr-col-md-2 fr-col-sm-3 fr-mt-0',
                        nativeInputOrTextArea: 'fr-input--plus-minus',
                      }}
                      label={
                        <>
                          Médiateur·ice·s numérique·s{' '}
                          <Button
                            className="fr-px-1v fr-ml-1v"
                            title="Plus d’information à propos des médiateurs numériques"
                            priority="tertiary no outline"
                            size="small"
                            type="button"
                            aria-describedby="tooltip-mediateurs-numeriques"
                          >
                            <span
                              className="ri-information-line fr-text--lg"
                              aria-hidden
                            />
                          </Button>
                          <span
                            className="fr-tooltip fr-placement"
                            id="tooltip-mediateurs-numeriques"
                            role="tooltip"
                            aria-hidden
                          >
                            Médiateurs numériques et conseillers numériques
                          </span>
                        </>
                      }
                      addTitle="Ajouter un médiateur ou une médiatrice numérique"
                      removeTitle="Retirer un un médiateur ou une médiatrice numérique"
                      size="small"
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              </li>
              <li>
                <form.AppField name="structures">
                  {(field) => (
                    <field.Stepper
                      className="fr-grid-row fr-flex-sm fr-align-items-center fr-p-6v fr-m-0"
                      classes={{
                        label:
                          'fr-col-12 fr-col-md-10 fr-col-sm-9 fr-mb-0 fr-text--medium fr-my-1v',
                        wrap: 'fr-col-12 fr-col-md-2 fr-col-sm-3 fr-mt-0',
                        nativeInputOrTextArea: 'fr-input--plus-minus',
                      }}
                      label={
                        <>
                          Structure·s{' '}
                          <Button
                            className="fr-px-1v fr-ml-1v"
                            title="Plus d’information à propos des structures"
                            priority="tertiary no outline"
                            size="small"
                            type="button"
                            aria-describedby="tooltip-structures"
                          >
                            <span
                              className="ri-information-line fr-text--lg"
                              aria-hidden
                            />
                          </Button>
                          <span
                            className="fr-tooltip fr-placement"
                            id="tooltip-structures"
                            role="tooltip"
                            aria-hidden
                          >
                            Collectivités, organismes publics, associations,
                            entreprises...
                          </span>
                        </>
                      }
                      addTitle="Ajouter une structure"
                      removeTitle="Retirer une structure"
                      size="small"
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              </li>
              <li>
                <form.AppField name="autresActeurs">
                  {(field) => (
                    <field.Stepper
                      className="fr-grid-row fr-flex-sm fr-align-items-center fr-p-6v fr-m-0"
                      classes={{
                        label:
                          'fr-col-12 fr-col-md-10 fr-col-sm-9 fr-mb-0 fr-text--medium fr-my-1v',
                        wrap: 'fr-col-12 fr-col-md-2 fr-col-sm-3 fr-mt-0',
                        nativeInputOrTextArea: 'fr-input--plus-minus',
                      }}
                      label={
                        <>
                          Autres acteur.trice.s (Réseau d’inclusion numérique){' '}
                          <Button
                            className="fr-px-1v fr-ml-1v"
                            title="Plus d’information à propos des autres acteurs"
                            priority="tertiary no outline"
                            size="small"
                            type="button"
                            aria-describedby="tooltip-autres-acteurs"
                          >
                            <span
                              className="ri-information-line fr-text--lg"
                              aria-hidden
                            />
                          </Button>
                          <span
                            className="fr-tooltip fr-placement"
                            id="tooltip-autres-acteurs"
                            role="tooltip"
                            aria-hidden
                          >
                            Aidants, travailleurs sociaux...
                          </span>
                        </>
                      }
                      addTitle="Ajouter un autre acteur ou actrice"
                      removeTitle="Retirer un autre acteur ou actrice"
                      size="small"
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              </li>
            </ul>
          </div>
        </fieldset>
        <hr className="fr-separator-12v fr-mb-8v" />
        <form.AppField name="typeAnimation">
          {(subField) => (
            <>
              <subField.Select
                isPending={isPending}
                options={TYPE_ANIMATION_OPTIONS}
                className="fr-py-4v"
                placeholder="Sélectionnez le type d’animation"
                label={
                  <>
                    Type d’animation <RedAsterisk />
                  </>
                }
              />
              {subField.state.value === 'Autre' && (
                <form.AppField name="typeAnimationAutre">
                  {(field) => (
                    <field.Input
                      label="Veuillez préciser le choix “Autre” :"
                      className="fr-mb-8v"
                      size="x-large"
                      nativeInputProps={{
                        placeholder: 'À compléter',
                      }}
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              )}
            </>
          )}
        </form.AppField>
        <form.AppField name="initiative">
          {(field) => (
            <field.RadioButtons
              className="fr-flex-basis-0 fr-flex-grow-1 fr-mt-8v"
              classes={{
                content: 'fr-display-grid fr-grid--2x1 fr-grid-gap-2v',
              }}
              isPending={isPending}
              options={INITIATIVE_OPTIONS}
              orientation="horizontal"
              legend="Qui est à l’initiative de cette intervention ?"
              hintText="Est-ce que vous répondez à une demande (problématique/besoin) ou cette intervention est à votre initiative ?"
            />
          )}
        </form.AppField>
        <form.AppField name="thematiquesAnimation">
          {(field) => (
            <>
              <field.Checkbox
                className="fr-flex-basis-0 fr-flex-grow-1 fr-mt-8v"
                classes={{
                  content: 'fr-display-grid fr-grid--1x1 fr-grid-gap-2v',
                }}
                isPending={isPending}
                options={THEMATIQUE_ANIMATION_OPTIONS}
                orientation="horizontal"
                legend={
                  <>
                    Thématiques d’animation <RedAsterisk />
                  </>
                }
                hintText="Vous pouvez sélectionner un ou plusieurs choix."
              />
              {field.state.value?.includes('Autre') && (
                <form.AppField name="thematiqueAnimationAutre">
                  {(subField) => (
                    <subField.Input
                      label="Veuillez préciser le choix “Autre” :"
                      className="fr-mb-8v"
                      size="x-large"
                      nativeInputProps={{ placeholder: 'À compléter' }}
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              )}
            </>
          )}
        </form.AppField>
        <hr className="fr-separator-12v" />
        <TagsFields
          form={form as any}
          isPending={isPending}
          initialTagsOptions={initialTagsOptions}
        />
        <form.AppField name="notes">
          {(field) => (
            <field.RichTextarea
              label="Notes sur l’accompagnement"
              hint={
                <>
                  Vous pouvez rédiger ici une note contextuelle sur l’activité
                  réalisée.
                  <br />
                  Ces notes sont personnelles et vous les retrouverez dans votre
                  historique d’activités.
                </>
              }
              isPending={isPending}
              className="fr-mt-12v"
            />
          )}
        </form.AppField>
        <div className="fr-btns-group fr-mt-12v fr-mb-30v">
          <form.Submit isPending={isPending}>
            Enregistrer l’activité
          </form.Submit>
          <Button priority="secondary" linkProps={{ href: retour ?? '/coop' }}>
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}

export default withTrpc(CraAnimationForm)
