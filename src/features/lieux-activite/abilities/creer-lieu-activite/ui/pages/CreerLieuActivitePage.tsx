'use client'

import { useRouter } from 'next/navigation'
import { CreerLieuActivitePageContent } from '@/features/lieux-activite/abilities/creer-lieu-activite/ui/components/CreerLieuActivitePageContent'
import {
  type CreerLieuActiviteFormData,
  donneesDeCreation,
} from '@/features/lieux-activite/ui/forms/creer-lieu-activite.form-data'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { inject } from '@/libraries/nextjs/injection'
import { CoopBreadcrumbs } from '@/libraries/ui/components'
import { createToast } from '@/libraries/ui/toast'
import { hrefDuLieu } from '../../../../ui/presenters/href-du-lieu.presenter'
import { CREER_UN_LIEU_ACTIVITE_ACTION_KEY } from '../../action/creer-lieu-activite.key'

const erreurEnregistrement = () =>
  createToast({
    priority: 'error',
    message:
      'Une erreur est survenue lors de l’enregistrement, veuillez réessayer ultérieurement.',
  })

const CreerLieuActivitePage = ({
  lienDePriseDeRendezVous,
}: {
  lienDePriseDeRendezVous: string
}) => {
  const router = useRouter()

  const onCreer = async (value: CreerLieuActiviteFormData) => {
    const { adresseBan, ...data } = donneesDeCreation(value)
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
                  linkProps: { href: '/coop/lieux-activite' },
                },
              ]}
              currentPage="Créer un lieu d'activité"
            />
          }
          retourHref="/coop/lieux-activite"
          onCreer={onCreer}
          lienDePriseDeRendezVous={lienDePriseDeRendezVous}
        />
      </main>
    </>
  )
}

export default CreerLieuActivitePage
