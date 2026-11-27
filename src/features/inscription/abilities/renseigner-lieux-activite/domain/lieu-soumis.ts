import type { LieuId } from '@/features/inscription/domain'
import type { IdentifiantCartographie } from './identifiant-cartographie'

type IdentiteDuLieu = {
  readonly nom: string
  readonly siret: string | null
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}

export type LieuConnu = IdentiteDuLieu & {
  readonly _tag: 'LieuConnu'
  readonly id: LieuId
}

export type LieuNouveau<Adresse> = IdentiteDuLieu & {
  readonly _tag: 'LieuNouveau'
  readonly adresse: Adresse
}

export type LieuSoumis<Adresse> = LieuConnu | LieuNouveau<Adresse | null>

export type LieuDesire<Adresse> = LieuConnu | LieuNouveau<Adresse>
