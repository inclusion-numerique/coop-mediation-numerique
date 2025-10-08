import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import { ActivitesListPageData } from '../getActivitesListPageData'

export const getActivitesResultCountLabel = ({
  isFiltered,
  searchResult: { matchesCount, activitesMatchesCount, rdvMatchesCount },
  only,
}: Pick<ActivitesListPageData, 'isFiltered' | 'searchResult'> & {
  only?: 'activite' | 'rdv'
}) => {
  const count =
    only === 'activite'
      ? activitesMatchesCount
      : only === 'rdv'
        ? rdvMatchesCount
        : matchesCount

  return count === 0
    ? isFiltered
      ? 'Aucune activité ne correspond à votre recherche'
      : 'Aucune activité enregistrée'
    : isFiltered
      ? `${count} activité${sPluriel(count)} correspond${count === 1 ? '' : 'ent'} à votre recherche`
      : `${count} activité${sPluriel(count)} enregistrée${sPluriel(count)}`
}
