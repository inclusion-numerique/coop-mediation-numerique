import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import type { MesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import { typeActivitePluralLabels } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import { AccompagnementPieChart } from '../_components/AccompagnementPieChart'
import { ProgressItemList } from '../_components/ProgressItemList'
import { QuantifiedShareLegend } from '../_components/QuantifiedShareLegend'
import { QuantifiedShareList } from '../_components/QuantifiedShareList'
import { StatistiqueMateriel } from '../_components/StatistiqueMateriel'
import {
  canauxAccompagnementColors,
  dureesAccompagnementColors,
  nombreAccompagnementParLieuColor,
  thematiquesAccompagnementColors,
} from './colors'

export const StatistiquesActivitesPrint = ({
  totalCounts,
  activites,
  structures,
}: MesStatistiquesPageData) => {
  const thematiques = activites.thematiques.sort((a, b) => b.count - a.count)
  const thematiquesMaxProportion = activites.thematiques.reduce(
    (max, thematique) =>
      thematique.proportion > max ? thematique.proportion : max,
    0,
  )

  const thematiquesDemarches = activites.thematiquesDemarches.sort(
    (a, b) => b.count - a.count,
  )
  const thematiquesDemarchesMaxProportion =
    activites.thematiquesDemarches.reduce(
      (max, thematique) =>
        thematique.proportion > max ? thematique.proportion : max,
      0,
    )

  return (
    <>
      <h2 className="fr-h3">Statistiques sur vos activités</h2>
      <h3 className="fr-h5">Types d’activités</h3>
      <ul>
        {activites.typeActivites.map(({ count, proportion, value }) => (
          <li key={value}>
            <b>{numberToString(count)}</b> {typeActivitePluralLabels[value]}
            {value === 'Collectif' &&
              `, ${
                totalCounts.accompagnements.collectifs.total
              } participation${sPluriel(
                totalCounts.accompagnements.collectifs.total,
              )} au total`}{' '}
            ({numberToPercentage(proportion)} des activités)
          </li>
        ))}
      </ul>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Thématiques des activités</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Thématiques sélectionnées lors de l’enregistrement d’une activité. À
        noter : une activité peut avoir plusieurs thématiques.
      </small>
      <h4 className="fr-h6 fr-mb-2v fr-mt-6v">Médiation numérique</h4>
      <ProgressItemList
        items={thematiques}
        maxProportion={thematiquesMaxProportion}
        colors={thematiquesAccompagnementColors}
      />
      <h4 className="fr-h6 fr-mb-2v fr-mt-6v">Démarches administratives</h4>
      <ProgressItemList
        items={thematiquesDemarches}
        maxProportion={thematiquesDemarchesMaxProportion}
        colors={thematiquesAccompagnementColors}
      />
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Matériel utilisé</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Matériel utilisé lors d’un accompagnement de médiation numérique. À
        noter&nbsp;: Plusieurs matériels ont pu être utilisés lors d’un même
        accompagnement.
      </small>
      <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
        {activites.materiels.map(({ value, label, count, proportion }) => (
          <StatistiqueMateriel
            key={value}
            className="fr-col-2"
            value={value}
            label={label}
            count={count}
            proportion={proportion}
          />
        ))}
      </div>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Canaux des activités</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Répartition des activités enregistrées par canal.
      </small>
      <div className="fr-flex fr-align-items-center">
        <AccompagnementPieChart
          size={128}
          data={activites.typeLieu}
          colors={canauxAccompagnementColors}
          isAnimationActive={false}
        />
        <QuantifiedShareLegend
          className="fr-pl-3w"
          quantifiedShares={activites.typeLieu}
          colors={canauxAccompagnementColors}
        />
      </div>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Durées des activités</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Répartition des activités enregistrées par durée.
      </small>
      <div className="fr-flex fr-align-items-center">
        <AccompagnementPieChart
          size={128}
          data={activites.durees}
          colors={dureesAccompagnementColors}
          isAnimationActive={false}
        />
        <QuantifiedShareLegend
          className="fr-pl-3w"
          quantifiedShares={activites.durees}
          colors={dureesAccompagnementColors}
        />
      </div>
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Nombre d’activités par lieux</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Répartition des activités enregistrées par lieu d’activité.
      </small>
      <QuantifiedShareList
        order="desc"
        quantifiedShares={structures}
        colors={[nombreAccompagnementParLieuColor]}
      />
    </>
  )
}
