'use client'

import { useRouter } from 'next/navigation'
import { CreerLieuActivitePageContent } from '@/features/lieux-activite/abilities/creer-lieu-activite/ui/components/CreerLieuActivitePageContent'
import {
  type CreerLieuActiviteFormData,
  toCreerLieuData,
} from '@/features/lieux-activite/ui/forms/creer-lieu-activite.form-data'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import { inject } from '@/libraries/nextjs/injection/client'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import { createToast } from '@/libraries/ui/toast/createToast'
import { hrefDuLieu } from '../../../../ui/presenters/href-du-lieu.presenter'
import { CREER_UN_LIEU_ACTIVITE_ACTION_KEY } from '../../action/creer-lieu-activite.key'

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

const CreerLieuActivitePage = () => {
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
    <>
      <SkipLinksPortal />
      <main id={contentId}>
        <CreerLieuActivitePageContent
          contentTop={
            <CoopBreadcrumbs
              parents={[
                {
                  label: `Mes lieux d'activités`,
                  linkProps: { href: '/coop/lieux-activite/' },
                },
              ]}
              currentPage="Créer un lieu d'activité"
            />
          }
          retourHref="/coop/lieux-activite"
          onCreer={onCreer}
        />
      </main>
    </>
  )
}

export default CreerLieuActivitePage
