import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import type { MesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import { typeActivitePluralLabels } from '@app/web/features/activites/use-cases/cra/fields/type-activite'
import { numberToPercentage, numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import { Fragment } from 'react'
import { AccompagnementPieChart } from '../_components/AccompagnementPieChart'
import { ProgressItemList } from '../_components/ProgressItemList'
import { QuantifiedShareLegend } from '../_components/QuantifiedShareLegend'
import { QuantifiedShareList } from '../_components/QuantifiedShareList'
import { StatistiqueMateriel } from '../_components/StatistiqueMateriel'
import {
  canauxAccompagnementColors,
  dureesAccompagnementColors,
  nombreAccompagnementParLieuColor,
  tagsColor,
  thematiquesAccompagnementColors,
} from './colors'

const desc = (
  { count: countA }: { count: number },
  { count: countB }: { count: number },
) => countB - countA

const toMaxProportion = (
  max: number,
  { proportion }: { proportion: number },
) => (proportion > max ? proportion : max)

export const StatistiquesActivitesPrint = ({
  totalCounts,
  activites,
  structures,
}: MesStatistiquesPageData) => {
  const accompagnementCategories = [
    {
      category: 'thematiques',
      title: 'Médiation numérique',
      items: activites.thematiques.sort(desc),
      colors: thematiquesAccompagnementColors,
      maxProportion: activites.thematiques.reduce(toMaxProportion, 0),
    },
    {
      category: 'demarches',
      title: 'Démarches administratives',
      items: activites.thematiquesDemarches.sort(desc),
      colors: thematiquesAccompagnementColors,
      maxProportion: activites.thematiquesDemarches.reduce(toMaxProportion, 0),
    },
    {
      category: 'tags',
      title: 'Tags spécifiques',
      items: activites.tags.sort(desc),
      colors: tagsColor,
      maxProportion: activites.tags.reduce(toMaxProportion, 0),
    },
  ]

  return (
    <>
      <h2 className="fr-h3">Statistiques sur vos accompagnements</h2>
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
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">
        Thématiques des accompagnements de médiation numérique
      </h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Thématiques et tags sélectionnées lors de l’enregistrement d’une
        activité. À noter : une activité peut avoir plusieurs thématiques.
      </small>
      {accompagnementCategories.map(
        ({ category, title, items, maxProportion, colors }) => (
          <Fragment key={category}>
            <h4 className="fr-h6 fr-mb-2v fr-mt-6v">{title}</h4>
            <ProgressItemList
              items={items}
              maxProportion={maxProportion}
              colors={colors}
            />
          </Fragment>
        ),
      )}
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">
        Matériel utilisé lors des accompagnements
      </h3>
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
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Canaux des accompagnements</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Répartition des accompagnements enregistrées par canal.
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
      <h3 className="fr-h5 fr-mb-2v fr-mt-6v">Durée des accompagnements</h3>
      <small role="note" className="fr-mb-6v fr-display-block">
        Répartition des accompagnements enregistrées par durée.
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
}
