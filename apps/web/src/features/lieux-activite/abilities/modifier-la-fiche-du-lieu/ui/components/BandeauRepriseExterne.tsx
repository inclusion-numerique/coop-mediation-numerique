import { formatDate } from '@app/web/utils/formatDate'
import Notice from '@codegouvfr/react-dsfr/Notice'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import {
  BoutonDesDifferences,
  ModaleDesDifferences,
} from './ModaleDesDifferences'

export const BandeauRepriseExterne = ({
  lieuId,
  reprise,
}: {
  lieuId: string
  reprise: NonNullable<FicheAffichee['repriseExterne']>
}) => (
  <>
    <Notice
      className="fr-notice--flex fr-notice--titre-pleine-largeur fr-align-items-center fr-mb-4v"
      title={
        <>
          <span className="fr-flex-grow-1 fr-text--regular fr-text-default--grey">
            <b>{reprise.source}</b>
            {` a modifié cette fiche le ${formatDate(reprise.le, 'dd.MM.yyyy')}.`}
          </span>
          <BoutonDesDifferences />
        </>
      }
    />
    <ModaleDesDifferences lieuId={lieuId} differences={reprise.differences} />
  </>
)
