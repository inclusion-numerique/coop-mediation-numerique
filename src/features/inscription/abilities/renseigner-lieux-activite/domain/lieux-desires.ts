import { failure, type Result, success } from '@/libraries/result'
import { AdresseNonValidee } from './errors'
import type { LieuDesire, LieuSoumis } from './lieu-soumis'

const lieuDesire = <Adresse>(
  lieu: LieuSoumis<Adresse>,
): Result<LieuDesire<Adresse>, AdresseNonValidee> => {
  if (lieu._tag === 'LieuConnu') return success(lieu)

  const { adresse } = lieu

  return adresse === null
    ? failure(AdresseNonValidee(lieu.nom))
    : success({ ...lieu, adresse })
}

export const lieuxDesires = <Adresse>(
  lieux: readonly LieuSoumis<Adresse>[],
): Result<readonly LieuDesire<Adresse>[], AdresseNonValidee> =>
  lieux.reduce<Result<readonly LieuDesire<Adresse>[], AdresseNonValidee>>(
    (precedents, lieu) => {
      if (!precedents.success) return precedents

      const desire = lieuDesire(lieu)

      return desire.success
        ? success([...precedents.data, desire.data])
        : desire
    },
    success([]),
  )
