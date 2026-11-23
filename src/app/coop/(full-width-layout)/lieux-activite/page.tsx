import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { retirerUnMediateurDuLieuAction } from '@/app/_actions/lieux-activite/retirer-un-mediateur-du-lieu.action'
import { reglerMaVisibiliteCartoAction } from '@/app/_actions/mediateurs/regler-ma-visibilite-carto.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user'
import { listerLesLieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/implementations/prisma/lister-les-lieux-du-mediateur.query'
import { MesLieuxActivitePage } from '@/features/lieux-activite/abilities/lister-les-lieux-du-mediateur/ui/pages/MesLieuxActivitePage'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.key'
import { default as BoutonDeRetrait } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui/BoutonDeRetrait'
import { default as ModaleDeRetrait } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui/ModaleDeRetrait'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { TriDesLieux } from '@/features/lieux-activite/domain/tri-des-lieux'
import { hrefDuLieuEnListe } from '@/features/lieux-activite/ui/href-du-lieu'
import { default as LieuActiviteCard } from '@/features/lieux-activite/ui/LieuActiviteCard'
import { REGLER_MA_VISIBILITE_CARTO_ACTION_KEY } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/action/regler-la-visibilite-carto.key'
import { MaVisibiliteCarto } from '@/features/mediateurs/abilities/regler-la-visibilite-carto/ui/MaVisibiliteCarto'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
      bind={RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY}
      to={retirerUnMediateurDuLieuAction}
    >
      <ClientBinder
        bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
        to={rechercherUnLieuActiviteAction}
      >
        <ClientBinder
          bind={REGLER_MA_VISIBILITE_CARTO_ACTION_KEY}
          to={reglerMaVisibiliteCartoAction}
        >
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
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default LieuActiviteListPage
