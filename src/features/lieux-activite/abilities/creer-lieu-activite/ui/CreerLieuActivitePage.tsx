'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { creerUnLieuActiviteAction } from '@/app/_actions/lieux-activite/creer-lieu-activite.action'
import { CreerLieuActivitePageContent } from '@/features/lieux-activite/ui/creation/CreerLieuActivitePageContent'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@/features/lieux-activite/ui/creation/creer-lieu-activite.form-data'
import { createToast } from '@/libraries/ui/toast/createToast'
import { hrefDuLieu } from '../../../ui/href-du-lieu'

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

const CreerLieuActivitePage = ({ contentTop }: { contentTop?: ReactNode }) => {
  const router = useRouter()

  const onCreer = async (value: CreerLieuActiviteFormData) => {
    const { adresseBan, ...data } = toCreerLieuData(value)
    if (adresseBan == null) return

    const resultat = await creerUnLieuActiviteAction({ ...data, adresseBan })

    if (!resultat.success) {
      erreurEnregistrement()
      return
    }

    createToast({
      priority: 'success',
      message: 'Le lieu d’activité a bien été créé.',
    })

    router.push(
      hrefDuLieu({ id: resultat.data.id, codeInsee: adresseBan.codeInsee }),
    )
  }

  return (
    <CreerLieuActivitePageContent
      contentTop={contentTop}
      retourHref="/coop/lieux-activite"
      onCreer={onCreer}
    />
  )
}

export default CreerLieuActivitePage
