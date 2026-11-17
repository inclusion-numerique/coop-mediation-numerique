import { nombreAccompagnementParCommuneColor } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareList } from '@app/web/libs/statistiques/QuantifiedShareList'
import type { parCommunePresentes } from '../par-commune.presenter'

export const CommunesDesAccompagnements = ({
  communes,
}: {
  communes: ReturnType<typeof parCommunePresentes>
}) =>
  communes.length === 0 || communes.every((c) => c.count === 0) ? (
    <div className="fr-text--center fr-background-alt--blue-france fr-p-12v fr-border-radius--8">
      Aucun accompagnement renseigné dans une commune
    </div>
  ) : (
    <>
      <div className="fr-text--bold fr-text--uppercase fr-text--xs fr-text-mention--grey fr-mb-2v">
        Communes
      </div>
      <QuantifiedShareList
        limit={{
          showLabel: 'Voir toutes les communes',
          hideLabel: 'Réduire',
          count: 5,
        }}
        truncateLabel
        tooltipKey="communes"
        order="desc"
        quantifiedShares={communes}
        color={nombreAccompagnementParCommuneColor}
        style={{
          label: {
            width: '244px',
          },
        }}
      />
    </>
  )
