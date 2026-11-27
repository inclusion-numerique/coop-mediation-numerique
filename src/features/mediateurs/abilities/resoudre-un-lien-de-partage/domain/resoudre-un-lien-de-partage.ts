import type { LienDePartageId } from '@/features/mediateurs/domain'
import { failure, type Result, success } from '@/libraries/result'
import { type EchecDeResoudreUnLienDePartage, LienIntrouvable } from './errors'
import type { PartageResolu } from './partage-resolu'
import type { PartageLu, ResoudreUnLienDePartagePorts } from './ports'

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
  ({ lirePartage }: ResoudreUnLienDePartagePorts) =>
  async ({
    lien,
  }: {
    readonly lien: LienDePartageId | null
  }): Promise<Result<PartageResolu, EchecDeResoudreUnLienDePartage>> => {
    if (lien === null) return failure(LienIntrouvable())

    const partage = await lirePartage(lien)
    const resolu = partage === null ? null : partageResolu(partage)

    return resolu === null ? failure(LienIntrouvable()) : success(resolu)
  }
