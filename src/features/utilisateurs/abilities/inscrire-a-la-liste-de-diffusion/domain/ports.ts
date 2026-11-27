import type {
  ContactAImporter,
  InscritDeLaListe,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

type LireLInscritAInscrire = (
  utilisateurId: UtilisateurId,
) => Promise<InscritDeLaListe | null>

type ImporterLeContact = (contact: ContactAImporter) => Promise<void>

export type InscrireALaListeDeDiffusionPorts = {
  readonly lireLInscritAInscrire: LireLInscritAInscrire
  readonly importerLeContact: ImporterLeContact
}
