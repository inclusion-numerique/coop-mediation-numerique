import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { quitterUneEquipeAction } from '@/app/_actions/equipe/quitter-une-equipe.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticateUser'
import { BoutonExporter } from '@/features/equipe/abilities/exporter-les-membres/ui'
import {
  estMembreActif,
  listerLesMembres,
} from '@/features/equipe/abilities/lister-les-membres'
import {
  EquipeListePage,
  type ParametresDeLaListe,
  requeteDeLaListe,
} from '@/features/equipe/abilities/lister-les-membres/ui'
import { QUITTER_UNE_EQUIPE_ACTION_KEY } from '@/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.key'
import { BoutonQuitterLEquipe } from '@/features/equipe/abilities/quitter-une-equipe/ui'
import { CoordinateurId, MediateurId } from '@/features/equipe/domain'
import { gestionnaireDe } from '@/features/equipe/implementations/session'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Mon équipe'),
}

const Page = async (props: {
  params: Promise<{ coordinateurId: string }>
  searchParams: Promise<ParametresDeLaListe>
}) => {
  const searchParams = await props.searchParams
  const { coordinateurId: parametre } = await props.params
  const user = await authenticateUser()

  const coordinateurId = CoordinateurId.safe(parametre)
  if (coordinateurId === null) redirect('/')

  const membreActifDeLEquipe = await estMembreActif({
    mediateurId: user.mediateur == null ? null : MediateurId(user.mediateur.id),
    coordinateurId,
  })

  const membres = await listerLesMembres({
    coordinateurId,
    lecteur: { gestionnaire: gestionnaireDe(user), membreActifDeLEquipe },
    ...requeteDeLaListe(searchParams),
  })

  if (!membres.success) redirect('/')

  return (
    <ClientBinder
      bind={QUITTER_UNE_EQUIPE_ACTION_KEY}
      to={quitterUneEquipeAction}
    >
      <EquipeListePage
        membres={membres.data}
        searchParams={searchParams}
        baseHref={`/coop/mes-equipes/${coordinateurId}`}
        enTete={
          membreActifDeLEquipe ? (
            <BoutonQuitterLEquipe coordinateurId={coordinateurId} />
          ) : null
        }
        exporter={
          <BoutonExporter
            coordinateurId={coordinateurId}
            parametres={searchParams}
          />
        }
        actions={null}
      />
    </ClientBinder>
  )
}

export default Page
