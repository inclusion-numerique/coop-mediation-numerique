import type {
  Adresse,
  Localisation,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { failure, type Result, success } from '@/libraries/result'
import type { BanId } from '../../../domain/identifiants/ban-id'
import type {
  IdentiteDuLieuDemande,
  LieuDemande,
  LieuExistant,
} from '../../../domain/rattachement/lieu-demande'
import { AdresseNonValidee } from './errors'

export type LieuNouveauSoumis = IdentiteDuLieuDemande & {
  readonly _tag: 'LieuACreer'
  readonly adresse: Adresse | null
  readonly localisation: Localisation | null
  readonly banId: BanId | null
}

export type LieuSoumis = LieuExistant | LieuNouveauSoumis

const lieuDemande = (
  lieu: LieuSoumis,
): Result<LieuDemande, AdresseNonValidee> => {
  if (lieu._tag === 'LieuExistant') return success(lieu)

  const { adresse, localisation, banId } = lieu

  return adresse === null || localisation === null || banId === null
    ? failure(AdresseNonValidee(lieu.nom))
    : success({ ...lieu, adresse, localisation, banId })
}

export const lieuxDemandes = (
  lieux: readonly LieuSoumis[],
): Result<readonly LieuDemande[], AdresseNonValidee> =>
  lieux.reduce<Result<readonly LieuDemande[], AdresseNonValidee>>(
    (precedents, lieu) => {
      if (!precedents.success) return precedents

      const demande = lieuDemande(lieu)

      return demande.success
        ? success([...precedents.data, demande.data])
        : demande
    },
    success([]),
  )
