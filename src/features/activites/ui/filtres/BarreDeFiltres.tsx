'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { LieuFilter } from './FiltreDeLieu'
import { PeriodeFilter } from './FiltreDePeriode'
import { ActiviteTypeFilter } from './FiltreDeType'
import type {
  FiltresDeLaListe,
  OptionDEmployeuse,
  OptionDeTag,
  PeriodeCouverte,
} from './filtres-de-la-liste'
import { MoreMediateurFilters } from './PlusDeFiltres'

export type OptionsDeLaBarre = {
  readonly communes: SelectOption[]
  readonly departements: SelectOption[]
  readonly lieux: SelectOption[]
  readonly employeuses: readonly OptionDEmployeuse[]
  readonly tags: readonly OptionDeTag[]
  readonly periodeCouverte: PeriodeCouverte
  readonly importsV1: boolean
}

export const BarreDeFiltres = ({
  filtres,
  options,
  rendezVousFiltrables,
}: {
  filtres: FiltresDeLaListe
  options: OptionsDeLaBarre
  rendezVousFiltrables: boolean
}) => (
  <div className="fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v">
    <PeriodeFilter
      minDate={options.periodeCouverte.first ?? new Date()}
      maxDate={options.periodeCouverte.last}
      defaultValue={
        filtres.au && filtres.du
          ? { du: filtres.du, au: filtres.au }
          : undefined
      }
    />
    <LieuFilter
      defaultValue={[
        ...(filtres.lieux === undefined
          ? []
          : [{ type: 'lieu' as const, value: filtres.lieux }]),
        ...(filtres.communes === undefined
          ? []
          : [{ type: 'commune' as const, value: filtres.communes }]),
        ...(filtres.departements === undefined
          ? []
          : [{ type: 'departement' as const, value: filtres.departements }]),
      ]}
      lieuxActiviteOptions={options.lieux}
      communesOptions={options.communes}
      departementsOptions={options.departements}
    />
    <ActiviteTypeFilter
      defaultValue={{ types: filtres.types ?? [], rdvs: filtres.rdvs ?? [] }}
      enableRdvsFilter={rendezVousFiltrables}
    />
    <MoreMediateurFilters
      tagsOptions={options.tags}
      structuresEmployeusesOptions={[...options.employeuses]}
      hasCrasV1={options.importsV1}
      defaultValues={{
        structuresEmployeuses: filtres.structuresEmployeuses ?? [],
        thematiqueNonAdministratives:
          filtres.thematiqueNonAdministratives ?? [],
        thematiqueAdministratives: filtres.thematiqueAdministratives ?? [],
        tags: filtres.tags ?? [],
        source: filtres.source ?? '',
      }}
    />
  </div>
)
