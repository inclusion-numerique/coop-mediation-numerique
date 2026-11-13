import type { MesStatistiquesPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/getMesStatistiquesPageData'
import {
  sectionBeneficiairesImprimee,
  sectionGeneraleImprimee,
} from '@app/web/composition/statistiques/sections'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from '@app/web/features/statistiques/ui/filtres/libelles-des-filtres'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { StatistiquesActivitesPrint } from '../_sections/StatistiquesActivitesPrint'

export const PrintStatistiques = (
  mesStatistiquesProps: MesStatistiquesPageData,
) => {
  const {
    activitesFilters,
    communesOptions,
    departementsOptions,
    initialMediateursOptions,
    lieuxActiviteOptions,
    tagsOptions,
    activiteSourceOptions,
  } = mesStatistiquesProps

  const filterLabelsToDisplay = generateActivitesFiltersLabels(
    activitesFilters,
    {
      communesOptions,
      departementsOptions,
      lieuxActiviteOptions,
      beneficiairesOptions: [],
      mediateursOptions: initialMediateursOptions,
      structuresEmployeusesOptions: [],
      tagsOptions,
      activiteSourceOptions,
    },
  ).map(toLieuPrefix)

  return (
    <div className="fr-print" aria-hidden>
      <h1 className="fr-text-title--blue-france fr-my-2w">Mes statistiques</h1>
      {filterLabelsToDisplay.length > 0 && (
        <section>
          <h2 className="fr-h3">Filtres activés</h2>
          <ul className="fr-tags-group">
            {filterLabelsToDisplay.map((filter) => (
              <li
                className="fr-line-height-1"
                key={`${filter.type}-${filter.key}`}
              >
                <Tag small>{filter.label}</Tag>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="fr-pt-6v">
        {sectionGeneraleImprimee(mesStatistiquesProps)}
      </section>
      <section className="fr-pt-6v">
        <StatistiquesActivitesPrint {...mesStatistiquesProps} />
      </section>
      <section className="fr-pt-6v">
        {sectionBeneficiairesImprimee(mesStatistiquesProps)}
      </section>
    </div>
  )
}
