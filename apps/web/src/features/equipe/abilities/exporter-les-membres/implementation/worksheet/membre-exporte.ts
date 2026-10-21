import {
  type AdresseStructure,
  type LigneEquipe,
  profilDe,
  type StructureEmployeuseMembre,
} from '../../../../domain'
import { libelleDuRole } from '../../../../ui/role-membre.presenter'
import { libelleStatutMembre } from '../../../../ui/statut-membre.presenter'
import type { ContratMembre } from '../../domain'

export type MembreExporte = {
  readonly prenom: string | null
  readonly nom: string | null
  readonly role: string
  readonly contrat: ContratMembre | null
  readonly email: string
  readonly telephone: string | null
  readonly structureEmployeuse: {
    readonly nom: string | null
    readonly adresse: string | null
    readonly commune: string | null
    readonly codePostal: string | null
    readonly codeInsee: string | null
  } | null
  readonly statut: string
}

const adresseExportee = (adresse: AdresseStructure) =>
  adresse.type === 'Connue'
    ? {
        adresse: adresse.voie,
        commune: adresse.commune,
        codePostal: adresse.codePostal,
        codeInsee: adresse.codeInsee,
      }
    : { adresse: null, commune: null, codePostal: null, codeInsee: null }

const structureExportee = (
  structure: StructureEmployeuseMembre,
): MembreExporte['structureEmployeuse'] =>
  structure.type === 'Connue'
    ? { nom: structure.nom, ...adresseExportee(structure.adresse) }
    : null

export const membreExporte = (
  ligne: LigneEquipe,
  contrat: ContratMembre | null,
): MembreExporte => {
  const profil = profilDe(ligne)
  return {
    prenom: profil?.prenom ?? null,
    nom: profil?.nom ?? null,
    role: libelleDuRole(profil?.role ?? null),
    contrat,
    email: ligne.email,
    telephone: profil?.telephone ?? null,
    structureEmployeuse: structureExportee(ligne.structureEmployeuse),
    statut: libelleStatutMembre(ligne.statut),
  }
}
