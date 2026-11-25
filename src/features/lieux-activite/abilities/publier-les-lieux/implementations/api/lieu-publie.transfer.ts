import {
  type SchemaLieuMediationNumerique,
  toSchemaLieuMediationNumerique,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Aidant, LieuPublie } from '../../domain/lieu-publie'

export type LieuPublieExpose = SchemaLieuMediationNumerique & {
  aidants?: Aidant[]
}

export const lieuPublieExpose = (
  lieu: LieuPublie & { aidants?: Aidant[] },
): LieuPublieExpose => {
  const aidants = lieu.aidants ?? []

  return {
    ...toSchemaLieuMediationNumerique(lieu),
    ...(aidants.length > 0 ? { aidants } : {}),
  }
}
