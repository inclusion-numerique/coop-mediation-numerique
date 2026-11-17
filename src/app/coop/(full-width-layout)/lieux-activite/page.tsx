import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { reglerMaVisibiliteCartoAction } from '@/app/_actions/mediateurs/regler-ma-visibilite-carto.action'
import CoopBreadcrumbs from '@/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateUser } from '@/auth/authenticateUser'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import { listerLesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur'
import { MesLieuxActivitePage } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/ui'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import {
  BoutonDeRetrait,
  ModaleDeRetrait,
} from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui'
import { LieuId } from '@/features/lieux-activite/domain/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/mediateur-id'
import { TriDesLieux } from '@/features/lieux-activite/domain/tri-des-lieux'
import {
  hrefDuLieuEnListe,
  LieuActiviteCard,
} from '@/features/lieux-activite/ui'
import { REGLER_MA_VISIBILITE_CARTO_ACTION_KEY } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.key'
import { MaVisibiliteCarto } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/ui'
import { ClientBinder } from '@/libs/injection/client-binder'
import { contentId } from '@/utils/skipLinks'

export const metadata: Metadata = {
  title: metadataTitle('Mes lieux d’activités'),
}

const LieuActiviteListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ tri?: string }>
}) => {
  const { tri } = await searchParams
  const user = await authenticateUser()

  if (user.mediateur == null) return redirect('/')

  const mediateur = user.mediateur

  const lieux = await listerLesLieuxDuMediateur({
    mediateurId: MediateurId(user.mediateur.id),
    tri: TriDesLieux(tri),
  })

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder
        bind={REGLER_MA_VISIBILITE_CARTO_ACTION_KEY}
        to={reglerMaVisibiliteCartoAction}
      >
        <SkipLinksPortal />
        <div id={contentId}>
          <MesLieuxActivitePage
            lieux={lieux}
            carte={({ id, lieuInclusion }) => (
              <LieuActiviteCard
                key={id}
                lieu={lieuInclusion}
                href={hrefDuLieuEnListe(lieuInclusion)}
                retrait={
                  <BoutonDeRetrait
                    mediateurId={MediateurId(mediateur.id)}
                    structureId={LieuId(lieuInclusion.id)}
                    variant="lieu"
                    mediateurDisplayName=""
                    structureNom={lieuInclusion.nom}
                    derniereActiviteDate={null}
                  />
                }
                showActionButtons
              />
            )}
            visibilite={<MaVisibiliteCarto visible={mediateur.isVisible} />}
            modaleDeRetrait={<ModaleDeRetrait />}
            entete={<CoopBreadcrumbs currentPage="Mes lieux d'activités" />}
          />
        </div>
      </ClientBinder>
    </ClientBinder>
  )
}

export default LieuActiviteListPage
