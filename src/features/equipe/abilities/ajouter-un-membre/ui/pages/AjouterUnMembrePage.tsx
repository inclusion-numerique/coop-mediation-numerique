import { hrefDuCoordinateurEnAdministration } from '@/features/equipe/ui/presenters/liens.presenter'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import AdministrationBreadcrumbs from '@/libraries/ui/components/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@/libraries/ui/components/administration/AdministrationTitle'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import type { EquipeAComplementer } from '../../domain'
import { AjouterUnMembre } from '../components/AjouterUnMembre'

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
            href: hrefDuCoordinateurEnAdministration(equipe.utilisateurId),
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
