import {
  importerDansLaListe,
  retirerDeLaListe,
} from '@app/web/features/utilisateurs/implementation/brevo/liste-de-diffusion'
import {
  IdentifiantDImport,
  type SynchroniserLesRolesBrevoPorts,
  TailleDeLot,
} from '../../domain'

export const listeDeDiffusionPorts: SynchroniserLesRolesBrevoPorts = {
  importer: {
    tailleMax: TailleDeLot(1000),
    envoyer: async (lot) => IdentifiantDImport(await importerDansLaListe(lot)),
  },
  retirer: {
    tailleMax: TailleDeLot(150),
    envoyer: retirerDeLaListe,
  },
}
