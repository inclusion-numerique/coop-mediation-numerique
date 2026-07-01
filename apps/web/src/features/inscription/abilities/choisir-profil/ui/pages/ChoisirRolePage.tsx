'use client'

import { createToast } from '@app/ui/toast/createToast'
import LogoCoop from '@app/web/components/LogoCoop'
import {
  type ChoisirProfilFormData,
  choisirProfilFormShape,
} from '@app/web/features/inscription/abilities/choisir-profil'
import {
  getNextInscriptionStep,
  InscriptionFlowType,
  InscriptionStep,
  type ProfilInscription,
  profilInscriptionLabels,
} from '@app/web/features/inscription/domain'
import { stepPath } from '@app/web/features/inscription/ui/step-path'
import type { ServerActionResult } from '@app/web/libraries/nextjs'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { type DefaultValues, useAppForm } from '@app/web/libs/form/use-app-form'
import { useStore } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'

export type EnregistrerProfil = (
  data: ChoisirProfilFormData,
) => Promise<ServerActionResult<{ profil: ProfilInscription }>>

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

/**
 * Écran de choix du rôle. Composant client pur : la route lie la server action
 * `save` ; le formulaire reste découplé de l'ability. À la sauvegarde, on dérive
 * l'étape suivante du parcours via la machine à états du domaine.
 */
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

        const next = getNextInscriptionStep(InscriptionStep('choisir-role'), {
          flowType: InscriptionFlowType('withoutDataspace'),
          profil: result.data.profil,
          hasLieuxActivite: false,
          isConseillerNumerique: false,
        })

        if (next) router.push(stepPath(next))
      } catch {
        erreurEnregistrement()
      }
    },
  })

  const isPending = useStore(form.store, (state) => state.isSubmitting)

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
          <form.AppField name="profil">
            {(field) => (
              <field.RadioButtons
                className="fr-px-3v"
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
