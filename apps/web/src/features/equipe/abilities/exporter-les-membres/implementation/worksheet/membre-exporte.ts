import { type LigneEquipe, profilDe } from '../../../../domain'
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
    structureEmployeuse:
      ligne.structureEmployeuse.type === 'Connue'
        ? {
            nom: ligne.structureEmployeuse.nom,
            adresse: ligne.structureEmployeuse.adresse,
            commune: ligne.structureEmployeuse.commune,
            codePostal: ligne.structureEmployeuse.codePostal,
            codeInsee: ligne.structureEmployeuse.codeInsee,
          }
        : null,
    statut: libelleStatutMembre(ligne.statut),
  }
}
