import type { TypologieStructure } from '@/features/employeuse/domain/typologie-de-structure'

export type StructureTrouvee = {
  id?: string | null
  nom: string
  adresse: string
  codePostal: string
  commune: string
  codeInsee: string
  siret: string
  typologie?: TypologieStructure | null
  source: 'database' | 'api'
}
