'use client'

import CheckboxFormField from '@app/ui/components/Form/CheckboxFormField'
import RadioFormField from '@app/ui/components/Form/RadioFormField'
import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import RichCardLabel, {
  richCardFieldsetElementClassName,
} from '@app/web/components/form/RichCardLabel'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import {
  ChoisirProfilEtAccepterCguData,
  ChoisirProfilEtAccepterCguValidation,
} from '@app/web/features/utilisateurs/use-cases/registration/ChoisirProfilEtAccepterCguValidation'
import {
  profileInscriptionConseillerNumeriqueOptionsWithExtras,
  profileInscriptionOptionsWithExtras,
} from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import { trpc } from '@app/web/trpc'
import Button from '@codegouvfr/react-dsfr/Button'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import styles from './ProfilEtCguForm.module.css'

const ProfilEtCguForm = ({ userId }: { userId: string }) => {
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
    router.push(`/inscription/identification`)
    router.refresh()

    try {
      await mutation.mutateAsync(data)
    } catch {
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
      })
      mutation.reset()
    }
  }

  const isLoading = mutation.isPending || mutation.isSuccess

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <h2 className="fr-h6 fr-mb-4v">Dispositif Conseiller Numérique</h2>
      <RadioFormField
        control={control}
        path="profil"
        options={profileInscriptionConseillerNumeriqueOptionsWithExtras}
        disabled={isLoading}
        components={{
          label: RichCardLabel,
          labelProps: { paddingX: 16 },
        }}
        classes={{
          radioGroup: styles.radioGroup,
          fieldsetElement: richCardFieldsetElementClassName,
        }}
      />
      <hr className="fr-separator-6v fr-mb-10v" />
      <h2 className="fr-h6 fr-mb-4v">Hors dispositif Conseiller Numérique</h2>
      <RadioFormField
        control={control}
        path="profil"
        options={profileInscriptionOptionsWithExtras}
        disabled={isLoading}
        startIndex={2}
        components={{
          label: RichCardLabel,
          labelProps: { paddingX: 16 },
        }}
        classes={{
          radioGroup: styles.radioGroup,
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
          label: styles.cguLabel,
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
        <Link href="/" className="fr-link fr-text--center">
          Revenir plus tard
        </Link>
      </div>
    </form>
  )
}

export default withTrpc(ProfilEtCguForm)
