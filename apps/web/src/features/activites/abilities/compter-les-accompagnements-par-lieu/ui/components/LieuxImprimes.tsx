import { nombreAccompagnementParLieuColor } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareList } from '@app/web/libs/statistiques/QuantifiedShareList'
import type { parLieuPresentes } from '../par-lieu.presenter'

export const LieuxImprimes = ({
  structures,
}: {
  structures: ReturnType<typeof parLieuPresentes>
}) => (
  <>
    <h3 className="fr-h5 fr-mb-2v fr-mt-6v">
      Nombre d’accompagnements par lieux
    </h3>
    <small role="note" className="fr-mb-6v fr-display-block">
      Répartition des accompagnements enregistrées par lieu d’activité.
    </small>
    <QuantifiedShareList
      order="desc"
      quantifiedShares={structures}
      colors={[nombreAccompagnementParLieuColor]}
    />
  </>
)
