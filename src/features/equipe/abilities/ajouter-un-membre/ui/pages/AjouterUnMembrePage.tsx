import CoopPageContainer from '@/app/coop/CoopPageContainer'
import SkipLinksPortal from '@/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libs/ui/administration/AdministrationTitle'
import { contentId } from '@/utils/skipLinks'
import type { EquipeAComplementer } from '../../domain'
import { AjouterUnMembre } from '../AjouterUnMembre'

export const AjouterUnMembrePage = ({
  equipe,
}: {
  equipe: EquipeAComplementer
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      currentPage="Ajouter un membre"
      parents={[
        {
          label: 'Utilisateurs',
          linkProps: { href: '/administration/utilisateurs' },
        },
        {
          label: equipe.nom,
          linkProps: {
            href: `/administration/utilisateurs/${equipe.utilisateurId}`,
          },
        },
      ]}
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-user-add-line">
        Ajouter un membre à l’équipe de {equipe.nom}
      </AdministrationTitle>
      <AjouterUnMembre equipe={equipe} />
    </main>
  </CoopPageContainer>
)
