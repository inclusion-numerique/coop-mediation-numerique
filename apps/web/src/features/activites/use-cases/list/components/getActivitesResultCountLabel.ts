import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { ActivitesListPageData } from '../getActivitesListPageData'

export const getActivitesResultCountLabel = ({
  isFiltered,
  searchResult: { matchesCount },
  rdvsWithoutActivite,
}: Pick<
  ActivitesListPageData,
  'isFiltered' | 'searchResult' | 'rdvsWithoutActivite'
>) => {
  const totalCount = matchesCount + rdvsWithoutActivite.length

  return totalCount === 0
    ? isFiltered
      ? 'Aucune activité ne correspond à votre recherche'
      : 'Aucune activité enregistrée'
    : isFiltered
      ? `${totalCount} activité${sPluriel(totalCount)} correspond${totalCount === 1 ? '' : 'ent'} à votre recherche`
      : `${totalCount} activité${sPluriel(totalCount)} enregistrée${sPluriel(totalCount)}`
}
