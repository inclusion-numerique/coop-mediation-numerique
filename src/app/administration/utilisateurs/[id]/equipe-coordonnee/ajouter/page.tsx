import { notFound } from 'next/navigation'
import { ajouterUnMembreAction } from '@/app/_actions/equipe/ajouter-un-membre.action'
import { rechercherDesMediateursAAjouterAction } from '@/app/_actions/equipe/rechercher-des-mediateurs-a-ajouter.action'
import { metadataTitle } from '@/configuration/projet/metadata-title'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { AJOUTER_UN_MEMBRE_ACTION_KEY } from '@/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.key'
import { RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY } from '@/features/equipe/abilities/ajouter-un-membre/action/rechercher-des-mediateurs-a-ajouter.key'
import { equipeAComplementer } from '@/features/equipe/abilities/ajouter-un-membre/implementations/prisma/mediateurs-a-ajouter.query'
import { AjouterUnMembrePage } from '@/features/equipe/abilities/ajouter-un-membre/ui/pages/AjouterUnMembrePage'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle("Coordinateur - Ajouter un membre à l'équipe"),
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
  await authenticateAdmin()
  const { id } = await props.params
  const equipe = await equipeAComplementer(id)
  if (equipe === null) notFound()

  return (
    <ClientBinder
      bind={AJOUTER_UN_MEMBRE_ACTION_KEY}
      to={ajouterUnMembreAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY}
        to={rechercherDesMediateursAAjouterAction}
      >
        <AjouterUnMembrePage equipe={equipe} />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
