import type {
  ContactAImporter,
  InscritDeLaListe,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

export type LireLInscritAInscrire = (
  utilisateurId: UtilisateurId,
) => Promise<InscritDeLaListe | null>

export type ImporterLeContact = (contact: ContactAImporter) => Promise<void>

export type InscrireALaListeDeDiffusionPorts = {
  readonly lireLInscritAInscrire: LireLInscritAInscrire
  readonly importerLeContact: ImporterLeContact
}
