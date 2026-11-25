import { CodeInsee } from '@/libraries/insee'
import { type Departement, departementDuCode } from './departement'
import { departementDeLActeur } from './departement-de-l-acteur'

export const getUserDepartement = (user: {
  emplois?: readonly { structure: { codeInsee: string | null } }[]
}): Departement | null => {
  const code = departementDeLActeur({
    employeuse: CodeInsee.safe(user.emplois?.at(0)?.structure.codeInsee ?? ''),
    lieux: [],
  })
  const departement = code === null ? null : departementDuCode(code)
  return departement?.success ? departement.data : null
}
