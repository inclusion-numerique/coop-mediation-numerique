'use client'

import RedAsterisk from '@app/ui/components/Form/RedAsterisk'
import { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { trpc } from '@app/web/trpc'
import { encodeSerializableState } from '@app/web/utils/encodeSerializableState'
import { replaceRouteWithoutRerender } from '@app/web/utils/replaceRouteWithoutRerender'
import Button from '@codegouvfr/react-dsfr/Button'
import { useRouter } from 'next/navigation'
import React from 'react'
import { DefaultValues } from 'react-hook-form'
import { Tag } from '../../../tags/components/TagsComboBox'
import styles from '../../components/CraForm.module.css'
import { TagsFields } from '../../components/fields/TagsFields'
import {
  CraEvenementData,
  CraEvenementValidation,
  EchelonTerritorialValue,
  OrganisateursValue,
  TypeEvenementValue,
} from '../validation/CraEvenementValidation'

type CraEvenementFormProps = {
  defaultValues: DefaultValues<CraEvenementData> & { coordinateurId: string }
  initialTagsOptions: Tag[]
  retour?: string
}

const TYPE_EVENEMENT_OPTIONS: SelectOption<TypeEvenementValue>[] = [
  {
    label:
      'Évènement grand public (Ex : Forums, salons, journées départementales, ateliers collectifs...)',
    value: 'GrandPublic',
  },
  {
    label: 'Évènement national (Ex : NEC, ANCTour, etc...)',
    value: 'National',
  },
  {
    label:
      'Journée d’inclusion numérique (Ex : Séminaire, rencontre, intervention...)',
    value: 'InclusionNumerique',
  },
  { label: 'NEC local', value: 'NecLocal' },
  { label: 'Autre', value: 'Autre' },
]

const ORGANISATEURS_OPTIONS: SelectOption<OrganisateursValue>[] = [
  { label: 'Ma structure (moi - même)', value: 'MaStructure' },
  { label: 'Une commune', value: 'Commune' },
  { label: 'Un EPCI', value: 'Epci' },
  { label: 'Le département', value: 'Departement' },
  { label: 'La région', value: 'Region' },
  { label: 'Une association', value: 'Association' },
  { label: 'Une entreprise', value: 'Entreprise' },
  { label: 'Un Hub', value: 'Hub' },
  { label: 'État (Préfecture, ANCT, Opérateur...)', value: 'Etat' },
  {
    label: 'Un groupement (Syndicat mixte, consortium...)',
    value: 'Groupement',
  },
  { label: 'Autre', value: 'Autre' },
]

const ECHELON_TERRITORIAL_OPTIONS: SelectOption<EchelonTerritorialValue>[] = [
  { label: 'Communal', value: 'Communal' },
  { label: 'Intercommunal', value: 'Intercommunal' },
  { label: 'Départemental', value: 'Departemental' },
  { label: 'Régional', value: 'Regional' },
  { label: 'National', value: 'National' },
]

const valueMatching =
  (item: string) =>
  ({ value }: { value: string }) =>
    value === item

const CraEvenementForm = ({
  defaultValues,
  initialTagsOptions,
  retour,
}: CraEvenementFormProps) => {
  const router = useRouter()
  const mutation = trpc.cra.evenement.useMutation()
  const isPending = mutation.isPending

  const form = useAppForm({
    validators: {
      onSubmit: CraEvenementValidation,
    },
    defaultValues,
    listeners: {
      onChange: ({ formApi }) => {
        replaceRouteWithoutRerender(
          `/coop/mes-activites/cra/evenement?v=${encodeSerializableState(
            formApi.state.values,
          )}`,
        )
      },
    },
    onSubmit: async (data) => {
      if (isPending) return

      try {
        await mutation.mutateAsync(data.value as CraEvenementData)
        createToast({
          priority: 'success',
          message: 'L’événement a bien été enregistré.',
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
        <form.AppField name="date">
          {(field) => (
            <field.Input
              className="fr-flex-basis-0 fr-flex-grow-1 fr-mb-8v"
              isPending={isPending}
              nativeInputProps={{ type: 'date' }}
              classes={{ nativeInputOrTextArea: styles.tallInput }}
              label={
                <>
                  Date de l’évènement <RedAsterisk />
                </>
              }
              hintText="Si l'événement se déroule sur plusieurs jours, renseigner la date de début de l'événement."
            />
          )}
        </form.AppField>
        <form.AppField name="participants">
          {(field) => (
            <field.Stepper
              className="fr-grid-row fr-flex-sm fr-align-items-center fr-border fr-p-6v fr-border-radius--4"
              classes={{
                label:
                  'fr-col-12 fr-col-md-10 fr-col-sm-9 fr-mb-0 fr-text--medium fr-my-1v',
                wrap: 'fr-col-12 fr-col-md-2 fr-col-sm-3 fr-mt-0',
                nativeInputOrTextArea: 'fr-input--plus-minus',
              }}
              label="Nombre de participants à l’évènement"
              addTitle="Ajouter un participant"
              removeTitle="Retirer un participant"
              size="small"
              isPending={isPending}
            />
          )}
        </form.AppField>
        <hr className="fr-separator-12v" />
        <form.AppField name="nomEvenement">
          {(field) => (
            <field.Input
              label="Nom de l’évènement"
              className="fr-mb-8v"
              size="x-large"
              nativeInputProps={{
                placeholder: 'Renseignez le nom de l’évènement',
              }}
              isPending={isPending}
            />
          )}
        </form.AppField>
        <form.AppField name="typeEvenement">
          {(field) => (
            <>
              <field.Select
                isPending={isPending}
                options={TYPE_EVENEMENT_OPTIONS}
                className="fr-py-4v"
                placeholder="Sélectionnez le type d’évènement"
                label={
                  <>
                    Type d’évènement <RedAsterisk />
                  </>
                }
              />
              {field.state.value === 'Autre' && (
                <form.AppField name="typeEvenementAutre">
                  {(field) => (
                    <field.Input
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
        <form.AppField name="organisateurs">
          {(field) => (
            <div className="fr-py-4v">
              <field.MultiSelect
                isPending={isPending}
                options={ORGANISATEURS_OPTIONS}
                placeholder="Sélectionnez le ou les organisateur(s)"
                hint="Vous pouvez sélectionner un ou plusieurs choix."
                nativeSelectProps={{ className: 'fr-py-4v' }}
                label={
                  <>
                    Organisé par <RedAsterisk />
                  </>
                }
              />
              {(field.state.value?.length ?? 0) > 0 && (
                <field.SelectedItems
                  itemToString={(item: string) =>
                    ORGANISATEURS_OPTIONS.find(valueMatching(item))?.label ?? ''
                  }
                  itemToKey={(item: string) => item}
                />
              )}
              {field.state.value?.includes('Autre') && (
                <form.AppField name="organisateurAutre">
                  {(field) => (
                    <field.Input
                      label="Veuillez préciser le choix “Autre” :"
                      className="fr-mb-8v"
                      size="x-large"
                      nativeInputProps={{ placeholder: 'À compléter' }}
                      isPending={isPending}
                    />
                  )}
                </form.AppField>
              )}
            </div>
          )}
        </form.AppField>
        <form.AppField name="echelonTerritorial">
          {(field) => (
            <field.Select
              isPending={isPending}
              options={ECHELON_TERRITORIAL_OPTIONS}
              className="fr-py-4v"
              placeholder="Sélectionnez l’échelon territorial de l’évènement"
              label="Échelon territorial de l’évènement"
            />
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

export default withTrpc(CraEvenementForm)
