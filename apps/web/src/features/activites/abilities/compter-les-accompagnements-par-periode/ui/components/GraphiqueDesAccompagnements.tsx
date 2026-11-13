'use client'

import { AccompagnementBarChart } from '@app/web/libs/statistiques/AccompagnementBarChart'
import type { LabelAndCount } from '@app/web/libs/statistiques/quantifiedShare'
import Button from '@codegouvfr/react-dsfr/Button'
import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { useState } from 'react'

export const GraphiqueDesAccompagnements = ({
  accompagnementsParMois,
  accompagnementsParJour,
}: {
  accompagnementsParMois: LabelAndCount[]
  accompagnementsParJour: LabelAndCount[]
}) => {
  const [isAccompagnementCountByMonth, setIsAccompagnementCountByMonth] =
    useState(true)

  return (
    <div className="fr-col fr-border fr-pt-6v fr-pb-4v fr-px-8v fr-border-radius--16 fr-flex fr-direction-column">
      <div className="fr-mb-3w fr-flex fr-flex-wrap fr-justify-content-space-between fr-align-items-center fr-flex-gap-2v">
        <div className="fr-mb-0 fr-flex fr-align-items-center fr-text--nowrap">
          <h3 className="fr-text--lg fr-mb-0">Nombre d'accompagnements</h3>
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
            d’activités enregistrées&nbsp;: accompagnement individuel et atelier
            collectif.
            <br />
            <br />À noter&nbsp;: Les ateliers collectifs comptent pour 1
            accompagnement par participant. Ex&nbsp;: Un atelier collectif avec
            10 participants compte pour 10 accompagnements.
          </span>
        </div>
        <SegmentedControl
          className="fr-ml-auto"
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
      <div className="fr-flex-grow-1 zone-du-graphique">
        <AccompagnementBarChart
          data={
            isAccompagnementCountByMonth
              ? accompagnementsParMois
              : accompagnementsParJour
          }
        />
      </div>
    </div>
  )
}
