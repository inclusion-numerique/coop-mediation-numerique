import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const NomAffiche = defineModel(
  z.string().trim().min(1).brand('NomAffiche'),
)

export type NomAffiche = Model.TypeOf<typeof NomAffiche>

export type IdentiteAffichable = {
  readonly prenom: string | null
  readonly nom: string | null
  readonly nomComplet: string | null
  readonly courriel: string
}

const renseigne = (partie: string | null): partie is string =>
  partie !== null && partie.trim() !== ''

export const nomAffiche = ({
  prenom,
  nom,
  nomComplet,
  courriel,
}: IdentiteAffichable): NomAffiche =>
  NomAffiche(
    [prenom, nom].filter(renseigne).join(' ') ||
      (renseigne(nomComplet) ? nomComplet : courriel),
  )
