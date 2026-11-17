import {
  type Departement,
  departementDeLActeur,
  departementDuCode,
} from '@app/web/libraries/departement'
import { CodeInsee } from '@app/web/libraries/insee'

export const getUserDepartement = (user: {
  emplois?: { structure: { codeInsee: string | null } }[]
}): Departement | null => {
  const code = departementDeLActeur({
    employeuse: CodeInsee.safe(user.emplois?.at(0)?.structure.codeInsee ?? ''),
    lieux: [],
  })
  const departement = code === null ? null : departementDuCode(code)
  return departement?.success ? departement.data : null
}
