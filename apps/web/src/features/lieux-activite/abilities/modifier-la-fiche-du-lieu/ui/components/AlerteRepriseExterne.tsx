import { formatDate } from '@app/web/utils/formatDate'
import Alert from '@codegouvfr/react-dsfr/Alert'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'

/**
 * Prévient le médiateur qu'un autre producteur a repris sa fiche après lui.
 *
 * Sans elle, l'écran annonce une mise à jour dont ni la date ni les valeurs ne
 * sont les siennes, et rien ne le lui dit : il croit relire ce qu'il a saisi.
 * Les deux dates sont montrées ensemble, parce que c'est leur écart qui fait
 * l'information — « on a écrit après vous », et non « la fiche a bougé ».
 *
 * Rare, et c'est voulu : 29 lieux sur 12 765 aujourd'hui. Une alerte qui
 * s'afficherait partout ne serait plus lue nulle part.
 */
export const AlerteRepriseExterne = ({
  reprise,
}: {
  reprise: NonNullable<FicheAffichee['repriseExterne']>
}) => (
  <Alert
    className="fr-mb-4v"
    severity="info"
    small
    description={
      <>
        <strong>{reprise.source}</strong> a modifié cette fiche le{' '}
        {formatDate(reprise.le, 'dd.MM.yyyy')}.
      </>
    }
  />
)
