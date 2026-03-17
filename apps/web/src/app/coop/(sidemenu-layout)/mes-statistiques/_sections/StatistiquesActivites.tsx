'use client'

import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { AccompagnementPieChart } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_components/AccompagnementPieChart'
import { QuantifiedShareLegend } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_components/QuantifiedShareLegend'
import type {
  ActivitesCommunesStats,
  ActivitesStats,
  ActivitesStructuresStats,
} from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getActivitesStats'
import type { TotalCountsStats } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/_queries/getTotalCountsStats'
import { CaptureButton } from '@app/web/libs/statistiques/CaptureButton'
import { numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { Fragment, useRef, useState } from 'react'
import { ProgressItemList } from '../_components/ProgressItemList'
import { QuantifiedShareList } from '../_components/QuantifiedShareList'
import { StatistiqueAccompagnement } from '../_components/StatistiqueAccompagnement'
import { StatistiqueMateriel } from '../_components/StatistiqueMateriel'
import {
  canauxAccompagnementColors,
  dureesAccompagnementColors,
  nombreAccompagnementParCommuneColor,
  nombreAccompagnementParLieuColor,
  tagsColor,
  thematiquesAccompagnementColors,
} from './colors'

type AccompagnementCategory = 'thematiques' | 'demarches' | 'tags'
type StructuresCategory = 'lieux' | 'communes'

const desc = (
  { count: countA }: { count: number },
  { count: countB }: { count: number },
) => countB - countA

const toMaxProportion = (
  max: number,
  { proportion }: { proportion: number },
) => (proportion > max ? proportion : max)

export const StatistiquesActivites = ({
  activites,
  structures,
  communes,
  totalCounts,
  wording = 'personnel',
  canManageTags = false,
}: {
  wording?: 'personnel' | 'generique'
  activites: ActivitesStats
  structures?: ActivitesStructuresStats
  communes?: ActivitesCommunesStats
  totalCounts: TotalCountsStats
  canManageTags?: boolean
}) => {
  const captureTypesAccompagnementsRef = useRef<HTMLDivElement | null>(null)
  const captureThematiquesAccompagnementsRef = useRef<HTMLDivElement | null>(
    null,
  )
  const captureMaterielAccompagnementsRef = useRef<HTMLDivElement | null>(null)
  const captureCreneauxAccompagnementsRef = useRef<HTMLDivElement | null>(null)

  const [accompagnementCategory, setAccompagnementCategory] =
    useState<AccompagnementCategory>('thematiques')

  const [structuresCategory, setStructuresCategory] =
    useState<StructuresCategory>('lieux')

  const accompagnementCategories = [
    {
      category: 'thematiques',
      title: 'Thématiques des accompagnements de médiation numérique',
      description:
        'Thématiques sélectionnées lors de l’enregistrement d’un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques.',
      items: activites.thematiques.sort(desc),
      colors: thematiquesAccompagnementColors,
      maxProportion: activites.thematiques.reduce(toMaxProportion, 0),
    },
    {
      category: 'demarches',
      title: 'Thématiques des accompagnements de démarches administratives',
      description:
        'Thématiques des démarches administratives sélectionnées lors de l’enregistrement d’un accompagnement. À noter : un accompagnement peut avoir plusieurs thématiques administratives.',
      items: activites.thematiquesDemarches.sort(desc),
      colors: thematiquesAccompagnementColors,
      maxProportion: activites.thematiquesDemarches.reduce(toMaxProportion, 0),
    },
    {
      category: 'tags',
      title: 'Tags spécifiques',
      description:
        'Tags spécifiques sélectionnés lors de l’enregistrement d’un accompagnement. À noter : un accompagnement peut avoir plusieurs tags.',
      items: activites.tags.sort(desc),
      colors: tagsColor,
      maxProportion: activites.tags.reduce(toMaxProportion, 0),
      ...(canManageTags
        ? {
            actions: (
              <Button
                priority="tertiary no outline"
                size="small"
                iconId="fr-icon-settings-5-line"
                linkProps={{ href: '/coop/tags' }}
              >
                Gérer mes tags
              </Button>
            ),
          }
        : {}),
    },
  ]

  return (
    <>
      <h2 className="fr-h5 fr-text-mention--grey">
        <span className="ri-service-line fr-mr-1w" aria-hidden />
        Statistiques sur{' '}
        {wording === 'personnel'
          ? 'vos accompagnements'
          : 'les accompagnements'}
      </h2>
      <div
        ref={captureTypesAccompagnementsRef}
        className="fr-background-alt--blue-france fr-px-8v fr-py-6v fr-mb-3w fr-border-radius--16 fr-grid-row fr-flex-gap-12v fr-position-relative"
      >
        <span className="fr-no-print fr-position-absolute fr-top-0 fr-right-0 fr-p-4v">
          <CaptureButton
            captureRef={captureTypesAccompagnementsRef}
            captureName="types-accompagnements"
            title="Télécharger l’image des types d’accompagnements"
            iconId="fr-icon-download-line"
            size="small"
            priority="tertiary no outline"
          />
        </span>
        {activites.typeActivites.map(({ count, proportion, value }) => (
          <StatistiqueAccompagnement
            key={value}
            className="fr-col-xl fr-col-12"
            typeActivite={value}
            count={count}
            proportion={proportion}
          >
            {value === 'Collectif' && (
              <span className="fr-text-mention--grey fr-text--sm fr-mb-0">
                &nbsp;·&nbsp;sur{' '}
                <span className="fr-text--bold">
                  {numberToString(totalCounts.accompagnements.collectifs.total)}
                </span>{' '}
                atelier
                {sPluriel(totalCounts.accompagnements.collectifs.total)}
              </span>
            )}
          </StatistiqueAccompagnement>
        ))}
      </div>
      <div
        className="fr-border fr-p-4w fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16"
        ref={captureThematiquesAccompagnementsRef}
      >
        <div className="fr-flex">
          <SegmentedControl
            className="fr-md-col fr-col-12 fr-ml-auto"
            hideLegend
            legend="Bascule entre les thématiques"
            segments={[
              {
                label: 'Médiation numérique',
                nativeInputProps: {
                  checked: accompagnementCategory === 'thematiques',
                  onChange: () => setAccompagnementCategory('thematiques'),
                },
              },
              {
                label: 'Démarches administratives',
                nativeInputProps: {
                  checked: accompagnementCategory === 'demarches',
                  onChange: () => setAccompagnementCategory('demarches'),
                },
              },
              {
                label: (
                  <>
                    <span className="ri-price-tag-3-line" aria-hidden />
                    &ensp;Tags spécifiques
                  </>
                ),
                nativeInputProps: {
                  checked: accompagnementCategory === 'tags',
                  onChange: () => setAccompagnementCategory('tags'),
                },
              },
            ]}
          />
          <span className="fr-no-print">
            <CaptureButton
              captureRef={captureThematiquesAccompagnementsRef}
              captureName="thematiques-accompagnements"
              title="Télécharger l’image des thematiques d’accompagnements"
              iconId="fr-icon-download-line"
              size="small"
              priority="tertiary no outline"
            />
          </span>
        </div>
        <hr className="fr-separator-8v" />
        {accompagnementCategories.map(
          ({
            category,
            title,
            description,
            items,
            colors,
            maxProportion,
            actions,
          }) =>
            category === accompagnementCategory && (
              <Fragment key={category}>
                <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-6v">
                  <div className="fr-mb-0 fr-flex fr-align-items-center">
                    <h3 className="fr-text--md fr-mb-0 fr-text--nowrap">
                      {title}
                    </h3>
                    <Button
                      className="fr-px-1v fr-ml-1v fr-no-print"
                      title={`Plus d’information à propos des ${title.toLowerCase()}`}
                      priority="tertiary no outline"
                      size="small"
                      type="button"
                      aria-describedby={`tooltip-accompagnement-${category}`}
                    >
                      <span
                        className="ri-information-line fr-text--lg"
                        aria-hidden
                      />
                    </Button>
                    <span
                      className="fr-tooltip fr-placement"
                      id={`tooltip-accompagnement-${category}`}
                      role="tooltip"
                      aria-hidden
                    >
                      {description}
                    </span>
                  </div>
                  <div className="fr-no-print">{actions && actions}</div>
                </div>
                <ProgressItemList
                  items={items}
                  colors={colors}
                  maxProportion={maxProportion}
                  oneLineLabel
                  tooltipKey={category}
                />
              </Fragment>
            ),
        )}
      </div>
      <div
        className="fr-border fr-p-8v fr-pb-10v fr-mb-3w fr-border-radius--16 fr-background-default--grey fr-border-radius--16 fr-position-relative"
        ref={captureMaterielAccompagnementsRef}
      >
        <div className="fr-col fr-flex fr-align-items-center fr-mb-8v">
          <h3 className="fr-text--md fr-mb-0">
            Matériel utilisé lors des accompagnements
          </h3>
          <Button
            className="fr-px-1v fr-ml-1v fr-no-print"
            title="Plus d’information à propos du matériel utilisé"
            priority="tertiary no outline"
            size="small"
            type="button"
            aria-describedby="tooltip-meteriel-utilise"
          >
            <span className="ri-information-line fr-text--lg" aria-hidden />
          </Button>
          <span
            className="fr-tooltip fr-placement"
            id="tooltip-meteriel-utilise"
            role="tooltip"
            aria-hidden
          >
            Matériel utilisé lors d’un accompagnement de médiation numérique. À
            noter&nbsp;: Plusieurs matériels ont pu être utilisés lors d’un même
            accompagnement.
          </span>
          <span className="fr-no-print fr-position-absolute fr-top-0 fr-right-0 fr-p-4v">
            <CaptureButton
              captureRef={captureMaterielAccompagnementsRef}
              captureName="meteriel-accompagnements"
              title="Télécharger l’image des matériels utilisés lors des accompagnements"
              iconId="fr-icon-download-line"
              size="small"
              priority="tertiary no outline"
            />
          </span>
        </div>
        <div className="fr-flex fr-flex-wrap fr-justify-content-space-between fr-flex-gap-6v fr-px-4v">
          {activites.materiels.map(({ value, label, count, proportion }) => (
            <StatistiqueMateriel
              key={value}
              value={value}
              label={label}
              count={count}
              proportion={proportion}
            />
          ))}
        </div>
      </div>
      <div
        ref={captureCreneauxAccompagnementsRef}
        className="fr-border fr-p-4w fr-background-default--grey fr-border-radius--16 fr-position-relative"
      >
        <div className="fr-flex fr-flex-wrap fr-flex-gap-16v">
          <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
            <h3 className="fr-text--md fr-mb-4v">Canaux des accompagnements</h3>
            <div className="fr-flex fr-align-items-center">
              <AccompagnementPieChart
                className="fr-flex-shrink-0"
                size={80}
                width={18}
                data={activites.typeLieu}
                colors={canauxAccompagnementColors}
              />
              <QuantifiedShareLegend
                className="fr-pl-3w"
                quantifiedShares={activites.typeLieu}
                colors={canauxAccompagnementColors}
              />
            </div>
          </div>
          <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
            <h3 className="fr-text--md fr-mb-4v">Durée des accompagnements</h3>
            <div className="fr-flex fr-align-items-center">
              <AccompagnementPieChart
                className="fr-flex-shrink-0"
                size={80}
                width={18}
                data={activites.durees}
                colors={dureesAccompagnementColors}
              />
              <QuantifiedShareLegend
                className="fr-pl-3w"
                quantifiedShares={activites.durees}
                colors={dureesAccompagnementColors}
                oneLineLabel
              />
            </div>
          </div>
        </div>
        {(!!structures || !!communes) && (
          <>
            <hr className="fr-separator-1px fr-my-5w" />
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-4v">
              <h3 className="fr-text--md fr-mb-0">
                Nombre d'accompagnements par{' '}
                {structuresCategory === 'lieux'
                  ? "lieux d'activités"
                  : 'communes'}
              </h3>
              <SegmentedControl
                hideLegend
                legend="Bascule entre lieux et communes"
                segments={[
                  {
                    label: (
                      <>
                        <span className="ri-home-office-line" aria-hidden />
                        &ensp;Par lieux d'activités
                      </>
                    ),
                    nativeInputProps: {
                      checked: structuresCategory === 'lieux',
                      onChange: () => setStructuresCategory('lieux'),
                    },
                  },
                  {
                    label: (
                      <>
                        <span className="ri-road-map-line" aria-hidden />
                        &ensp;Par communes
                      </>
                    ),
                    nativeInputProps: {
                      checked: structuresCategory === 'communes',
                      onChange: () => setStructuresCategory('communes'),
                    },
                  },
                ]}
              />
            </div>
            {structuresCategory === 'lieux' && (
              <>
                {!structures ||
                structures.length === 0 ||
                structures.every((s) => s.count === 0) ? (
                  <div className="fr-text--center fr-background-alt--blue-france fr-p-12v fr-border-radius--8">
                    Aucun accompagnement renseigné dans un de vos lieux
                    d'activités
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
                )}
              </>
            )}
            {structuresCategory === 'communes' && (
              <>
                {!communes ||
                communes.length === 0 ||
                communes.every((c) => c.count === 0) ? (
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
                )}
              </>
            )}
          </>
        )}
        <span className="fr-no-print fr-position-absolute fr-top-0 fr-right-0 fr-p-4v">
          <CaptureButton
            captureRef={captureCreneauxAccompagnementsRef}
            captureName="creneaux-accompagnements"
            title="Télécharger l’image des crénaux d’accompagnements"
            iconId="fr-icon-download-line"
            size="small"
            priority="tertiary no outline"
          />
        </span>
      </div>
    </>
  )
}
