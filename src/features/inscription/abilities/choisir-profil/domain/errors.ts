import type {
  InscriptionDejaValidee,
  InscriptionIntrouvable,
} from '@/features/inscription/domain'

export type EchecDeChoisirProfil =
  | InscriptionIntrouvable
  | InscriptionDejaValidee
