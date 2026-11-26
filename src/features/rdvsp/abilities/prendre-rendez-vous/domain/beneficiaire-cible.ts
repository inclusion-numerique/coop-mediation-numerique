import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../domain/identite'

export const BeneficiaireCibleId = defineModel(
  z.guid().brand('BeneficiaireCibleId'),
)
export type BeneficiaireCibleId = Model.TypeOf<typeof BeneficiaireCibleId>

export const MediateurProprietaireId = defineModel(
  z.guid().brand('MediateurProprietaireId'),
)
export type MediateurProprietaireId = Model.TypeOf<
  typeof MediateurProprietaireId
>

export type BeneficiaireCible = {
  readonly id: BeneficiaireCibleId
  readonly mediateurId: MediateurProprietaireId
  readonly usagerId: UsagerId | null
  readonly prenom: PrenomExterne | null
  readonly nom: NomExterne | null
  readonly email: EmailExterne | null
  readonly telephone: TelephoneExterne | null
  readonly adresse: string | null
}
