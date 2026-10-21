import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { Email } from './email'
import type { Nom } from './nom'
import type { Prenom } from './prenom'

export const NomAffiche = defineModel(
  z.string().trim().min(1).brand('NomAffiche'),
)

export type NomAffiche = Model.TypeOf<typeof NomAffiche>

export type Identite = {
  readonly prenom: Prenom | null
  readonly nom: Nom | null
  readonly nomComplet: NomAffiche | null
  readonly email: Email
}

export const nomAffiche = ({
  prenom,
  nom,
  nomComplet,
  email,
}: Identite): NomAffiche =>
  NomAffiche(
    [prenom, nom].filter((partie) => partie !== null).join(' ') ||
      (nomComplet ?? email),
  )
