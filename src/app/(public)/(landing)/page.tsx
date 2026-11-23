import { redirect } from 'next/navigation'
import { getHomepage } from '@/features/authentification/domain/page-d-accueil'
import { getSessionUser } from '@/features/authentification/implementations/session/getSessionUser'
import { isUserInscriptionEnCours } from '@/features/inscription/domain/inscription-en-cours'
import { rdvWebsiteLink } from '@/features/rdvsp/ui/liens'
import { LandingPage } from '@/features/vitrine/abilities/presenter-la-coop/ui/pages/LandingPage'

const Page = async () => {
  const user = await getSessionUser()
  if (user && !isUserInscriptionEnCours(user)) {
    redirect(getHomepage(user))
    return null
  }

  return <LandingPage lienRdvServicePublic={rdvWebsiteLink} />
}

export default Page
