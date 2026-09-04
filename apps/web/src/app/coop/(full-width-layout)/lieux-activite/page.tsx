import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import {
  listerMesLieuxActivite,
  TriDesLieux,
} from '@app/web/features/lieux-activite/abilities/lister-mes-lieux-activite'
import { MesLieuxActivitePage } from '@app/web/features/lieux-activite/abilities/lister-mes-lieux-activite/ui'
import { BoutonDeRetrait } from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import LieuCard from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuCard'
import { contentId } from '@app/web/utils/skipLinks'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

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

  const lieux = await listerMesLieuxActivite({
    mediateurId: MediateurId(user.mediateur.id),
    tri: TriDesLieux(tri),
  })

  return (
    <>
      <SkipLinksPortal />
      <div id={contentId}>
        <MesLieuxActivitePage
          lieux={lieux}
          carte={({ id, lieuInclusion }) => (
            <LieuCard
              key={id}
              lieu={lieuInclusion}
              retrait={
                <BoutonDeRetrait
                  mediateurId={mediateur.id}
                  structureId={lieuInclusion.id}
                  variant="lieu"
                  mediateurDisplayName=""
                  structureNom={lieuInclusion.nom}
                  derniereActiviteDate={null}
                />
              }
              showActionButtons
            />
          )}
          mediateurEstVisible={user.mediateur.isVisible}
          entete={<CoopBreadcrumbs currentPage="Mes lieux d'activités" />}
        />
      </div>
    </>
  )
}

export default LieuActiviteListPage
