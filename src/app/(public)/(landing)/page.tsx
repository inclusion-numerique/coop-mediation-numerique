import { redirect } from 'next/navigation'
import { estMain } from '@/configuration/projet'
import { pageDAccueil } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/middlewares/with-utilisateur-de-la-session'
import { inscriptionEnCours } from '@/features/inscription/domain/inscription-en-cours'
import { lienDuSiteRdv } from '@/features/rdvsp/ui/presenters/liens.presenter'
import { LandingPage } from '@/features/vitrine/ui/pages/LandingPage'

const Page = async () => {
  const user = await getSessionUser()
  if (user && !inscriptionEnCours(user)) {
    redirect(pageDAccueil(user))
    return null
  }

  return <LandingPage lienRdvServicePublic={lienDuSiteRdv(estMain())} />
}

export default Page
