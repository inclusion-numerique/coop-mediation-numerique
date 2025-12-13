'use client'

import CheckboxFormField from '@app/ui/components/Form/CheckboxFormField'
import RadioFormField from '@app/ui/components/Form/RadioFormField'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import LogoCoop from '@app/web/components/LogoCoop'
import RichCardLabel, {
  richCardFieldsetElementClassName,
  type RichCardOption,
} from '@app/web/components/form/RichCardLabel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import {
  type ChoisirProfilEtAccepterCguData,
  ChoisirProfilEtAccepterCguValidation,
} from '@app/web/features/utilisateurs/use-cases/registration/ChoisirProfilEtAccepterCguValidation'
import {
  getNextInscriptionStep,
  getStepPath,
} from '@app/web/features/inscription/inscriptionFlow'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

const roleOptions: RichCardOption<'Mediateur' | 'Coordinateur'>[] = [
  {
    label: 'Médiateur·rice numérique',
    hint: "Bénéficiez de fonctionnalités et d'outils utiles à votre pratique de la médiation numérique.",
    extra: {
      illustration: '/images/iconographie/profil-mediateur.svg',
    },
    value: 'Mediateur' as const,
  },
  {
    label: 'Coordinateur·rice',
    hint: 'Suivez les activités de médiation numérique de votre équipe.',
    extra: {
      illustration: '/images/iconographie/profil-coordinateur.svg',
    },
    value: 'Coordinateur' as const,
  },
]

const ChoisirRolePage = ({ userId }: { userId: string }) => {
  const form = useForm<ChoisirProfilEtAccepterCguData>({
    resolver: zodResolver(ChoisirProfilEtAccepterCguValidation),
    defaultValues: {
      userId,
    },
  })

  const { control } = form

  const mutation = trpc.inscription.choisirProfilEtAccepterCgu.useMutation()
  const router = useRouter()

  const onSubmit = async (data: ChoisirProfilEtAccepterCguData) => {
    try {
      await mutation.mutateAsync(data)

      // Navigate to next step
      const nextStep = getNextInscriptionStep({
        currentStep: 'choisir-role',
        flowType: 'withoutDataspace',
        profilInscription: data.profil,
        hasLieuxActivite: false,
      })

      if (nextStep) {
        router.push(getStepPath(nextStep))
      }
    } catch {
      createToast({
        priority: 'error',
        message:
          "Une erreur est survenue lors de l'enregistrement, veuillez réessayer ultérieurement.",
      })
      mutation.reset()
    }
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey fr-mt-32v">
      <div className="fr-flex fr-direction-column fr-align-items-center">
        <LogoCoop />
        <h1 className="fr-h3 fr-text-title--blue-france fr-mt-10v fr-mb-2v fr-text--center">
          Inscription à La Coop de la médiation numérique
        </h1>
        <p className="fr-text--xl fr-mb-10v fr-text--center">
          Choisissez votre rôle afin de profiter d'un espace adapté à vos
          besoins.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <RadioFormField
          control={control}
          path="profil"
          options={roleOptions}
          disabled={isLoading}
          components={{
            label: RichCardLabel,
            labelProps: { paddingX: 16 },
          }}
          classes={{
            radioGroup: 'fr-width-full fr-min-width-full fr-mb-4v',
            fieldsetElement: richCardFieldsetElementClassName,
          }}
        />

        <hr className="fr-separator-6v fr-mb-10v" />

        <CheckboxFormField
          path="cguAcceptee"
          label={
            <>
              J’ai lu et j’accepte les{' '}
              <a href="/cgu" className="fr-link" target="_blank">
                conditions générales d’utilisation du service
              </a>
            </>
          }
          classes={{
            label: 'fr-display-block',
          }}
          control={control}
          disabled={isLoading}
        />

        <div className="fr-btns-group fr-mt-10v">
          <Button type="submit" {...buttonLoadingClassname(isLoading)}>
            Continuer
          </Button>
        </div>

        <div className="fr-flex fr-direction-column fr-align-items-center fr-mt-10">
          <Link href="/inscription" className="fr-link fr-text--center">
            Revenir plus tard
          </Link>
        </div>
      </form>
    </div>
  )
}

export default withTrpc(ChoisirRolePage)
