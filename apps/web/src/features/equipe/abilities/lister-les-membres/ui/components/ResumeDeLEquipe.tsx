import { pluriel } from '@app/web/libraries/pluriel'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import type { StatistiquesEquipe } from '../../domain'
import EquipeVide from './EquipeVide'
import MonEquipeHeader from './MonEquipeHeader'

export const ResumeDeLEquipe = ({
  statistiques: { total, actifs, inactifs, invitations },
}: {
  statistiques: Pick<
    StatistiquesEquipe,
    'total' | 'actifs' | 'inactifs' | 'invitations'
  >
}) =>
  total === 0 ? (
    <EquipeVide withHeader />
  ) : (
    <>
      <MonEquipeHeader />
      <div className="fr-flex fr-flex-gap-6v fr-direction-lg-row fr-direction-column">
        <div className="fr-background-alt--brown-caramel fr-border-radius--16 fr-p-6v fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-1 fr-flex-gap-3v">
          <div className="fr-flex fr-justify-content-space-between fr-direction-column">
            <div className="fr-text--lg fr-text--semi-bold fr-mb-2v">
              {total} {pluriel(total, 'Membre', 'Membres')} dans votre équipe
            </div>
            <div className="fr-text--sm fr-mb-0">
              dont {actifs} {pluriel(actifs, 'actif', 'actifs')} · {inactifs}{' '}
              {pluriel(inactifs, 'inactif', 'inactifs')}
            </div>
            {invitations > 0 && (
              <Badge severity="info" noIcon className="fr-mt-2w" small>
                {invitations}{' '}
                {pluriel(invitations, 'invitation', 'invitations')} à rejoindre
                votre équipe toujours en attente
              </Badge>
            )}
          </div>
          <div>
            <Button
              priority="secondary"
              linkProps={{ href: '/coop/mon-equipe' }}
              iconId="fr-icon-arrow-right-line"
              iconPosition="right"
            >
              Voir mon équipe
            </Button>
          </div>
        </div>
      </div>
    </>
  )
