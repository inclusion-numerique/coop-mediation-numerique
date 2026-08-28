'use client'

import { createToast } from '@app/ui/toast/createToast'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { trpc } from '@app/web/trpc'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { CreerLieuActivitePageContent } from './CreerLieuActivitePageContent'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from './creerLieuActiviteFormData'

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

/** Création d'un lieu d'activité depuis la gestion des lieux d'un médiateur. */
const CreerLieuActivitePage = ({ contentTop }: { contentTop?: ReactNode }) => {
  const router = useRouter()
  const mutation = trpc.lieuActivite.create.useMutation()

  const onCreer = async (value: CreerLieuActiviteFormData) => {
    const { adresseBan, ...data } = toCreerLieuData(value)
    if (adresseBan == null) return

    try {
      const lieu = await mutation.mutateAsync({ ...data, adresseBan })

      createToast({
        priority: 'success',
        message: 'Le lieu d’activité a bien été créé.',
      })

      router.push(
        `/coop/mon-reseau/${getDepartementCodeFromCodeInsee(adresseBan.codeInsee)}/lieux/${lieu.id}`,
      )
    } catch {
      erreurEnregistrement()
    }
  }

  return (
    <CreerLieuActivitePageContent
      contentTop={contentTop}
      retourHref="/coop/lieux-activite"
      onCreer={onCreer}
    />
  )
}

export default withTrpc(CreerLieuActivitePage)
