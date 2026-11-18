import {
  Departement,
  departementsByCode,
} from '@/libraries/departement/departements'

export const getDepartementCodeFromCodeInsee = (codeInsee: string): string =>
  codeInsee.startsWith('97') ? codeInsee.slice(0, 3) : codeInsee.slice(0, 2)

export const getDepartementsFromCodesInsee = (
  codesInsee: string[],
): Departement[] => {
  const codes = new Set(codesInsee.map(getDepartementCodeFromCodeInsee))

  return [...codes.values()]
    .map((code) => departementsByCode.get(code))
    .filter((departement) => departement !== undefined)
}
