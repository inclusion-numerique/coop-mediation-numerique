import {
  type LigneEquipe,
  libelleStatutMembre,
  type RoleMembre,
} from '../../../domain'

export type ContratMembre = {
  readonly type: string | null
  readonly debut: Date | null
  readonly fin: Date | null
}

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

const libellesDeRole: Readonly<Record<RoleMembre, string>> = {
  ConseillerNumerique: 'Conseiller numérique',
  MediateurNumerique: 'Médiateur numérique',
}

export const membreExporte = (
  ligne: LigneEquipe,
  contrat: ContratMembre | null,
): MembreExporte => ({
  prenom: ligne.profil?.prenom ?? null,
  nom: ligne.profil?.nom ?? null,
  role: libellesDeRole[ligne.profil?.role ?? 'MediateurNumerique'],
  contrat,
  email: ligne.email,
  telephone: ligne.profil?.telephone ?? null,
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
})
