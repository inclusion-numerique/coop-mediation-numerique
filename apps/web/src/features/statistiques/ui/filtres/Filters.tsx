'use client'

import { ActiviteTypeFilter } from '@app/web/features/statistiques/ui/filtres/ActiviteTypeFilter'
import { BeneficiaireFilter } from '@app/web/features/statistiques/ui/filtres/BeneficiaireFilter'
import { MediateurFilter } from '@app/web/features/statistiques/ui/filtres/MediateurFilter'
import { MoreCoordinateurFilters } from '@app/web/features/statistiques/ui/filtres/MoreCoordinateurFilters'
import { MoreMediateurFilters } from '@app/web/features/statistiques/ui/filtres/MoreMediateurFilters'
import type { MediateurOption } from '@app/web/features/statistiques/ui/filtres/mediateur-option'
import { PeriodeFilter } from '@app/web/features/statistiques/ui/filtres/PeriodeFilter'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import type { StructureEmployeuseOption } from '@app/web/features/statistiques/ui/filtres/plus-de-filtres/structure-employeuse-option'
import { TagScope } from '@app/web/features/statistiques/ui/filtres/portee-de-tag'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import type { OptionDeBeneficiaire } from './option-de-beneficiaire'
import type { VocabulaireDeLaBarre } from './vocabulaire-de-la-barre'

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
