import { ajouterUnMembreAction } from '@app/web/app/_actions/equipe/ajouter-un-membre.action'
import { rechercherDesMediateursAAjouterAction } from '@app/web/app/_actions/equipe/rechercher-des-mediateurs-a-ajouter.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { equipeAComplementer } from '@app/web/features/equipe/abilities/ajouter-un-membre'
import { AJOUTER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.key'
import { RECHERCHER_DES_MEDIATEURS_A_AJOUTER_ACTION_KEY } from '@app/web/features/equipe/abilities/ajouter-un-membre/action/rechercher-des-mediateurs-a-ajouter.key'
import { AjouterUnMembrePage } from '@app/web/features/equipe/abilities/ajouter-un-membre/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle("Coordinateur - Ajouter un membre à l'équipe"),
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
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
