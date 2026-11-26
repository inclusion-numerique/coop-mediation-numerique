import type {
  ContactAImporter,
  CoordinateurId,
  InscritDeLaListe,
} from '@/features/utilisateurs/domain'

export type CompteQuiActive = {
  readonly id: string
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}

export type LireLeCompteQuiActive = (
  utilisateurId: string,
) => Promise<CompteQuiActive | null>

export type Activer = (activation: {
  readonly utilisateurId: string
  readonly coordinateurId: CoordinateurId
}) => Promise<void>

export type LireLInscritAInscrire = (
  utilisateurId: string,
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
