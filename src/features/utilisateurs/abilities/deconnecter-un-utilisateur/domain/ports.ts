import type { UtilisateurId } from '@/features/utilisateurs/domain'

export type CompteExiste = (utilisateurId: UtilisateurId) => Promise<boolean>

export type FermerLesSessions = (
  utilisateurId: UtilisateurId,
) => Promise<number>

export type DeconnecterUnUtilisateurPorts = {
  readonly compteExiste: CompteExiste
  readonly fermerLesSessions: FermerLesSessions
}
