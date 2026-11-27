import { z } from 'zod'
import {
  type TypologieStructure,
  typologiesStructure,
} from '@/features/employeuse/domain/typologie-de-structure'
import { Siret } from '@/libraries/insee'

const estUneTypologieDeStructure = (
  valeur: unknown,
): valeur is TypologieStructure =>
  typeof valeur === 'string' && Object.hasOwn(typologiesStructure, valeur)

const EmployeuseChoisieValidation = z.object(
  {
    siret: Siret.schema,
    nom: z.string().trim().min(1),
    commune: z.string().trim(),
    adresse: z.string().trim(),
    codePostal: z.string().trim(),
    codeInsee: z.string().trim(),
    id: z.string().nullable().exactOptional(),
    typologie: z
      .custom<TypologieStructure>(estUneTypologieDeStructure)
      .nullable()
      .exactOptional(),
    source: z.enum(['database', 'api']),
  },
  {
    error: 'Veuillez sélectionner votre structure employeuse',
  },
)

export const RenseignerStructureEmployeuseValidation = z.object({
  structure: EmployeuseChoisieValidation,
})

export type EmployeuseChoisie = z.infer<typeof EmployeuseChoisieValidation>
