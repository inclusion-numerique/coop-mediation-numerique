'use client'

import classNames from 'classnames'
import type { ReactNode } from 'react'
import type { ActivitesFilters } from '@/features/statistiques/domain/filtres-des-activites'
import { ActiviteTypeFilter } from '@/features/statistiques/ui/components/filtres/ActiviteTypeFilter'
import { BeneficiaireFilter } from '@/features/statistiques/ui/components/filtres/BeneficiaireFilter'
import { MediateurFilter } from '@/features/statistiques/ui/components/filtres/MediateurFilter'
import { MoreCoordinateurFilters } from '@/features/statistiques/ui/components/filtres/MoreCoordinateurFilters'
import { MoreMediateurFilters } from '@/features/statistiques/ui/components/filtres/MoreMediateurFilters'
import { PeriodeFilter } from '@/features/statistiques/ui/components/filtres/PeriodeFilter'
import type { MediateurOption } from '@/features/statistiques/ui/presenters/mediateur-option'
import { TagScope } from '@/features/statistiques/ui/presenters/portee-de-tag'
import type { StructureEmployeuseOption } from '@/features/statistiques/ui/presenters/structure-employeuse-option'
import type { VocabulaireDeLaBarre } from '../../labels/barre.labels'
import type { OptionDeBeneficiaire } from '../../presenters/option-de-beneficiaire'

const Filters = ({
  defaultFilters,
  initialMediateursOptions,
  initialBeneficiairesOptions,
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
  vocabulaire,
  filtreDeLieu,
}: {
  defaultFilters: ActivitesFilters
  initialMediateursOptions: MediateurOption[]
  initialBeneficiairesOptions: OptionDeBeneficiaire[]
  structuresEmployeusesOptions: StructureEmployeuseOption[]
  tagsOptions: { id: string; nom: string; scope: TagScope }[]
  isCoordinateur: boolean
  isMediateur: boolean
  beneficiairesFilter?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  enableRdvsFilter?: boolean
  hasCrasV1: boolean
  vocabulaire: VocabulaireDeLaBarre
  filtreDeLieu: ReactNode
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
    {filtreDeLieu}
    {!isCoordinateur && (
      <ActiviteTypeFilter
        defaultValue={{
          types: defaultFilters.types ?? [],
          rdvs: defaultFilters.rdvs ?? [],
        }}
        enableRdvsFilter={enableRdvsFilter}
        vocabulaire={vocabulaire}
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
        vocabulaire={vocabulaire}
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
        vocabulaire={vocabulaire}
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
