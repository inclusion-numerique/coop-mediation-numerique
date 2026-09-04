'use client'

import EditCardTanStack from '@app/web/components/EditCardTanStack'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import {
  DescriptionSaisie,
  resumeMaxLength,
} from '../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import { EtatVide } from './EtatVide'
import { useEnregistrementDeSection } from './useEnregistrementDeSection'
import { VueDescription } from './vues/VueDescription'

export const SectionDescription = ({
  id,
  description,
  enregistrer,
}: {
  id: string
  description: FicheAffichee['description']
  enregistrer: EnregistrerUneSection
}) => {
  const soumettre = useEnregistrementDeSection(id, enregistrer)

  const defaultValues: z.input<typeof DescriptionSaisie> = {
    section: 'Description',
    presentationResume: description.presentationResume,
    presentationDetail: description.presentationDetail,
    formationsLabels: [...description.formationsLabels],
  }

  const form = useAppForm({
    validators: { onSubmit: DescriptionSaisie },
    defaultValues,
    onSubmit: async ({ value }) => soumettre(DescriptionSaisie.parse(value)),
  })

  const isPending = useStore(form.store, (etat) => etat.isSubmitting)

  return (
    <EditCardTanStack
      noBorder
      contentSeparator={false}
      id="description"
      title="Description du lieu"
      description="Décrivez ici le lieu et les activités qu’il propose."
      form={form}
      isPending={isPending}
      isEmpty={description.estVide}
      emptyState={
        <EtatVide titre="Compléter ces informations pour donner du contexte aux aidants qui découvrent ce lieu." />
      }
      edition={
        <>
          <form.AppField name="presentationResume">
            {(field) => (
              <field.Input
                label="Résumé"
                hintText={`${resumeMaxLength} caractères maximum`}
                textArea
                isPending={isPending}
              />
            )}
          </form.AppField>
          <form.AppField name="presentationDetail">
            {(field) => (
              <field.RichTextarea label="Présentation" isPending={isPending} />
            )}
          </form.AppField>
        </>
      }
      view={
        <VueDescription
          presentationResume={description.presentationResume}
          presentationDetail={description.presentationDetail}
          formationsLabels={[...description.formationsLabels]}
        />
      }
    />
  )
}
