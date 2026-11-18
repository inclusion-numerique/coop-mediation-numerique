import { nonVide } from '../../../domain/saisie'

export const voieDuRegistre = ({
  numeroVoie,
  repetition,
  nomVoie,
}: {
  readonly numeroVoie: number | null
  readonly repetition: string | null
  readonly nomVoie: string | null
}): string =>
  [numeroVoie?.toString(), nonVide(repetition), nonVide(nomVoie)]
    .filter((jeton): jeton is string => jeton != null)
    .join(' ')
