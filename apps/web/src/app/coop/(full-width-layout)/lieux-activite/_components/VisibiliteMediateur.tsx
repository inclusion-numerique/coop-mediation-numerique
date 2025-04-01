'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import ToggleSwitch from '@codegouvfr/react-dsfr/ToggleSwitch'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const VisibiliteMediateur = ({ isVisible }: { isVisible: boolean }) => {
  const router = useRouter()
  const mutation = trpc.mediateur.setVisibility.useMutation()

  const handleChange = async () => {
    try {
      await mutation.mutateAsync({ isVisible: !isVisible })

      router.refresh()
      createToast({
        priority: 'success',
        message: (
          <>
            Vos informations{' '}
            <strong>
              {isVisible ? 'ne sont pas visibles' : 'sont visibles'}
            </strong>{' '}
            sur la cartographie
          </>
        ),
      })
    } catch {
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de la configuration de la visibilité de vos informations sur la cartographie',
      })
    }
  }

  return (
    <div className="fr-border fr-border-radius--8 fr-p-4w fr-mb-4v">
      <div className="fr-flex fr-align-items-center fr-flex-gap-2v fr-mb-4v">
        <Image
          width={24}
          height={24}
          src="/images/services/cartographie-logo.svg"
          alt=""
        />
        <h2 className="fr-text--xs fr-text--bold fr-text--uppercase fr-mb-0">
          Visibilité sur La cartographie des conseillers numériques
        </h2>
      </div>
      <div className="fr-mb-4v">
        <ToggleSwitch
          inputTitle="Visibilité du lieu d’activité sur la cartographie"
          disabled={mutation.isPending}
          checked={isVisible}
          label={
            <span className="fr-my-auto">
              Rendre mon profil visible sur la cartographie des conseillers
              numériques dans mes lieux d'activités.
            </span>
          }
          labelPosition="left"
          showCheckedHint
          onChange={handleChange}
        />
      </div>
      <span className="fr-text--sm fr-text-mention--grey">
        Informations de votre profil qui seront visibles par les usagers&nbsp;:
        <br />
        Nom, Prénom, Adresse email, Numéro de téléphone
      </span>
    </div>
  )
}

export default withTrpc(VisibiliteMediateur)
