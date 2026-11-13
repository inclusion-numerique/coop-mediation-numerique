import { communeColor } from '@app/web/libs/statistiques/couleurs'
import { QuantifiedShareList } from '@app/web/libs/statistiques/QuantifiedShareList'
import type { PersonnesParCommunePresentees } from '../personnes-par-commune.presenter'

export const CommunesDeResidenceImprimees = ({
  communes,
  total,
}: {
  communes: PersonnesParCommunePresentees
  total: number
}) => {
  const totalWithCommune = communes.reduce(
    (somme: number, { count }) => somme + count,
    0,
  )

  return (
    <>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">
        Commune de résidence des bénéficiaires
      </h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Les statistiques prennent en compte les bénéficiaires suivis et anonymes
        dont la commune de résidence a été complétée.
        <br />
        Total des bénéficiaires dont la commune de résidence a été
        complétée&nbsp;: {totalWithCommune}/{total} bénéficiaires suivis ou
        anonymes
      </small>
      <QuantifiedShareList
        order="desc"
        quantifiedShares={communes}
        colors={[communeColor]}
      />
    </>
  )
}
