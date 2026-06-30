'use client'

import {
  type AnalyseResponse,
  storeBeneficiaireImportAnalysis,
} from '@app/web/features/beneficiaire/abilities/importer-beneficiaires/ui/import-analysis-storage'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import { isBrowser } from '@app/web/utils/isBrowser'
import Button from '@codegouvfr/react-dsfr/Button'
import { useStore } from '@tanstack/react-form'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { z } from 'zod'

// Create zod validation so the file is required and of type File
// And the file must be an xlsx file
const UploadBeneficiaireFileFormValidation = z.object({
  file: z
    .instanceof(File, { message: 'Veuillez sélectionner un fichier' })
    .refine(
      (file) =>
        // Safari does not give file.type, we keep this validation for server side
        // On client the file extension is set in the input element
        isBrowser ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      {
        message:
          'Veuillez sélectionner un fichier Excel (.xlsx) basé sur le modèle',
      },
    ),
})

type UploadBeneficiaireFileFormData = z.infer<
  typeof UploadBeneficiaireFileFormValidation
>

const UploadBeneficiaireFileForm = () => {
  const router = useRouter()
  // Bouton actif seulement après hydratation : empêche une soumission GET native
  // si l'utilisateur clique avant que le handler React soit monté.
  const [isInteractive, setIsInteractive] = useState(false)
  useEffect(() => setIsInteractive(true), [])

  const form = useAppForm({
    validators: { onSubmit: UploadBeneficiaireFileFormValidation },
    defaultValues: {} as UploadBeneficiaireFileFormData,
    onSubmit: async ({ value }) => {
      const formData = new FormData()
      formData.append('file', value.file)

      try {
        const response = await fetch(
          '/coop/mes-beneficiaires/importer/analyse',
          { method: 'POST', body: formData },
        )

        if (!response.ok) {
          router.push(
            `/coop/mes-beneficiaires/importer/erreur?message=${response.statusText}`,
          )
          return
        }

        const analysisData = (await response.json()) as AnalyseResponse

        storeBeneficiaireImportAnalysis(analysisData)

        router.push(
          `/coop/mes-beneficiaires/importer/analyse/${analysisData.id}`,
        )
      } catch {
        router.push(`/coop/mes-beneficiaires/importer/erreur`)
      }
    },
  })

  const isPending = useStore(form.store, (state) => state.isSubmitting)

  return (
    <form.AppForm>
      <form onSubmit={handleSubmit(form)}>
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-5">
            <h2 className="fr-h5 fr-text-title--blue-france fr-mb-2v">
              3. Importer le fichier
            </h2>
            <p className="fr-text--sm">
              Une fois le fichier complété, vous pouvez l’importer en cliquant
              sur Parcourir, en le sélectionnant parmi vos dossiers puis en
              cliquant sur Importer.
            </p>
          </div>
          <div className="fr-col-12 fr-col-md-7">
            <div className="fr-border fr-border-radius--16 fr-p-4v">
              <form.AppField name="file">
                {(field) => (
                  <field.File
                    isPending={isPending}
                    label="Importer le fichier"
                    hint="Format Excel (.xlsx)"
                    accept=".xlsx"
                  />
                )}
              </form.AppField>
            </div>
          </div>
        </div>
        <hr className="fr-separator-12v" />
        <div className="fr-btns-group">
          <form.Submit
            isPending={isPending}
            disabled={!isInteractive}
            priority="primary"
          >
            {isPending
              ? 'Analyse en cours...'
              : 'Vérifier le fichier avant import'}
          </form.Submit>
          <Button
            className={classNames('fr-ml-1v', isPending && 'fr-btn--disabled')}
            priority="secondary"
            linkProps={{ href: '/coop/mes-beneficiaires' }}
          >
            Annuler
          </Button>
        </div>
      </form>
    </form.AppForm>
  )
}

export default UploadBeneficiaireFileForm
