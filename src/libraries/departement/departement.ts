import { z } from 'zod'
import { departementsByCode } from '@/data/collectivites-territoriales/departements'
import { CodeDepartement } from '@/libraries/insee'
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

export const departementDuCode = (
  code: string,
): Result<Departement, DepartementInconnu> => {
  const codeDepartement = CodeDepartement.safe(code)
  const departement =
    codeDepartement === null ? null : departementDuReferentiel(codeDepartement)
  return departement === null
    ? failure(DepartementInconnu(code))
    : success(departement)
}
