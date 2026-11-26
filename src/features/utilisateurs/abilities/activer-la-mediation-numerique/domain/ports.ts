import type {
  ContactAImporter,
  CoordinateurId,
  InscritDeLaListe,
  RattachementsDuCompte,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

export type CompteQuiActive = {
  readonly id: UtilisateurId
  readonly rattachements: RattachementsDuCompte
}

export type LireLeCompteQuiActive = (
  utilisateurId: UtilisateurId,
) => Promise<CompteQuiActive | null>

export type Activer = (activation: {
  readonly utilisateurId: UtilisateurId
  readonly coordinateurId: CoordinateurId
}) => Promise<void>

export type LireLInscritAInscrire = (
  utilisateurId: UtilisateurId,
) => Promise<InscritDeLaListe | null>

export type InscrireALaListeDeDiffusion = (
  contact: ContactAImporter,
) => Promise<void>

export type ActiverLaMediationNumeriquePorts = {
  readonly lireLeCompteQuiActive: LireLeCompteQuiActive
  readonly activer: Activer
  readonly lireLInscritAInscrire: LireLInscritAInscrire
  readonly inscrireALaListeDeDiffusion: InscrireALaListeDeDiffusion
}
