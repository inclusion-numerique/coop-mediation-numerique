import { failure, type Result, success } from '@/libraries/result'
import { AdresseNonValidee } from './errors'
import type { LieuDesire, LieuSoumis } from './lieu-soumis'

const lieuDesire = <Adresse extends object>(
  lieu: LieuSoumis<Adresse>,
): Result<LieuDesire<Adresse>, AdresseNonValidee> => {
  if (lieu._tag === 'LieuExistant') return success(lieu)

  const { adresseValidee, ...identite } = lieu

  return adresseValidee === null
    ? failure(AdresseNonValidee(lieu.nom))
    : success({ ...identite, ...adresseValidee })
}

export const lieuxDesires = <Adresse extends object>(
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
