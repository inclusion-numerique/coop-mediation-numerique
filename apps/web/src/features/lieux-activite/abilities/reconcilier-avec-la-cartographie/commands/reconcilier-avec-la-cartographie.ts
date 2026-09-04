import type {
  AppliquerLaReconciliation,
  LireLesLieuxCarto,
  Reconciliation,
} from '../domain'
import { lieuxCoopReunis } from '../domain'

/**
 * Réaligne les lieux de la coop sur la cartographie nationale.
 *
 * La cartographie est l'autorité sur ce qui désigne un même endroit : quand
 * elle réunit sous un identifiant composite plusieurs lieux que la coop tient
 * pour distincts, c'est qu'ils n'en font qu'un. La coop suit — elle relie ce
 * qui est relié et fusionne ce qui est réuni.
 */
export const reconcilierAvecLaCartographie = async ({
  ports: { lireLesLieuxCarto, appliquerLaReconciliation },
}: {
  readonly ports: {
    readonly lireLesLieuxCarto: LireLesLieuxCarto
    readonly appliquerLaReconciliation: AppliquerLaReconciliation
  }
}): Promise<Reconciliation> =>
  appliquerLaReconciliation(lieuxCoopReunis(await lireLesLieuxCarto()))
