import type { CodeDepartement } from '@app/web/libraries/departement'
import { type LigneEquipe, profilDe } from '../../../domain'
import { libelleDuRole } from '../../../ui/role-membre.presenter'
import { libelleStatutMembre } from '../../../ui/statut-membre.presenter'

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

const severites = new Map<string, SeveriteDuStatut>([
  ['Invitation', 'info'],
  ['Actif', 'success'],
  ['Inactif', 'warning'],
])

const nomComplet = (ligne: LigneEquipe): string | null => {
  const profil = profilDe(ligne)
  const nom = [profil?.prenom, profil?.nom].filter(Boolean).join(' ')
  return nom === '' ? null : nom
}

const icone = (ligne: LigneEquipe): LigneAffichee['icone'] => {
  if (ligne.statut.type === 'Invitation') return 'invitation'
  return profilDe(ligne)?.role === 'ConseillerNumerique'
    ? 'conseiller-numerique'
    : 'mediateur'
}

const activite = ({ statut }: LigneEquipe): LigneAffichee['activite'] => {
  if (statut.type === 'Actif') return 'actif'
  return statut.type === 'Inactif' ? 'inactif' : null
}

const lienProfil =
  (departementCode: CodeDepartement) =>
  ({ statut, personne }: LigneEquipe): string | null =>
    statut.type === 'Invitation' || personne.type === 'SansCompte'
      ? null
      : `/coop/mon-reseau/${departementCode}/acteurs/${personne.profil.utilisateurId}`

export const lignesAffichees = (
  lignes: readonly LigneEquipe[],
  departementCode: CodeDepartement,
): readonly LigneAffichee[] =>
  lignes.map((ligne) => ({
    cle: `${ligne.statut.type}-${ligne.email}`,
    ligne,
    icone: icone(ligne),
    nomComplet: nomComplet(ligne),
    role:
      ligne.statut.type === 'Invitation'
        ? 'Invitation en attente'
        : libelleDuRole(profilDe(ligne)?.role ?? null),
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
