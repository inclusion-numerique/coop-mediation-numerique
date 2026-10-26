import {
  type CodeDepartement,
  codeDepartementDuCodeInsee,
} from './code-departement'
import type { CodeInsee } from './code-insee'

export type TerritoireDeLActeur = {
  readonly employeuse: CodeInsee | null
  readonly lieux: readonly CodeInsee[]
}

export const departementDeLActeur = ({
  employeuse,
  lieux,
}: TerritoireDeLActeur): CodeDepartement | null => {
  const codeInsee = employeuse ?? lieux.at(0) ?? null
  return codeInsee === null ? null : codeDepartementDuCodeInsee(codeInsee)
}
