import type { UtilisateurId } from '@/features/utilisateurs/domain'

type CompteExiste = (utilisateurId: UtilisateurId) => Promise<boolean>

type FermerLesSessions = (utilisateurId: UtilisateurId) => Promise<number>

export type DeconnecterUnUtilisateurPorts = {
  readonly compteExiste: CompteExiste
  readonly fermerLesSessions: FermerLesSessions
}
