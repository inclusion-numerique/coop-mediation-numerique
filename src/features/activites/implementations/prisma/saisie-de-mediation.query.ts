import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActiviteId,
  ActiviteIntrouvable,
  IdentifiantCraV1,
  LieuActiviteId,
  LieuInutilisable,
  type LieuSaisi,
  type LieuUtilisable,
  type MediateurId,
  type RdvId,
  RendezVousIndisponible,
  type TypeDActivite,
  TypeDActiviteIncompatible,
} from '../../domain'
import {
  type ActiviteDeMediationPrecedente,
  lireLActiviteDeMediationPrecedente,
} from './activite-de-mediation.mutation'

export type EnregistrementDeMediation =
  | { readonly _tag: 'Creation'; readonly id: ActiviteId }
  | {
      readonly _tag: 'Modification'
      readonly id: ActiviteId
      readonly creation: Date
      readonly identifiantV1: IdentifiantCraV1 | null
      readonly precedente: ActiviteDeMediationPrecedente
    }

export const enregistrementDeMediation = async ({
  id,
  type,
  mediateurId,
}: {
  readonly id: ActiviteId | null
  readonly type: TypeDActivite
  readonly mediateurId: MediateurId
}): Promise<
  Result<
    EnregistrementDeMediation,
    ActiviteIntrouvable | TypeDActiviteIncompatible
  >
> => {
  if (id === null) {
    return success({ _tag: 'Creation', id: ActiviteId(v4()) })
  }
  const existante = await lireLActiviteDeMediationPrecedente({
    id,
    mediateurId,
  })
  if (existante === null) return failure(ActiviteIntrouvable())
  if (existante.type !== type) return failure(TypeDActiviteIncompatible())
  return success({
    _tag: 'Modification',
    id,
    creation: existante.creation,
    identifiantV1:
      existante.identifiantV1 === null
        ? null
        : IdentifiantCraV1(existante.identifiantV1),
    precedente: existante.precedente,
  })
}

export const lieuVerifie = async (
  lieu: LieuSaisi,
  enregistrement: EnregistrementDeMediation,
  lieuUtilisable: LieuUtilisable,
): Promise<Result<null, LieuInutilisable>> => {
  if (lieu._tag !== 'LieuActivite') return success(null)
  const actuel =
    enregistrement._tag === 'Modification' &&
    enregistrement.precedente.lieuActiviteId !== null
      ? LieuActiviteId(enregistrement.precedente.lieuActiviteId)
      : null
  return (await lieuUtilisable(lieu.lieuActiviteId, actuel))
    ? success(null)
    : failure(LieuInutilisable())
}

const rendezVousDUnAutreMediateur = async (
  rdvId: RdvId,
  mediateurId: string,
): Promise<boolean> =>
  (await prismaClient.rdv.count({
    where: {
      id: rdvId,
      rdvAccount: { user: { mediateur: { id: { not: mediateurId } } } },
    },
  })) > 0

const rendezVousDejaSaisi = async (
  rdvId: RdvId,
  activiteId: ActiviteId,
): Promise<boolean> =>
  (await prismaClient.activite.count({
    where: { rdvId, suppression: null, id: { not: activiteId } },
  })) > 0

export const rendezVousVerifie = async (
  rdvId: RdvId | null,
  activiteId: ActiviteId,
  mediateurId: string,
): Promise<Result<null, RendezVousIndisponible>> => {
  if (rdvId === null) return success(null)
  const [dUnAutre, dejaSaisi] = await Promise.all([
    rendezVousDUnAutreMediateur(rdvId, mediateurId),
    rendezVousDejaSaisi(rdvId, activiteId),
  ])
  return dUnAutre || dejaSaisi
    ? failure(RendezVousIndisponible())
    : success(null)
}

export const creationOuModification = (
  enregistrement: EnregistrementDeMediation,
  maintenant: Date,
) => ({
  creation:
    enregistrement._tag === 'Modification'
      ? enregistrement.creation
      : maintenant,
  identifiantV1:
    enregistrement._tag === 'Modification'
      ? enregistrement.identifiantV1
      : null,
})
