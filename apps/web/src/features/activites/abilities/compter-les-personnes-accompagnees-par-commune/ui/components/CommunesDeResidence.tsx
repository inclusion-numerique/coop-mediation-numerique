import { communeColor } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareList } from '@app/web/libs/statistiques/QuantifiedShareList'
import type { PersonnesParCommunePresentees } from '../personnes-par-commune.presenter'

export const CommunesDeResidence = ({
  communes,
}: {
  communes: PersonnesParCommunePresentees
}) => (
  <>
    <h3 className="fr-text--md fr-mb-4v">
      Commune de résidence des bénéficiaires
    </h3>
    {communes.length === 0 || communes.every((c) => c.count === 0) ? (
      <div className="fr-text--center fr-background-alt--blue-france fr-p-12v fr-border-radius--8">
        Aucune commune de résidence renseignée
      </div>
    ) : (
      <>
        <div className="fr-text--bold fr-text--uppercase fr-text--xs fr-text-mention--grey fr-mb-1w">
          Commune
        </div>
        <QuantifiedShareList
          order="desc"
          limit={{
            showLabel: 'Voir toutes les communes',
            hideLabel: 'Réduire',
            count: 5,
          }}
          quantifiedShares={communes}
          oneLineLabel
          color={communeColor}
          style={{
            label: {
              minWidth: '244px',
            },
          }}
        />
      </>
    )}
  </>
)
