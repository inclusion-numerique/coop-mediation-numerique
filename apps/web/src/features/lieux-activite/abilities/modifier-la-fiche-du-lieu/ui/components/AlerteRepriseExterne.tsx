import { formatDate } from '@app/web/utils/formatDate'
import Alert from '@codegouvfr/react-dsfr/Alert'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import {
  BoutonDesDifferences,
  ModaleDesDifferences,
} from './ModaleDesDifferences'

/**
 * Prévient le médiateur qu'un autre producteur a repris sa fiche après lui.
 *
 * Sans elle, l'écran annonce une mise à jour dont ni la date ni les valeurs ne
 * sont les siennes, et rien ne le lui dit : il croit relire ce qu'il a saisi.
 *
 * Le bouton n'apparaît que s'il y a quelque chose à arbitrer : une source peut
 * avoir horodaté un moissonnage sans rien changer, et proposer alors de
 * « voir les différences » mènerait à une modale vide.
 *
 * Rare, et c'est voulu : 29 lieux sur 12 765 aujourd'hui. Une alerte qui
 * s'afficherait partout ne serait plus lue nulle part.
 */
export const AlerteRepriseExterne = ({
  lieuId,
  reprise,
}: {
  lieuId: string
  reprise: NonNullable<FicheAffichee['repriseExterne']>
}) => (
  <>
    <Alert
      className="fr-mb-4v"
      severity="info"
      small
      description={
        <span className="fr-flex fr-direction-column fr-align-items-start fr-flex-gap-3v">
          <span>
            <strong>{reprise.source}</strong> a modifié cette fiche le{' '}
            {formatDate(reprise.le, 'dd.MM.yyyy')}.
          </span>
          {reprise.differences.length > 0 && <BoutonDesDifferences />}
        </span>
      }
    />
    {reprise.differences.length > 0 && (
      <ModaleDesDifferences lieuId={lieuId} differences={reprise.differences} />
    )}
  </>
)
