import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = [
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
  z.enum(VALEURS).brand('ThematiqueAdministrative'),
)

export type ThematiqueAdministrative = Model.TypeOf<
  typeof ThematiqueAdministrative
>

export const thematiquesAdministratives: readonly ThematiqueAdministrative[] =
  VALEURS.map(ThematiqueAdministrative)
