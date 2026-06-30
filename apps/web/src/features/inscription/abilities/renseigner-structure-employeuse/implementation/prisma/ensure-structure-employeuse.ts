import {
  type EnsureStructureEmployeuse,
  StructureId,
} from '@app/web/features/inscription/abilities/renseigner-structure-employeuse/domain'
import { getOrCreateStructureEmployeuse } from '@app/web/server/rpc/inscription/getOrCreateStructureEmployeuse'

/**
 * Implémentation ACL : délègue la création/récupération de la structure à la
 * logique existante de la feature structure, et n'en renvoie que l'identifiant.
 */
export const ensureStructureEmployeuse: EnsureStructureEmployeuse = async ({
  structureEmployeuse,
}) => {
  const structure = await getOrCreateStructureEmployeuse({
    id: structureEmployeuse.id,
    nom: structureEmployeuse.nom,
    siret: structureEmployeuse.siret,
    typologies: [...structureEmployeuse.typologies],
    adresseBan: {
      id: structureEmployeuse.adresse.id,
      nom: structureEmployeuse.adresse.nom,
      commune: structureEmployeuse.adresse.commune,
      codeInsee: structureEmployeuse.adresse.codeInsee,
      codePostal: structureEmployeuse.adresse.codePostal,
      contexte: structureEmployeuse.adresse.contexte,
      latitude: structureEmployeuse.adresse.latitude,
      longitude: structureEmployeuse.adresse.longitude,
    },
  })

  return StructureId(structure.id)
}
