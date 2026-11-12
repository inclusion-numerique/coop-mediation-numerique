import ExportActivitesButtonWrapper from '@app/web/features/activites/use-cases/list/components/ExportActivitesButtonWrapper'
import ExportActivitesDisabledButton from '@app/web/features/activites/use-cases/list/components/ExportActivitesDisabledButton'
import { Suspense } from 'react'
import {
  BarreDeFiltres,
  type OptionsDeLaBarre,
} from '../../../../ui/filtres/BarreDeFiltres'
import { FilterTags } from '../../../../ui/filtres/EtiquettesDesFiltres'
import type { FiltresDeLaListe } from '../../../../ui/filtres/filtres-de-la-liste'
import { optionsDesSources } from '../../../../ui/libelles/source-de-l-activite'

export const EnTeteDeLaListe = ({
  filtres,
  options,
  rendezVousFiltrables,
  nombreDAccompagnements,
}: {
  filtres: FiltresDeLaListe
  options: OptionsDeLaBarre
  rendezVousFiltrables: boolean
  nombreDAccompagnements: Promise<number>
}) => {
  const sources = options.importsV1 ? [...optionsDesSources] : []
  const tags = options.tags.map(({ id, nom }) => ({ id, nom }))
  const employeuses = [...options.employeuses]
  return (
    <>
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-mb-6v">
        <BarreDeFiltres
          filtres={filtres}
          options={options}
          rendezVousFiltrables={rendezVousFiltrables}
        />
        <Suspense fallback={<ExportActivitesDisabledButton />}>
          <ExportActivitesButtonWrapper
            filters={filtres}
            tagsOptions={tags}
            communesOptions={options.communes}
            departementsOptions={options.departements}
            lieuxActiviteOptions={options.lieux}
            structuresEmployeusesOptions={employeuses}
            beneficiairesOptions={[]}
            mediateursOptions={[]}
            searchResultMatchesCount={nombreDAccompagnements}
            activiteSourceOptions={sources}
          />
        </Suspense>
      </div>
      <FilterTags
        filters={filtres}
        communesOptions={options.communes}
        departementsOptions={options.departements}
        lieuxActiviteOptions={options.lieux}
        structuresEmployeusesOptions={employeuses}
        beneficiairesOptions={[]}
        mediateursOptions={[]}
        tagsOptions={tags}
        optionsDesSources={sources}
      />
    </>
  )
}
