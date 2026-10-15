import { ajouterUnMembreAction } from '@app/web/app/_actions/equipe/ajouter-un-membre.action'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { AJOUTER_UN_MEMBRE_ACTION_KEY } from '@app/web/features/equipe/abilities/ajouter-un-membre/action/ajouter-un-membre.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
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
              label: data.coordinateurUser.name ?? 'Coordinateur',
              linkProps: { href: `/administration/utilisateurs/${id}` },
            },
          ]}
        />
        <main id={contentId}>
          <AdministrationTitle icon="fr-icon-user-add-line">
            Ajouter un membre à l’équipe de {data.coordinateurUser.name}
          </AdministrationTitle>
          <ClientBinder
            bind={AJOUTER_UN_MEMBRE_ACTION_KEY}
            to={ajouterUnMembreAction}
          >
            <AdministrationAjoutMembreEquipe data={data} />
          </ClientBinder>
        </main>
      </CoopPageContainer>
    </>
  )
}

export default Page
