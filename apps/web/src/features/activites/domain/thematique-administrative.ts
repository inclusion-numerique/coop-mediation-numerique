import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const THEMATIQUES_ADMINISTRATIVES = [
  'PapiersElectionsCitoyennete',
  'FamilleScolarite',
  'SocialSante',
  'TravailFormation',
  'Logement',
  'TransportsMobilite',
  'ArgentImpots',
  'Justice',
  'EtrangersEurope',
  'LoisirsSportsCulture',
  'Associations',
] as const

export const ThematiqueAdministrative = defineModel(
  z.enum(THEMATIQUES_ADMINISTRATIVES).brand('ThematiqueAdministrative'),
)

export type ThematiqueAdministrative = Model.TypeOf<
  typeof ThematiqueAdministrative
>

export const thematiquesAdministratives: readonly ThematiqueAdministrative[] =
  THEMATIQUES_ADMINISTRATIVES.map(ThematiqueAdministrative)
