import type { CodeInsee } from '@/libraries/insee'
import {
  type CodeDepartement,
  codeDepartementDuCodeInsee,
} from '@/libraries/insee'

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
