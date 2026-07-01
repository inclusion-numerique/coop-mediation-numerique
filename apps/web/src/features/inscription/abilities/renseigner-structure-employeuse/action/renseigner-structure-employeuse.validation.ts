import { AdresseBanValidation } from '@app/web/external-apis/ban/AdresseBanValidation'
import { requiredSiretValidation } from '@app/web/features/structures/siret/siretValidation'
import { z } from 'zod'
import type { StructureEmployeuseInput } from '../domain'

const StructureEmployeuseShape = z.object({
  id: z.string().uuid().nullish(),
  nom: z.string().min(1, 'Le nom est requis'),
  siret: requiredSiretValidation,
  adresseBan: AdresseBanValidation,
  typologies: z.array(z.string()).nullish(),
})

/** Forme du formulaire (validateur client `useAppForm`). */
export const renseignerStructureEmployeuseFormShape = z.object({
  structureEmployeuse: StructureEmployeuseShape,
})

export type RenseignerStructureEmployeuseFormData = z.infer<
  typeof renseignerStructureEmployeuseFormShape
>

/** Contrat d'input de la server action : valide puis projette vers l'input domaine. */
export const RenseignerStructureEmployeuseValidation =
  renseignerStructureEmployeuseFormShape.transform(
    ({
      structureEmployeuse,
    }): { structureEmployeuse: StructureEmployeuseInput } => ({
      structureEmployeuse: {
        id: structureEmployeuse.id ?? null,
        nom: structureEmployeuse.nom,
        siret: structureEmployeuse.siret,
        adresse: {
          id: structureEmployeuse.adresseBan.id,
          nom: structureEmployeuse.adresseBan.nom,
          commune: structureEmployeuse.adresseBan.commune,
          codeInsee: structureEmployeuse.adresseBan.codeInsee,
          codePostal: structureEmployeuse.adresseBan.codePostal,
          contexte: structureEmployeuse.adresseBan.contexte,
          latitude: structureEmployeuse.adresseBan.latitude,
          longitude: structureEmployeuse.adresseBan.longitude,
        },
        typologies: structureEmployeuse.typologies ?? [],
      },
    }),
  )
