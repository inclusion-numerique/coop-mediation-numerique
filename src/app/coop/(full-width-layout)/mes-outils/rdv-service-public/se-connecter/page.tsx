import { metadataTitle } from '@/configuration/projet'
import SeConnecterPage from '@/features/rdvsp/abilities/connecter-compte-rdv/ui/pages/SeConnecterPage'
import { lienDeConnexionARdvServicePublic } from '@/features/rdvsp/implementations/oauth/rdvsp-oauth-callback.client'

export const metadata = {
  title: metadataTitle('Se connecter à RDV Service Public'),
}

const Page = () => (
  <SeConnecterPage lienDeConnexion={lienDeConnexionARdvServicePublic()} />
)

export default Page
