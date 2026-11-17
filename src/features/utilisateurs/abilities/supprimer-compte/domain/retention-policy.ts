import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const retentionPolicies = [
  'InscritJamaisActif',
  'InactifDepuisDeuxAns',
] as const

export type NomRetentionPolicy = (typeof retentionPolicies)[number]

export const RetentionPolicy = defineModel(
  z.enum(retentionPolicies).brand('RetentionPolicy'),
)

export type RetentionPolicy = Model.TypeOf<typeof RetentionPolicy>
