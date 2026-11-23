import type { LigneDuTableau } from '../presenters/mes-activites.presenter'
import { OuvrirLeDetailDeLaLigne } from './OuvrirLeDetailDeLaLigne'

export const LigneDuTableauDeMesActivites = ({
  ligne,
}: {
  ligne: LigneDuTableau
}) => (
  <tr className="fr-enlarge-button fr-table-row--link">
    <td className="fr-cell--data tableau-des-activites__type">
      <p className="fr-text-mention--grey fr-text--xs fr-mb-0-5v">
        {ligne.type}
      </p>
      <p className="fr-text--sm fr-mb-0">{ligne.personnes}</p>
    </td>
    <td className="fr-cell--data">{ligne.jour}</td>
    <td className="fr-cell--data">{ligne.duree}</td>
    <td className="fr-cell--data tableau-des-activites__lieu">{ligne.lieu}</td>
    <td className="fr-cell--data">{ligne.enregistreeLe}</td>
    <td className="fr-table-cell--link">
      <OuvrirLeDetailDeLaLigne row={ligne} />
    </td>
  </tr>
)
