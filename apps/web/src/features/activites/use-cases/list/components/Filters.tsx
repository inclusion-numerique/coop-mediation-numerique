import { ActiviteTypeFilter } from '@app/web/components/filters/ActiviteTypeFilter'
import { BeneficiaireFilter } from '@app/web/components/filters/BeneficiaireFilter'
import { MediateurFilter } from '@app/web/components/filters/MediateurFilter'
import { MoreCoordinateurFilters } from '@app/web/components/filters/MoreCoordinateurFilters'
import { MoreMediateurFilters } from '@app/web/components/filters/MoreMediateurFilters'
import { PeriodeFilter } from '@app/web/components/filters/PeriodeFilter'
import departements from '@app/web/data/collectivites-territoriales/departements.json'
import type { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import { LieuFilter } from '@app/web/features/lieux-activite/use-cases/filter/LieuFilter'
import type { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import classNames from 'classnames'
import { TagScope } from '../../tags/tagScope'
import type { ActivitesFilters } from '../validation/ActivitesFilters'

const Filters = ({
  defaultFilters,
  initialMediateursOptions,
  initialBeneficiairesOptions,
  tagsOptions,
  isCoordinateur,
  isMediateur,
  beneficiairesFilter = true,
  minDate,
  className,
  enableRdvsFilter = false,
}: {
  defaultFilters: ActivitesFilters
  initialMediateursOptions: MediateurOption[]
  initialBeneficiairesOptions: BeneficiaireOption[]
  tagsOptions: { id: string; nom: string; scope: TagScope }[]
  isCoordinateur: boolean
  isMediateur: boolean
  beneficiairesFilter?: boolean
  minDate?: Date
  className?: string
  enableRdvsFilter?: boolean
}) => {
  const departementsParams = (defaultFilters.departements ?? []).map(
    (value) => {
      const departement = departements.find((d) => d.code === value)
      return {
        label: `${departement?.code} · ${departement?.nom}`,
        value: departement?.code ?? '',
      }
    },
  )

  return (
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
        lieuxParams={[]}
        communesParams={[]}
        departementsParams={departementsParams}
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
          defaultValues={{
            thematiqueNonAdministratives:
              defaultFilters.thematiqueNonAdministratives ?? [],
            thematiqueAdministratives:
              defaultFilters.thematiqueAdministratives ?? [],
            tags: defaultFilters.tags ?? [],
          }}
        />
      )}
      {isCoordinateur && (
        <MoreCoordinateurFilters
          tagsOptions={tagsOptions}
          defaultValues={{
            conseiller_numerique: defaultFilters.conseiller_numerique,
            types: defaultFilters.types ?? [],
            thematiqueNonAdministratives:
              defaultFilters.thematiqueNonAdministratives ?? [],
            thematiqueAdministratives:
              defaultFilters.thematiqueAdministratives ?? [],
            tags: defaultFilters.tags ?? [],
          }}
        />
      )}
    </div>
  )
}

export default Filters
