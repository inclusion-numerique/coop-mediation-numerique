import {
  type LigneEquipe,
  libelleStatutMembre,
  type RoleMembre,
} from '../../../domain'

export type SeveriteDuStatut = 'info' | 'success' | 'warning' | 'neutre'

export type LigneAffichee = {
  readonly cle: string
  readonly ligne: LigneEquipe
  readonly icone: 'invitation' | 'conseiller-numerique' | 'mediateur'
  readonly nomComplet: string | null
  readonly role: string | null
  readonly email: string | null
  readonly structureEmployeuse: string
  readonly libelleStatut: string
  readonly severite: SeveriteDuStatut
  readonly activite: 'actif' | 'inactif' | null
  readonly lienProfil: string | null
}

const libellesDeRole: Readonly<Record<RoleMembre, string>> = {
  ConseillerNumerique: 'Conseiller numérique',
  MediateurNumerique: 'Médiateur numérique',
}

const severites = new Map<string, SeveriteDuStatut>([
  ['Invitation', 'info'],
  ['Actif', 'success'],
  ['Inactif', 'warning'],
])

const nomComplet = ({ profil }: LigneEquipe): string | null => {
  const nom = [profil?.prenom, profil?.nom].filter(Boolean).join(' ')
  return nom === '' ? null : nom
}

const icone = ({ statut, profil }: LigneEquipe): LigneAffichee['icone'] => {
  if (statut.type === 'Invitation') return 'invitation'
  return profil?.role === 'ConseillerNumerique'
    ? 'conseiller-numerique'
    : 'mediateur'
}

const activite = ({ statut }: LigneEquipe): LigneAffichee['activite'] => {
  if (statut.type === 'Actif') return 'actif'
  return statut.type === 'Inactif' ? 'inactif' : null
}

const lienProfil =
  (departementCode: string) =>
  ({ statut, profil }: LigneEquipe): string | null =>
    statut.type === 'Invitation' || profil === null
      ? null
      : `/coop/mon-reseau/${departementCode}/acteurs/${profil.utilisateurId}`

export const lignesAffichees = (
  lignes: readonly LigneEquipe[],
  departementCode: string,
): readonly LigneAffichee[] =>
  lignes.map((ligne) => ({
    cle: `${ligne.statut.type}-${ligne.email}`,
    ligne,
    icone: icone(ligne),
    nomComplet: nomComplet(ligne),
    role:
      ligne.statut.type === 'Invitation'
        ? 'Invitation en attente'
        : libellesDeRole[ligne.profil?.role ?? 'MediateurNumerique'],
    email: ligne.statut.type === 'ProfilSupprime' ? null : ligne.email,
    structureEmployeuse:
      ligne.structureEmployeuse.type === 'Connue'
        ? (ligne.structureEmployeuse.nom ?? '/')
        : '/',
    libelleStatut: libelleStatutMembre(ligne.statut),
    severite: severites.get(ligne.statut.type) ?? 'neutre',
    activite: activite(ligne),
    lienProfil: lienProfil(departementCode)(ligne),
  }))
