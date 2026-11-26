import type {
  AdresseCourriel,
  ContactAImporter,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type { IdentifiantDImport } from './identifiant-d-import'
import type { LectureDesInscrits } from './synchronisation'

export type LireLesInscrits = () => Promise<LectureDesInscrits>

export type ImporterUnLot = (
  lot: readonly ContactAImporter[],
) => Promise<Result<IdentifiantDImport, EchecTechnique>>

export type RetirerUnLot = (
  lot: readonly AdresseCourriel[],
) => Promise<Result<void, EchecTechnique>>

export type SynchroniserLesRolesBrevoPorts = {
  readonly lireLesInscrits: LireLesInscrits
  readonly importerUnLot: ImporterUnLot
  readonly retirerUnLot: RetirerUnLot
}
