import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { CalendarIcon } from '@app/web/features/pictograms/digital/CalendarIcon'
import { EcosystemIcon } from '@app/web/features/pictograms/digital/EcosystemIcon'
import { HumanCooperationIcon } from '@app/web/features/pictograms/environment/HumanCooperationIcon'
import { Pictogram } from '@app/web/features/pictograms/pictogram'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import { DEFAULT_PAGE_SIZE } from '@app/web/libs/data-table/toNumberOr'
import { Spinner } from '@app/web/ui/Spinner'
import { formatActiviteDayDate } from '@app/web/utils/activiteDayDateFormat'
import { formatDate } from '@app/web/utils/formatDate'
import { Fragment, ReactNode, Suspense } from 'react'
import { TYPE_ANIMATION_OPTIONS } from '../cra/animation/labels'
import { TYPE_EVENEMENT_OPTIONS } from '../cra/evenement/labels'
import { NATURE_OPTIONS } from '../cra/partenariat/labels'
import { CoordinationEmptyState } from './components/CoordinationEmptyState'
import ListCard from './components/ListCard'
import { ActivitesByDate } from './db/getCoordinationsListPageData'

type TypeActiviteCoordination = 'Animation' | 'Evenement' | 'Partenariat'

const displayTypeActivite: Record<
  TypeActiviteCoordination,
  {
    pictogram: Pictogram
    label: string
  }
> = {
  Animation: { pictogram: EcosystemIcon, label: 'Animation' },
  Evenement: { pictogram: CalendarIcon, label: 'Évènement' },
  Partenariat: { pictogram: HumanCooperationIcon, label: 'Partenariat' },
}

const pageSizeOptions = generatePageSizeSelectOptions([10, 20, 50, 100])

const CountWithLabel = ({ count, label }: { count: number; label: string }) =>
  count === 0 ? null : (
    <>
      &nbsp;·&nbsp;{count} {count > 1 ? `${label}s` : label}
    </>
  )

const CustomLabel = ({
  value,
  customizableValue,
  customValue,
}: {
  value?: string
  customizableValue: string
  customValue: string | null
}) => (customValue && value === customizableValue ? customValue : value)

const SuspensedContent = async ({
  data,
}: {
  data: Promise<{
    activitesByDate: ActivitesByDate[]
    searchParams: { page?: string; lignes?: string }
    searchResult: { totalPages: number; totalCount: number }
  }>
}) => {
  const { searchParams, searchResult, activitesByDate } = await data

  const baseHref = '/coop/mes-coordinations'

  return activitesByDate.length === 0 ? (
    <CoordinationEmptyState />
  ) : (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full fr-my-6v">
        <h2 className="fr-text--bold fr-text--lg fr-mb-0">
          {`${searchResult.totalCount} activité${sPluriel(searchResult.totalCount)} enregistrée${sPluriel(searchResult.totalCount)}`}
        </h2>
      </div>

      {activitesByDate.map(({ date, activites }) => (
        <div key={date} className="fr-mb-8v">
          <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-mt-6v fr-mb-4v">
            {formatActiviteDayDate(date)}
          </h3>
          <div>
            {activites.map((activite) => (
              <ListCard
                key={activite.id}
                contentTop={
                  <>
                    {displayTypeActivite[activite.type].label}
                    {activite.nomEvenement ? (
                      <>&nbsp;·&nbsp;{activite.nomEvenement}</>
                    ) : null}
                    <CountWithLabel
                      count={activite.participants}
                      label="participant"
                    />
                    <CountWithLabel
                      count={activite.partenaires}
                      label="partenaire"
                    />
                  </>
                }
                contentBottom={
                  <>
                    <CustomLabel
                      value={
                        TYPE_ANIMATION_OPTIONS.find(
                          ({ value }) => value === activite?.typeAnimation,
                        )?.label
                      }
                      customizableValue="Autre"
                      customValue={activite.typeAnimationAutre}
                    />
                    <CustomLabel
                      value={
                        TYPE_EVENEMENT_OPTIONS.find(
                          ({ value }) => value === activite?.typeEvenement,
                        )?.label
                      }
                      customizableValue="Autre"
                      customValue={activite.typeEvenementAutre}
                    />
                    <span className="fr-flex fr-flex-wrap">
                      {activite.naturePartenariat?.reduce<ReactNode[]>(
                        (partenariats, value, i) => {
                          if (i > 0)
                            partenariats.push(
                              <Fragment key={`separator-${value}`}>
                                &nbsp;·&nbsp;
                              </Fragment>,
                            )
                          partenariats.push(
                            <CustomLabel
                              key={value}
                              value={
                                NATURE_OPTIONS.find(
                                  (partenariat) => partenariat.value === value,
                                )?.label
                              }
                              customizableValue="Autre"
                              customValue={activite.naturePartenariatAutre}
                            />,
                          )
                          return partenariats
                        },
                        [],
                      )}
                    </span>
                  </>
                }
                pictogram={displayTypeActivite[activite.type].pictogram}
                actions={
                  <span className="fr-text--xs fr-mb-0">
                    Enregistré le{' '}
                    {formatDate(
                      new Date(activite.creation),
                      'dd.MM.yyyy à HH:mm',
                    )}
                  </span>
                }
              />
            ))}
          </div>
        </div>
      ))}
      <PaginationNavWithPageSizeSelect
        className="fr-mt-12v"
        totalPages={searchResult.totalPages}
        baseHref={baseHref}
        searchParams={searchParams}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  )
}

const MesCoordinationsListePage = ({
  data,
}: {
  data: Promise<{
    activitesByDate: ActivitesByDate[]
    searchParams: { page?: string; lignes?: string }
    searchResult: { totalPages: number; totalCount: number }
  }>
}) => {
  return (
    <>
      <Suspense fallback={<Spinner className="fr-mt-6v" />}>
        <SuspensedContent data={data} />
      </Suspense>
    </>
  )
}
export default MesCoordinationsListePage
