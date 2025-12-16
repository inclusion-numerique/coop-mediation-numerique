'use client'

import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import type { MesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import { CaptureButton } from '@app/web/libs/statistiques/CaptureButton'
import { numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { useRef, useState } from 'react'
import { AccompagnementBarChart } from '../_components/AccompagnementBarChart'

export const StatistiquesGenerales = ({
  totalCounts,
  accompagnementsParMois,
  accompagnementsParJour,
  wording = 'personnel',
}: { wording?: 'personnel' | 'generique' } & Pick<
  MesStatistiquesPageData,
  'accompagnementsParJour' | 'accompagnementsParMois' | 'totalCounts'
>) => {
  const captureRef = useRef<HTMLDivElement | null>(null)
  const [isAccompagnementCountByMonth, setIsAccompagnementCountByMonth] =
    useState(true)

  return (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mb-6v fr-no-print">
        <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
          <span className="ri-line-chart-line fr-mr-1w" aria-hidden />
          Statistiques générales{' '}
          {wording === 'personnel' && 'sur vos accompagnements'}
        </h2>
        <CaptureButton
          captureRef={captureRef}
          captureName="statistiques-generales"
          title="Télécharger l’image des statistiques générales"
          iconId="fr-icon-download-line"
          size="small"
          priority="tertiary no outline"
        />
      </div>
      <div
        ref={captureRef}
        className="fr-grid-row fr-flex-gap-6v fr-background-default--grey fr-border-radius--16"
      >
        <div className="fr-flex fr-direction-column fr-flex-gap-6v fr-col-xl-4 fr-col-12">
          <div className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-width-full">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0">
                {numberToString(totalCounts.accompagnements.total)}
              </span>
              <span
                className="ri-service-line ri-2x"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                }}
                aria-hidden
              />
            </div>
            <div className="fr-text--bold fr-text--sm fr-mb-0 fr-mt-1v">
              Accompagnement{sPluriel(totalCounts.accompagnements.total)}{' '}
              <Button
                className="fr-px-2v fr-no-print"
                title="Plus d’information à propos des accompagnements"
                priority="tertiary no outline"
                size="small"
                type="button"
                aria-describedby="tooltip-accompagnements"
              >
                <span className="ri-information-line fr-text--lg" aria-hidden />
              </Button>
              <span
                className="fr-tooltip fr-placement fr-text--regular"
                id="tooltip-accompagnements"
                role="tooltip"
                aria-hidden
              >
                {numberToString(totalCounts.accompagnements.total)}{' '}
                accompagnements au total dont&nbsp;:
                <ul>
                  <li>
                    {numberToString(
                      totalCounts.accompagnements.individuels.total,
                    )}{' '}
                    accompagnement
                    {sPluriel(totalCounts.accompagnements.individuels.total)}{' '}
                    individuel
                    {sPluriel(totalCounts.accompagnements.individuels.total)}
                  </li>
                  <li>
                    {numberToString(
                      totalCounts.activites.collectifs.participants,
                    )}{' '}
                    participation
                    {sPluriel(totalCounts.activites.collectifs.participants)}{' '}
                    lors de{' '}
                    {numberToString(totalCounts.activites.collectifs.total)}{' '}
                    ateliers*
                  </li>
                </ul>
                *Les ateliers collectifs comptent pour 1 accompagnement par
                participant. Ex&nbsp;: Un atelier collectif avec 10 participants
                compte pour 10 accompagnements.
              </span>
            </div>
          </div>
          <div className="fr-px-8v fr-py-6v fr-border-radius--16 fr-background-alt--brown-caramel fr-flex-grow-1">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0 fr-text--nowrap">
                {numberToString(totalCounts.beneficiaires.total)}
              </span>
              <span
                className="ri-user-heart-line ri-2x"
                style={{
                  color: 'var(--brown-caramel-sun-425-moon-901-hover)',
                }}
                aria-hidden
              />
            </div>
            <div className="fr-mt-2v">
              <div className="fr-text--sm fr-text--bold fr-mb-4v">
                Bénéficiaire{sPluriel(totalCounts.beneficiaires.total)}{' '}
                accompagné{sPluriel(totalCounts.beneficiaires.total)}
              </div>
              {totalCounts.beneficiaires.nouveaux !== 0 && (
                <div className="fr-text--medium fr-text-label--blue-france">
                  dont{' '}
                  <span className="fr-text--bold">
                    {totalCounts.beneficiaires.nouveaux}
                  </span>{' '}
                  {totalCounts.beneficiaires.nouveaux === 1
                    ? 'nouveau'
                    : 'nouveaux'}
                </div>
              )}
            </div>
            <div className="fr-text-mention--grey fr-text--sm fr-mb-0">
              <div>
                <strong>
                  {numberToString(totalCounts.beneficiaires.suivis)}
                </strong>{' '}
                bénéficiaire
                {sPluriel(totalCounts.beneficiaires.suivis)} suivi
                {sPluriel(totalCounts.beneficiaires.suivis)}
              </div>
              <div>
                <strong>
                  {numberToString(totalCounts.beneficiaires.anonymes)}
                </strong>{' '}
                bénéficiaire
                {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme
                {sPluriel(totalCounts.beneficiaires.anonymes)}
              </div>
            </div>
          </div>
        </div>
        <div className="fr-col fr-border fr-py-6v fr-px-8v fr-border-radius--16">
          <div className="fr-mb-3w">
            <div className="fr-mb-0 fr-col fr-flex fr-align-items-center fr-mb-1w">
              <h3 className="fr-text--lg fr-mb-0">Nombre d’accompagnements</h3>
              <Button
                className="fr-px-1v fr-ml-1v fr-no-print"
                title="Plus d’information à propos du nombre d’accompagnements"
                priority="tertiary no outline"
                size="small"
                type="button"
                aria-describedby="tooltip-nombre-accompagnements"
              >
                <span className="ri-information-line fr-text--lg" aria-hidden />
              </Button>
              <span
                className="fr-tooltip fr-placement"
                id="tooltip-nombre-accompagnements"
                role="tooltip"
                aria-hidden
              >
                Le nombre d’accompagnements correspond à la somme des 2 types
                d’activités enregistrées&nbsp;: accompagnement individuel et
                atelier collectif.
                <br />
                <br />À noter&nbsp;: Les ateliers collectifs comptent pour 1
                accompagnement par participant. Ex&nbsp;: Un atelier collectif
                avec 10 participants compte pour 10 accompagnements.
              </span>
            </div>
            <SegmentedControl
              className="fr-md-col fr-col-12"
              hideLegend
              small
              legend="Bascule entre entre les périodes"
              segments={[
                {
                  label: 'Par mois',
                  nativeInputProps: {
                    checked: isAccompagnementCountByMonth,
                    onChange: () => setIsAccompagnementCountByMonth(true),
                  },
                },
                {
                  label: 'Par jour',
                  nativeInputProps: {
                    checked: !isAccompagnementCountByMonth,
                    onChange: () => setIsAccompagnementCountByMonth(false),
                  },
                },
              ]}
            />
          </div>
          <AccompagnementBarChart
            data={
              isAccompagnementCountByMonth
                ? accompagnementsParMois
                : accompagnementsParJour
            }
          />
        </div>
      </div>
    </div>
  )
}
