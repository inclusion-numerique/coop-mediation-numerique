import { departementsByCode } from '@app/web/data/collectivites-territoriales/departements'
import { getDepartementFromCode } from '@app/web/utils/getDepartementFromCodeInsee'
import { notFound } from 'next/navigation'

export const getDepartementFromCodeOrThrowNotFound = (
  departementCode: string,
) => {
  if (!departementsByCode.has(departementCode)) {
    return notFound()
  }
  return getDepartementFromCode(departementCode)
}
