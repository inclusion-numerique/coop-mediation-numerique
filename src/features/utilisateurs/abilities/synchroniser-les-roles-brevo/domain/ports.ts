import type {
  AdresseCourriel,
  ContactAImporter,
} from '@app/web/features/utilisateurs/domain'
import type { IdentifiantDImport } from './identifiant-d-import'
import type { TailleDeLot } from './taille-de-lot'

export type SynchroniserLesRolesBrevoPorts = {
  readonly importer: {
    readonly tailleMax: TailleDeLot
    readonly envoyer: (
      lot: readonly ContactAImporter[],
    ) => Promise<IdentifiantDImport>
  }
  readonly retirer: {
    readonly tailleMax: TailleDeLot
    readonly envoyer: (lot: readonly AdresseCourriel[]) => Promise<void>
  }
}
