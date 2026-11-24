'use client'

import { useStore } from '@tanstack/react-form'
import type { z } from 'zod'
import { RESUME_MAX_LENGTH } from '@/features/lieux-activite/domain/saisie/regles-de-saisie'
import EditCardTanStack from '@/libraries/formulaire/form-components/EditCardTanStack'
import { useAppForm } from '@/libraries/formulaire/use-app-form'
import { DescriptionSaisie } from '../../../action/modifier-la-fiche-du-lieu.validation'
import type { EnregistrerUneSection } from '../../hooks/use-enregistrement-de-section'
import { useEnregistrementDeSection } from '../../hooks/use-enregistrement-de-section'
import type { DescriptionAffichee } from '../../presenters/description.presenter'
import { EtatVide } from '../EtatVide'
import { VueDescription } from '../vues/VueDescription'

export const SectionDescription = ({
  id,
  description,
  enregistrer,
}: {
  id: string
  description: DescriptionAffichee
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
                hintText={`${RESUME_MAX_LENGTH} caractères maximum`}
                textArea
                isPending={isPending}
              />
            )}
          </form.AppField>
          <form.AppField name="presentationDetail">
            {(field) => (
              <field.RichTextarea
                className="fr-mb-6v"
                label="Présentation"
                isPending={isPending}
              />
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
