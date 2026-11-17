import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const porteesApi = [
  'Activites',
  'Statistiques',
  'Structures',
  'LieuxActivite',
  'Utilisateurs',
] as const

export const PorteeApi = defineModel(z.string().pipe(z.enum(porteesApi)))

export type PorteeApi = Model.TypeOf<typeof PorteeApi>

export const libellesDesPortees: Record<PorteeApi, string> = {
  Activites: 'Activités',
  Statistiques: 'Statistiques',
  Structures: 'Structures',
  LieuxActivite: 'LieuxActivite',
  Utilisateurs: 'Utilisateurs',
}
