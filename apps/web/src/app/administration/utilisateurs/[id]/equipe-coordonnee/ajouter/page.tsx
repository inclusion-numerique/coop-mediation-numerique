import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import { notFound } from 'next/navigation'
import AdministrationAjoutMembreEquipe from './AdministrationAjoutMembreEquipe'
import { getAdministrationAjouterMembreEquipePageData } from './getAdministrationAjouterMembreEquipePageData'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle("Coordinateur - Ajouter un membre à l'équipe"),
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  const { id } = params
  const data = await getAdministrationAjouterMembreEquipePageData({ id })
  if (!data) {
    notFound()
  }

  return (
    <>
      <CoopPageContainer>
        <SkipLinksPortal />
        <AdministrationBreadcrumbs
          currentPage="Fusionner"
          parents={[
            {
              label: 'Utilisateurs',
              linkProps: { href: '/administration/utilisateurs' },
            },
            {
              label: data.coordinateur.name ?? 'Coordinateur',
              linkProps: { href: `/administration/utilisateurs/${id}` },
            },
          ]}
        />
        <main id={contentId}>
          <AdministrationTitle icon="fr-icon-user-add-line">
            Ajouter un membre à l’équipe de {data.coordinateur.name}
          </AdministrationTitle>
          <AdministrationAjoutMembreEquipe data={data} />
        </main>
      </CoopPageContainer>
    </>
  )
}

export default Page
