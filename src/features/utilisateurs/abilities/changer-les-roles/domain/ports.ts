import type {
  AppliquerLePlan,
  JournaliserLeChangement,
  LireLeCompteAReaffecter,
} from '@/features/utilisateurs/domain'

export type ChangerLesRolesPorts = {
  readonly lireLeCompteAReaffecter: LireLeCompteAReaffecter
  readonly appliquerLePlan: AppliquerLePlan
  readonly journaliserLeChangement: JournaliserLeChangement
}
