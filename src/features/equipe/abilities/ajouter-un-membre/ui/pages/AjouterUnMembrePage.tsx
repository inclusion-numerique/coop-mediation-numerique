import { hrefDuCoordinateurEnAdministration } from '@/features/equipe/ui/presenters/liens.presenter'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  AdministrationBreadcrumbs,
  AdministrationTitle,
  CoopPageContainer,
} from '@/libraries/ui/components'
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
