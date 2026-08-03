import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { IdentiteEmployeuse } from '@app/web/features/employeuse'

type StructureEmployeuseWithAdresseBan = {
  nom: string
  adresseBan: AdresseBanData
  siret: string
}

type StructureEmployeuseWithSeparateFields = {
  nom: string
  adresse: string
  commune: string
  codeInsee: string
  siret: string
  codePostal?: string | null
}

type StructureEmployeuseInput =
  | StructureEmployeuseWithAdresseBan
  | StructureEmployeuseWithSeparateFields

const hasAdresseBan = (
  input: StructureEmployeuseInput,
): input is StructureEmployeuseWithAdresseBan => 'adresseBan' in input

/**
 * Traduit la saisie d'inscription en identité du domaine. Le formulaire propose deux formes selon
 * la source du choix — une adresse BAN complète, ou des champs séparés — pour une même information.
 * Adaptateur sans logique : la validation appartient au value object.
 */
export const toIdentiteEmployeuse = (
  structureEmployeuse: StructureEmployeuseInput,
): IdentiteEmployeuse =>
  IdentiteEmployeuse({
    siret: structureEmployeuse.siret,
    denomination: structureEmployeuse.nom,
    adresse: hasAdresseBan(structureEmployeuse)
      ? {
          voie: structureEmployeuse.adresseBan.nom,
          commune: structureEmployeuse.adresseBan.commune,
          codePostal: structureEmployeuse.adresseBan.codePostal,
          codeInsee: structureEmployeuse.adresseBan.codeInsee,
        }
      : {
          voie: structureEmployeuse.adresse,
          commune: structureEmployeuse.commune,
          codePostal: structureEmployeuse.codePostal || null,
          codeInsee: structureEmployeuse.codeInsee,
        },
  })
