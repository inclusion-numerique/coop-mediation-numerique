import type { ReactNode } from 'react'
import {
  BarreDeFiltres,
  type OptionsDeLaBarre,
} from '../../../../ui/components/filtres/BarreDeFiltres'
import { FilterTags } from '../../../../ui/components/filtres/EtiquettesDesFiltres'
import { optionsDesSources } from '../../../../ui/labels/libelles/source-de-l-activite.labels'
import type { FiltresDeLaListe } from '../../../../ui/presenters/filtres/filtres-de-la-liste'

export const EnTeteDeLaListe = ({
  filtres,
  options,
  rendezVousFiltrables,
  exportDesAccompagnements,
}: {
  filtres: FiltresDeLaListe
  options: OptionsDeLaBarre
  rendezVousFiltrables: boolean
  exportDesAccompagnements: ReactNode
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
        {exportDesAccompagnements}
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
