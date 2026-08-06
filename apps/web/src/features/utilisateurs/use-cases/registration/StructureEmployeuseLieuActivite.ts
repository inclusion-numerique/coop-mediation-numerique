import z from 'zod'

export const StructureEmployeuseLieuActiviteValidation = z.object({
  userId: z.string().uuid(),
  // Identifiant entier de `main.structure_administrative` (ADR-002 étape 6) : l'employeuse est
  // matérialisée en lieu depuis les données main, plus depuis l'uuid coop.
  structureEmployeuseId: z.number().int(),
  estLieuActivite: z.boolean(),
})

export type StructureEmployeuseLieuActiviteData = z.infer<
  typeof StructureEmployeuseLieuActiviteValidation
>
