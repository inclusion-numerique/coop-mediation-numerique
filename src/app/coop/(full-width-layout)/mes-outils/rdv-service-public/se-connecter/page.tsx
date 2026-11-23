import { metadataTitle } from '@/configuration/projet/metadataTitle'
import SeConnecterPage from '@/features/rdvsp/abilities/connecter-compte-rdv/ui/pages/SeConnecterPage'
import { lienDeConnexionARdvServicePublic } from '@/features/rdvsp/implementations/oauth/oauth'

export const metadata = {
  title: metadataTitle('Se connecter à RDV Service Public'),
}

const Page = () => (
  <SeConnecterPage lienDeConnexion={lienDeConnexionARdvServicePublic()} />
)

export default Page
