/**
 * Normalise tous les téléphones bénéficiaires vers la forme canonique
 * (international), via le même value object que le write path. Opération de
 * maintenance idempotente : ne touche que les numéros qui changent, ignore les
 * numéros invalides (laissés tels quels).
 */
export type NormaliserTelephonesResult = {
  readonly updated: number
  readonly skipped: number
}

export type NormaliserTelephones = () => Promise<NormaliserTelephonesResult>
