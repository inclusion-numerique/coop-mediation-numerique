import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { Email } from './email'
import type { NomComplet } from './nom-complet'
import type { Prenom } from './prenom'

export const Salutation = defineModel(
  z.string().trim().min(1).brand('Salutation'),
)

export type Salutation = Model.TypeOf<typeof Salutation>

export type Identite = {
  readonly prenom: Prenom | null
  readonly nomComplet: NomComplet | null
  readonly email: Email
}

export const salutation = ({
  prenom,
  nomComplet,
  email,
}: Identite): Salutation => Salutation(prenom ?? nomComplet ?? email)
