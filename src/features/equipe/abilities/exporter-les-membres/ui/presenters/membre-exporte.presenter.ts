import {
  type AdresseStructure,
  type LigneEquipe,
  profilDe,
  type StructureEmployeuseMembre,
} from '../../../../domain'
import { libelleDuRole } from '../../../../ui/presenters/role-membre.presenter'
import { libelleStatutMembre } from '../../../../ui/presenters/statut-membre.presenter'
import type { ContratMembre } from '../../domain'

const adresseExportee = (adresse: AdresseStructure) =>
  adresse.type === 'Connue'
    ? {
        adresse: adresse.voie,
        commune: adresse.commune,
        codePostal: adresse.codePostal,
        codeInsee: adresse.codeInsee,
      }
    : { adresse: null, commune: null, codePostal: null, codeInsee: null }

const structureExportee = (structure: StructureEmployeuseMembre) =>
  structure.type === 'Connue'
    ? { nom: structure.nom, ...adresseExportee(structure.adresse) }
    : null

export const membreExporte = (
  ligne: LigneEquipe,
  contrat: ContratMembre | null,
) => {
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
