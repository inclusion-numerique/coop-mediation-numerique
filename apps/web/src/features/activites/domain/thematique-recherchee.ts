import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import { THEMATIQUES_ADMINISTRATIVES } from './thematique-administrative'
import { THEMATIQUES_DE_MEDIATION } from './thematique-de-mediation'

export const AIDE_AUX_DEMARCHES_ADMINISTRATIVES =
  'AideAuxDemarchesAdministratives'

export const THEMATIQUES_RECHERCHEES = [
  ...THEMATIQUES_DE_MEDIATION,
  AIDE_AUX_DEMARCHES_ADMINISTRATIVES,
  ...THEMATIQUES_ADMINISTRATIVES,
] as const

export const ThematiqueRecherchee = defineModel(
  z.enum(THEMATIQUES_RECHERCHEES).brand('ThematiqueRecherchee'),
)

export type ThematiqueRecherchee = Model.TypeOf<typeof ThematiqueRecherchee>

export const estAdministrative = (thematique: ThematiqueRecherchee): boolean =>
  THEMATIQUES_ADMINISTRATIVES.some(
    (administrative) => administrative === thematique,
  )

export const thematiquesRecherchees: readonly ThematiqueRecherchee[] =
  THEMATIQUES_RECHERCHEES.map(ThematiqueRecherchee)
