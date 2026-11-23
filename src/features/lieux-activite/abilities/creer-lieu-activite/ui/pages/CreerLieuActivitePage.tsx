'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { CreerLieuActivitePageContent } from '@/features/lieux-activite/ui/components/creation/CreerLieuActivitePageContent'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@/features/lieux-activite/ui/forms/creer-lieu-activite.form-data'
import { inject } from '@/libraries/nextjs/injection/client'
import { createToast } from '@/libraries/ui/toast/createToast'
import { hrefDuLieu } from '../../../../ui/presenters/href-du-lieu'
import { CREER_UN_LIEU_ACTIVITE_ACTION_KEY } from '../../action/creer-lieu-activite.key'

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

    const resultat = await inject(CREER_UN_LIEU_ACTIVITE_ACTION_KEY)({
      ...data,
      adresseBan,
    })

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
