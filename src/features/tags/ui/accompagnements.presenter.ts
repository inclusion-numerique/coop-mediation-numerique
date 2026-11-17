import { numberToString } from '@app/web/utils/formatNumber'

export const infobulleDesAccompagnements = (
  accompagnements: number,
): string => {
  if (accompagnements === 0) return 'Aucun accompagnement n’est lié à ce tag'
  if (accompagnements === 1) return '1 accompagnement est lié à ce tag'
  return `${numberToString(accompagnements)} accompagnements sont liés à ce tag`
}
