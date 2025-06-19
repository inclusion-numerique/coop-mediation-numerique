'use client'

import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import type { MesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import { numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { useState } from 'react'
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
  const [isAccompagnementCountByMonth, setIsAccompagnementCountByMonth] =
    useState(true)

  return (
    <>
      <h2 className="fr-h5 fr-text-mention--grey">
        <span className="ri-line-chart-line fr-mr-1w" aria-hidden />
        Statistiques générales{' '}
        {wording === 'personnel' && 'sur vos accompagnements'}
      </h2>
      <div className="fr-grid-row fr-flex-gap-6v">
        <div className="fr-flex fr-direction-column fr-flex-gap-6v fr-col-xl-4 fr-col-12">
          <div className="fr-p-3w fr-border-radius--16 fr-background-alt--brown-caramel fr-width-full">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0">
                {numberToString(totalCounts.accompagnements.total)}
              </span>
              <span
                className="ri-service-line ri-2x fr-text-label--brown-caramel"
                aria-hidden
              />
            </div>
            <div className="fr-text--bold fr-mt-1w">
              Accompagnement{sPluriel(totalCounts.accompagnements.total)}{' '}
              <Button
                className="fr-px-2v"
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
                    {sPluriel(totalCounts.activites.collectifs.participants)}
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
            <div className="fr-text-mention--grey">au total</div>
          </div>
          <div className="fr-p-3w fr-border-radius--16 fr-background-alt--brown-caramel">
            <div className="fr-flex fr-align-items-center fr-justify-content-space-between">
              <span className="fr-h2 fr-mb-0">
                {numberToString(totalCounts.beneficiaires.total)}
              </span>
              <span
                className="ri-user-heart-line ri-2x fr-text-label--brown-caramel"
                aria-hidden
              />
            </div>
            <div className="fr-my-1w">
              <div className="fr-text--bold">
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
            <div className="fr-text-mention--grey">
              <div>
                {numberToString(totalCounts.beneficiaires.suivis)} bénéficiaire
                {sPluriel(totalCounts.beneficiaires.suivis)} suivi
                {sPluriel(totalCounts.beneficiaires.suivis)}
              </div>
              <div>
                {numberToString(totalCounts.beneficiaires.anonymes)}{' '}
                bénéficiaire
                {sPluriel(totalCounts.beneficiaires.anonymes)} anonyme
                {sPluriel(totalCounts.beneficiaires.anonymes)}
              </div>
            </div>
          </div>
        </div>
        <div className="fr-col fr-border fr-p-3w fr-border-radius--16">
          <div className="fr-mb-3w">
            <div className="fr-mb-0 fr-col fr-flex fr-align-items-center fr-mb-1w">
              <h3 className="fr-text--lg fr-mb-0">Nombre d’accompagnements</h3>
              <Button
                className="fr-px-1v fr-ml-1v"
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
                d’activités enregistrées&nbsp;: (accompagnement individuel et
                atelier collectif).
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
    </>
  )
}
