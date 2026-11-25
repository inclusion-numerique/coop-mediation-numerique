import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import {
  BackButton,
  CoopBreadcrumbs,
  IconInSquare,
} from '@/libraries/ui/components'
import { AjouterDesLieuxActivitePage } from '../components/AjouterDesLieuxActivitePage'

export const AjouterDesLieuxPage = ({
  retourHref,
  lienDePriseDeRendezVous,
}: {
  retourHref: string
  lienDePriseDeRendezVous: string
}) => (
  <>
    <SkipLinksPortal />
    <div id={contentId}>
      <div className="fr-container fr-container--narrow">
        <CoopBreadcrumbs
          parents={[
            {
              label: `Mes lieux d'activités`,
              linkProps: { href: '/coop/lieux-activite' },
            },
          ]}
          currentPage={"Ajouter un lieu d'activité"}
        />
        <BackButton />
        <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey">
          <span className="fr-flex fr-direction-row fr-align-items-center fr-flex-gap-6v fr-mb-5w">
            <IconInSquare iconId="ri-home-office-line" />
            <h1 className="fr-h3 fr-page-title fr-m-0">
              Ajouter des lieux d’activités
            </h1>
          </span>
          <p className="fr-mb-6w">
            Recherchez dans les lieux déjà référencés. Si vous ne trouvez pas
            vos lieux d’activité, vous pouvez les créer afin d’être référencé.
          </p>
          <AjouterDesLieuxActivitePage
            issue={{ _tag: 'Ajout', retourHref }}
            lienDePriseDeRendezVous={lienDePriseDeRendezVous}
          />
        </div>
      </div>
    </div>
  </>
)
