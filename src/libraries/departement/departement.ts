import { z } from 'zod'
import { departementsByCode } from '@/libraries/departement/departements'
import {
  CodeDepartement,
  CodeInsee,
  codeDepartementDuCodeInsee,
} from '@/libraries/insee'
import { defineModel, type Model } from '@/libraries/model'
import { failure, type Result, success } from '@/libraries/result'

export const NomDepartement = defineModel(
  z.string().trim().min(1).brand('NomDepartement'),
)

export type NomDepartement = Model.TypeOf<typeof NomDepartement>

export type Departement = {
  readonly code: CodeDepartement
  readonly nom: NomDepartement
}

export type DepartementInconnu = {
  readonly _tag: 'DepartementInconnu'
  readonly code: string
}

export const DepartementInconnu = (code: string): DepartementInconnu => ({
  _tag: 'DepartementInconnu',
  code,
})

export const DEPARTEMENT_PAR_DEFAUT = CodeDepartement('75')

const departementDuReferentiel = (
  code: CodeDepartement,
): Departement | null => {
  const departement = departementsByCode.get(code)
  return departement === undefined
    ? null
    : { code, nom: NomDepartement(departement.nom) }
}

export const departementConnu = (code: string): Departement | null => {
  const codeDepartement = CodeDepartement.safe(code)
  return codeDepartement === null
    ? null
    : departementDuReferentiel(codeDepartement)
}

export const departementDuCode = (
  code: string,
): Result<Departement, DepartementInconnu> => {
  const departement = departementConnu(code)
  return departement === null
    ? failure(DepartementInconnu(code))
    : success(departement)
}

const departementsDistincts = (
  codes: readonly CodeDepartement[],
): CodeDepartement[] => [...new Set(codes)]

export const departementsDesCodesInsee = (
  codesInsee: readonly string[],
): Departement[] =>
  departementsDistincts(
    codesInsee
      .map(CodeInsee.safe)
      .filter((code) => code !== null)
      .map(codeDepartementDuCodeInsee),
  )
    .map(departementDuReferentiel)
    .filter((departement) => departement !== null)
