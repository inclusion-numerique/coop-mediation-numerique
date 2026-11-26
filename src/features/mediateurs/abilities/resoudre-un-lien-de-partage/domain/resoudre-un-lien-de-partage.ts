import {
  type CoordinateurId,
  LienDePartageId,
  type MediateurId,
  type UtilisateurId,
} from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { LienIntrouvable } from './errors'
import type { PartageResolu } from './partage-resolu'

export type PartageLu = {
  readonly mediateur: {
    readonly mediateurId: MediateurId
    readonly utilisateurId: UtilisateurId
  } | null
  readonly coordinateur: {
    readonly coordinateurId: CoordinateurId
    readonly utilisateurId: UtilisateurId
  } | null
}

export type LireLePartage = (id: LienDePartageId) => Promise<PartageLu | null>

const partageResolu = ({
  mediateur,
  coordinateur,
}: PartageLu): PartageResolu | null => {
  if (mediateur !== null)
    return {
      proprietaire: { _tag: 'Mediateur', mediateurId: mediateur.mediateurId },
      utilisateurId: mediateur.utilisateurId,
    }
  if (coordinateur !== null)
    return {
      proprietaire: {
        _tag: 'Coordinateur',
        coordinateurId: coordinateur.coordinateurId,
      },
      utilisateurId: coordinateur.utilisateurId,
    }
  return null
}

export const resoudreUnLienDePartage =
  ({ lirePartage }: { readonly lirePartage: LireLePartage }) =>
  async (lien: string): Promise<Result<PartageResolu, LienIntrouvable>> => {
    const id = LienDePartageId.safe(lien)
    if (id === null) return failure(LienIntrouvable())

    const partage = await lirePartage(id)
    const resolu = partage === null ? null : partageResolu(partage)

    return resolu === null ? failure(LienIntrouvable()) : success(resolu)
  }
