'use client'

import { createToast } from '@app/ui/toast/createToast'
import { creerUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/creer-lieu-activite.action'
import { getDepartementCodeFromCodeInsee } from '@app/web/utils/getDepartementFromCodeInsee'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { CreerLieuActivitePageContent } from '../../../formulaire/CreerLieuActivitePageContent'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '../../../formulaire/creerLieuActiviteFormData'

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

/** Création d'un lieu d'activité depuis la gestion des lieux d'un médiateur. */
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
      `/coop/mon-reseau/${getDepartementCodeFromCodeInsee(adresseBan.codeInsee)}/lieux/${resultat.data.id}`,
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
