import { AccompagnementPieChart } from '@app/web/libs/statistiques/AccompagnementPieChart'
import {
  genresColors,
  statusColors,
  tranchesAgeColors,
} from '@app/web/libs/statistiques/couleurs'
import ProgressBar from '@app/web/libs/statistiques/ProgressBar'
import { QuantifiedShareLegend } from '@app/web/libs/statistiques/QuantifiedShareLegend'
import type { ProfilPresente } from '../profil.presenter'

const toProgress = ({
  label,
  count,
  proportion,
}: {
  label: string
  count?: number
  proportion: number
}) => ({
  label,
  count,
  percentage: proportion,
})

const totalRenseigne = (
  parts: readonly { count: number; value: string }[],
): number =>
  parts.reduce(
    (total: number, { count, value }) =>
      value === 'NonCommunique' ? total : total + count,
    0,
  )

export const ProfilImprime = ({
  beneficiaires,
}: {
  beneficiaires: ProfilPresente
}) => {
  const totalWithGenre = totalRenseigne(beneficiaires.genres)
  const totalWithTrancheAge = totalRenseigne(beneficiaires.trancheAges)
  const totalWithStatut = totalRenseigne(beneficiaires.statutsSocial)
  const statutsSocialProgress = beneficiaires.statutsSocial.map(toProgress)
  const trancheAgesProgress = beneficiaires.trancheAges.map(toProgress)
  const beneficiairesGenres = beneficiaires.genres

  return (
    <>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Genres</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Les statistiques prennent en compte les bénéficiaires suivis et anonymes
        dont le genre a été complété.
        <br />
        Total des bénéficiaires dont le genre a été complété&nbsp;:{' '}
        {totalWithGenre}/{beneficiaires.total} bénéficiaires suivis ou anonymes
      </small>
      <div className="fr-flex fr-align-items-center">
        <AccompagnementPieChart
          size={128}
          data={beneficiaires.genres}
          colors={genresColors}
          isAnimationActive={false}
        />
        <QuantifiedShareLegend
          className="fr-pl-3w"
          quantifiedShares={beneficiairesGenres}
          colors={genresColors}
        />
      </div>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Tranches d’âge</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Les statistiques prennent en compte les bénéficiaires suivis et anonymes
        dont l’année de naissance ou la tranche d’âge a été complétée.
        <br />
        Total des bénéficiaires dont la tranche d’âge a été complétée&nbsp;:{' '}
        {totalWithTrancheAge}/{beneficiaires.total} bénéficiaires suivis ou
        anonymes
      </small>

      <div>
        <div className="fr-mr-3w fr-mb-2w">
          <ProgressBar
            size="large"
            progress={trancheAgesProgress}
            colors={tranchesAgeColors}
            tooltipKey="tranches-age"
          />
        </div>
        <QuantifiedShareLegend
          quantifiedShares={beneficiaires.trancheAges}
          colors={tranchesAgeColors}
        />
      </div>

      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Statuts</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Les statistiques prennent en compte les bénéficiaires suivis et anonymes
        dont le statut a été complété.
        <br />
        Total des bénéficiaires dont le statut a été complété&nbsp;:{' '}
        {totalWithStatut}/{beneficiaires.total} bénéficiaires suivis ou anonymes
      </small>
      <div className="fr-mr-3w fr-mb-2w">
        <ProgressBar
          size="large"
          progress={statutsSocialProgress}
          colors={statusColors}
          tooltipKey="status-beneficiaires"
        />
      </div>
      <QuantifiedShareLegend
        quantifiedShares={beneficiaires.statutsSocial}
        colors={statusColors}
      />
    </>
  )
}
