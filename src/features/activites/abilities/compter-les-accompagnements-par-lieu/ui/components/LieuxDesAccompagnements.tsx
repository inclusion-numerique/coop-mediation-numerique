import { nombreAccompagnementParLieuColor } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareList } from '@app/web/libs/statistiques/QuantifiedShareList'
import type { parLieuPresentes } from '../par-lieu.presenter'

export const LieuxDesAccompagnements = ({
  structures,
}: {
  structures: ReturnType<typeof parLieuPresentes>
}) =>
  structures.length === 0 || structures.every((s) => s.count === 0) ? (
    <div className="fr-text--center fr-background-alt--blue-france fr-p-12v fr-border-radius--8">
      Aucun accompagnement renseigné dans un de vos lieux d'activités
    </div>
  ) : (
    <>
      <div className="fr-text--bold fr-text--uppercase fr-text--xs fr-text-mention--grey fr-mb-2v">
        Lieux d'activités
      </div>
      <QuantifiedShareList
        limit={{
          showLabel: 'Voir tous les lieux',
          hideLabel: 'Réduire',
          count: 5,
        }}
        truncateLabel
        tooltipKey="lieux"
        order="desc"
        quantifiedShares={structures}
        color={nombreAccompagnementParLieuColor}
        style={{
          label: {
            width: '244px',
          },
        }}
      />
    </>
  )
