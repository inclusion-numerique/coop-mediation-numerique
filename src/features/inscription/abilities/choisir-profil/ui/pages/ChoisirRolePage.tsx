'use client'

import { useSelector } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import {
  type ChoisirProfilFormData,
  choisirProfilFormShape,
} from '@/features/inscription/abilities/choisir-profil/action/choisir-profil.validation'
import {
  type EtapeDInscription,
  profilInscriptionLabels,
  type Role,
} from '@/features/inscription/domain'
import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'
import type { DefaultValues } from '@/libraries/formulaire'
import {
  handleSubmit,
  useAppForm,
  useHydrated,
} from '@/libraries/formulaire/hooks'
import type { ServerActionResult } from '@/libraries/nextjs'
import { LogoCoop } from '@/libraries/ui/components'
import { createToast } from '@/libraries/ui/toast'

type EnregistrerProfil = (data: ChoisirProfilFormData) => Promise<
  ServerActionResult<{
    role: Role
    etapeSuivante: EtapeDInscription
  }>
>

const roleOptions = [
  {
    label: profilInscriptionLabels.Mediateur,
    value: 'Mediateur',
    extra: {
      illustration: '/images/iconographie/profil-mediateur.svg',
      hintText:
        'Accompagnez vos bénéficiaires et valorisez votre activité de médiation numérique.',
    },
  },
  {
    label: profilInscriptionLabels.Coordinateur,
    value: 'Coordinateur',
    extra: {
      illustration: '/images/iconographie/profil-coordinateur.svg',
      hintText: 'Suivez les activités de médiation numérique de votre équipe.',
    },
  },
]

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

const defaultValues: DefaultValues<ChoisirProfilFormData> = {
  cguAcceptee: false,
}

const ChoisirRolePage = ({ save }: { save: EnregistrerProfil }) => {
  const router = useRouter()

  const form = useAppForm({
    validators: { onSubmit: choisirProfilFormShape },
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const result = await save(choisirProfilFormShape.parse(value))

        if (!result.success) {
          erreurEnregistrement()
          return
        }

        router.push(cheminDeLEtape(result.data.etapeSuivante))
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting)
  const isHydrated = useHydrated()

  const isPending = isSubmitting || !isHydrated

  return (
    <form.AppForm>
      <div className="fr-border fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey fr-mt-32v">
        <div className="fr-flex fr-direction-column fr-align-items-center">
          <LogoCoop />
          <h1 className="fr-h3 fr-text-title--blue-france fr-mt-10v fr-mb-2v fr-text--center">
            Inscription à La Coop de la médiation numérique
          </h1>
          <p className="fr-text--xl fr-mb-10v fr-text--center">
            Choisissez votre rôle afin de profiter d’un espace adapté à vos
            besoins.
          </p>
        </div>
        <form onSubmit={handleSubmit(form)}>
          <form.AppField name="role">
            {(field) => (
              <field.RadioButtons
                classes={{
                  content: 'fr-display-grid fr-grid--1x2 fr-grid-gap-2v',
                }}
                isPending={isPending}
                options={roleOptions}
                legend="Choisissez votre rôle"
              />
            )}
          </form.AppField>
          <hr className="fr-separator-6v fr-mb-10v" />
          <form.AppField name="cguAcceptee">
            {(field) => (
              <field.Checkbox
                isPending={isPending}
                isTiled={false}
                options={[
                  {
                    label: (
                      <>
                        J’ai lu et j’accepte les{' '}
                        <a
                          href="/cgu"
                          className="fr-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          conditions générales d’utilisation du service
                        </a>
                      </>
                    ),
                    value: true,
                  },
                ]}
              />
            )}
          </form.AppField>
          <div className="fr-btns-group fr-btns-group--lg fr-mt-6v">
            <form.Submit isPending={isPending}>Continuer</form.Submit>
          </div>
        </form>
      </div>
    </form.AppForm>
  )
}

export default ChoisirRolePage
