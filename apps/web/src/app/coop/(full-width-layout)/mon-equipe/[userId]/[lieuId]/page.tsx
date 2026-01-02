import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { LieuActivitePageContent } from '@app/web/features/lieux-activite/components/LieuActivitePageContent'
import { getLieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import { prismaClient } from '@app/web/prismaClient'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'

const LieuActiviteDetailPage = async (props: {
  params: Promise<{ userId: string; lieuId: string }>
}) => {
  const params = await props.params
  await authenticateUser(`/connexion?suivant=/lieux-activite/${params.lieuId}`)

  const mediateur = await prismaClient.mediateur.findUnique({
    where: { userId: params.userId },
    select: { user: { select: { name: true } } },
  })

  const data = await getLieuActivitePageData({ id: params.lieuId })

  if (!data) {
    redirect('/coop/lieux-activite')
  }

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container ">
        <main id={contentId} className="fr-container fr-flex">
          <LieuActivitePageContent
            currentPath={`/coop/mon-equipe/${params.userId}/${params.lieuId}`}
            data={data}
            breadcrumbs={{
              currentPage: data.structure.nom,
              parents: [
                {
                  label: 'Mon équipe',
                  linkProps: { href: '/coop/mon-equipe/' },
                },
                {
                  label: mediateur?.user.name ?? 'Médiateur',
                  linkProps: { href: `/coop/mon-equipe/${params.userId}` },
                },
              ],
            }}
            backButton={{
              label: `Retour à la fiche de ${mediateur?.user.name}`,
              href: `/coop/mon-equipe/${params.userId}`,
            }}
          />
        </main>
      </div>
    </>
  )
}

export default LieuActiviteDetailPage
