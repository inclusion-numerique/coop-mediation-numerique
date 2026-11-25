import {
  importerDansLaListe,
  retirerDeLaListe,
} from '@/features/utilisateurs/implementations/brevo/liste-de-diffusion.mutation'
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
