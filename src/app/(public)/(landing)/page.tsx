import { redirect } from 'next/navigation'
import { pageDAccueil } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/implementations/session/session-user.query'
import { inscriptionEnCours } from '@/features/inscription/domain/inscription-en-cours'
import { rdvWebsiteLink } from '@/features/rdvsp/ui/presenters/liens.presenter'
import { LandingPage } from '@/features/vitrine/ui/pages/LandingPage'

const Page = async () => {
  const user = await getSessionUser()
  if (user && !inscriptionEnCours(user)) {
    redirect(pageDAccueil(user))
    return null
  }

  return <LandingPage lienRdvServicePublic={rdvWebsiteLink} />
}

export default Page
