import { quitterUneEquipeAction } from '@app/web/app/_actions/equipe/quitter-une-equipe.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { BoutonExporter } from '@app/web/features/equipe/abilities/exporter-les-membres/ui'
import {
  estMembreActif,
  listerLesMembres,
} from '@app/web/features/equipe/abilities/lister-les-membres'
import {
  EquipeListePage,
  type ParametresDeLaListe,
} from '@app/web/features/equipe/abilities/lister-les-membres/ui'
import { QUITTER_UNE_EQUIPE_ACTION_KEY } from '@app/web/features/equipe/abilities/quitter-une-equipe/action/quitter-une-equipe.key'
import { BoutonQuitterLEquipe } from '@app/web/features/equipe/abilities/quitter-une-equipe/ui'
import {
  CoordinateurId,
  criteresEquipe,
  MediateurId,
} from '@app/web/features/equipe/domain'
import { gestionnaireDe } from '@app/web/features/equipe/implementation/session'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
    criteres: criteresEquipe(searchParams),
    page: toNumberOr(searchParams.page)(DEFAULT_PAGE),
    lignesParPage: toNumberOr(searchParams.lignes)(DEFAULT_PAGE_SIZE),
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
