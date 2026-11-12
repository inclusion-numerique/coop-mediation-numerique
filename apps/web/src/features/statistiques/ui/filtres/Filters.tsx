'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import type { BeneficiaireOption } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/beneficiaire-option'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite'
import { LieuFilter } from '@app/web/features/lieux-activite/ui'
import type { StructureEmployeuseOption } from '@app/web/features/statistiques/db/employeuses-des-activites'
import type { ActivitesFilters } from '@app/web/features/statistiques/domain/filtres-des-statistiques'
import { ActiviteTypeFilter } from '@app/web/features/statistiques/ui/filtres/ActiviteTypeFilter'
import { BeneficiaireFilter } from '@app/web/features/statistiques/ui/filtres/BeneficiaireFilter'
import { MediateurFilter } from '@app/web/features/statistiques/ui/filtres/MediateurFilter'
import { MoreCoordinateurFilters } from '@app/web/features/statistiques/ui/filtres/MoreCoordinateurFilters'
import { MoreMediateurFilters } from '@app/web/features/statistiques/ui/filtres/MoreMediateurFilters'
import { PeriodeFilter } from '@app/web/features/statistiques/ui/filtres/PeriodeFilter'
import { TagScope } from '@app/web/features/statistiques/ui/filtres/portee-de-tag'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import classNames from 'classnames'

const Filters = ({
  defaultFilters,
  initialMediateursOptions,
  initialBeneficiairesOptions,
  communesOptions,
  departementsOptions,
  lieuxActiviteOptions,
  structuresEmployeusesOptions,
  tagsOptions,
  isCoordinateur,
  isMediateur,
  beneficiairesFilter = true,
  minDate,
  maxDate,
  className,
  enableRdvsFilter = false,
  hasCrasV1,
}: {
  defaultFilters: ActivitesFilters
  initialMediateursOptions: MediateurOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
  communesOptions: SelectOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  structuresEmployeusesOptions: StructureEmployeuseOption[]
  tagsOptions: { id: string; nom: string; scope: TagScope }[]
  departementsOptions: SelectOption[]
  isCoordinateur: boolean
  isMediateur: boolean
  beneficiairesFilter?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  enableRdvsFilter?: boolean
  hasCrasV1: boolean
}) => (
  <div
    className={classNames(
      'fr-flex fr-align-items-start fr-flex-wrap fr-flex-gap-2v',
      className,
    )}
  >
    {isCoordinateur && (
      <MediateurFilter
        initialMediateursOptions={initialMediateursOptions}
        defaultValue={defaultFilters.mediateurs ?? []}
      />
    )}
    <PeriodeFilter
      minDate={minDate ?? new Date()}
      maxDate={maxDate}
      defaultValue={
        defaultFilters.au && defaultFilters.du
          ? {
              du: defaultFilters.du,
              au: defaultFilters.au,
            }
          : undefined
      }
    />
    <LieuFilter
      defaultValue={[
        ...(defaultFilters.lieux == null
          ? []
          : [{ type: 'lieu' as const, value: defaultFilters.lieux }]),
        ...(defaultFilters.communes == null
          ? []
          : [{ type: 'commune' as const, value: defaultFilters.communes }]),
        ...(defaultFilters.departements == null
          ? []
          : [
              {
                type: 'departement' as const,
                value: defaultFilters.departements,
              },
            ]),
      ]}
      lieuxActiviteOptions={lieuxActiviteOptions}
      communesOptions={communesOptions}
      departementsOptions={departementsOptions}
    />
    {!isCoordinateur && (
      <ActiviteTypeFilter
        defaultValue={{
          types: defaultFilters.types ?? [],
          rdvs: defaultFilters.rdvs ?? [],
        }}
        enableRdvsFilter={enableRdvsFilter}
      />
    )}
    {isMediateur && beneficiairesFilter && (
      <BeneficiaireFilter
        initialBeneficiairesOptions={initialBeneficiairesOptions}
        defaultValue={defaultFilters.beneficiaires ?? []}
      />
    )}
    {!isCoordinateur && (
      <MoreMediateurFilters
        tagsOptions={tagsOptions}
        structuresEmployeusesOptions={structuresEmployeusesOptions}
        hasCrasV1={hasCrasV1}
        defaultValues={{
          structuresEmployeuses: defaultFilters.structuresEmployeuses ?? [],
          thematiqueNonAdministratives:
            defaultFilters.thematiqueNonAdministratives ?? [],
          thematiqueAdministratives:
            defaultFilters.thematiqueAdministratives ?? [],
          tags: defaultFilters.tags ?? [],
          source: defaultFilters.source ?? '',
        }}
      />
    )}
    {isCoordinateur && (
      <MoreCoordinateurFilters
        tagsOptions={tagsOptions}
        structuresEmployeusesOptions={structuresEmployeusesOptions}
        defaultValues={{
          conseiller_numerique: defaultFilters.conseiller_numerique,
          structuresEmployeuses: defaultFilters.structuresEmployeuses ?? [],
          types: defaultFilters.types ?? [],
          thematiqueNonAdministratives:
            defaultFilters.thematiqueNonAdministratives ?? [],
          thematiqueAdministratives:
            defaultFilters.thematiqueAdministratives ?? [],
          tags: defaultFilters.tags ?? [],
          source: defaultFilters.source ?? '',
        }}
      />
    )}
  </div>
)

export default Filters
