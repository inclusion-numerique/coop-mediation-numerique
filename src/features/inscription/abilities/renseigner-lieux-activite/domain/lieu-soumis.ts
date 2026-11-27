import type { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuId } from '@/features/inscription/domain'
import type { Siret } from '@/libraries/insee'
import type { IdentifiantCartographie } from './identifiant-cartographie'

type IdentiteDuLieu = {
  readonly nom: Nom
  readonly siret: Siret | null
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}

export type LieuConnu = IdentiteDuLieu & {
  readonly _tag: 'LieuExistant'
  readonly id: LieuId
}

export type LieuNouveauSoumis<Adresse> = IdentiteDuLieu & {
  readonly _tag: 'LieuACreer'
  readonly adresseValidee: Adresse | null
}

export type LieuNouveau<Adresse> = IdentiteDuLieu & {
  readonly _tag: 'LieuACreer'
} & Adresse

export type LieuSoumis<Adresse> = LieuConnu | LieuNouveauSoumis<Adresse>

export type LieuDesire<Adresse> = LieuConnu | LieuNouveau<Adresse>
