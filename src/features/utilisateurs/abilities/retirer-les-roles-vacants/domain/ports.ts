import type {
  AppliquerLePlan,
  JournaliserLeChangement,
  LireLeCompteAReaffecter,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

export type RolesVacants = {
  readonly coordinateursVacants: readonly UtilisateurId[]
  readonly mediateursVacants: readonly UtilisateurId[]
}

export type LireLesRolesVacants = (maintenant: Date) => Promise<RolesVacants>

export type RetirerLesRolesVacantsPorts = {
  readonly lireLesRolesVacants: LireLesRolesVacants
  readonly lireLeCompteAReaffecter: LireLeCompteAReaffecter
  readonly appliquerLePlan: AppliquerLePlan
  readonly journaliserLeChangement: JournaliserLeChangement
}
