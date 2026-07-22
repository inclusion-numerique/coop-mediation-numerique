import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { findOrCreateStructureAdministrative } from '@app/web/features/structures/findOrCreateStructureAdministrative'

type StructureEmployeuseWithAdresseBan = {
  id?: string | null
  nom: string
  adresseBan: AdresseBanData
  siret: string
  typologies?: string[] | null
}

type StructureEmployeuseWithSeparateFields = {
  id?: string | null
  nom: string
  adresse: string
  commune: string
  codeInsee: string
  siret: string
  codePostal?: string | null
  typologies?: string[] | null
}

type StructureEmployeuseInput =
  | StructureEmployeuseWithAdresseBan
  | StructureEmployeuseWithSeparateFields

const hasAdresseBan = (
  input: StructureEmployeuseInput,
): input is StructureEmployeuseWithAdresseBan => 'adresseBan' in input

/**
 * Point d'entrée du rôle EMPLOYEUSE à l'inscription. Adaptateur mince : normalise l'input
 * (variante BAN ou champs séparés) puis délègue à `findOrCreateStructureAdministrative`, le chemin
 * de création UNIQUE des structures administratives (dédup hiérarchique SIRET/nom + géocodage BAN).
 * Aucune logique propre : l'inscription hérite ainsi de la même déduplication que la synchro
 * Dataspace et l'import SIRET (ADR-002 étape 4).
 */
export const getOrCreateStructureEmployeuse = (
  structureEmployeuse: StructureEmployeuseInput,
): Promise<{ id: string; mainId: number | null }> => {
  const { siret, nom, id } = structureEmployeuse

  const adresse = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.nom
    : structureEmployeuse.adresse
  const commune = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.commune
    : structureEmployeuse.commune
  const codeInsee = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.codeInsee
    : structureEmployeuse.codeInsee
  const codePostal = hasAdresseBan(structureEmployeuse)
    ? structureEmployeuse.adresseBan.codePostal
    : (structureEmployeuse.codePostal ?? '')

  return findOrCreateStructureAdministrative({
    coopId: id,
    siret,
    nom,
    adresse,
    commune,
    codeInsee,
    codePostal,
  })
}
