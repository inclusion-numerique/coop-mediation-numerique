import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'

export const ANNEE_NAISSANCE_MIN = 1900

export const AnneeNaissance = (maintenant: Date) =>
  defineModel(
    z
      .number()
      .int()
      .min(ANNEE_NAISSANCE_MIN)
      .max(maintenant.getFullYear())
      .brand('AnneeNaissance'),
  )

export type AnneeNaissance = Model.TypeOf<ReturnType<typeof AnneeNaissance>>

export const anneeNaissanceInvalide =
  'Veuillez renseigner une année de naissance valide'

export const anneeNaissanceValidation = (maintenant: Date) =>
  z
    .number({ error: anneeNaissanceInvalide })
    .int(anneeNaissanceInvalide)
    .min(ANNEE_NAISSANCE_MIN, anneeNaissanceInvalide)
    .max(maintenant.getFullYear(), anneeNaissanceInvalide)
    .nullish()
