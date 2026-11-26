import { failure, type Result, success } from '@/libraries/result'
import {
  ActiviteIntrouvable,
  LieuInutilisable,
  RendezVousIndisponible,
  TypeDActiviteIncompatible,
} from '../errors'
import type { ActiviteId } from '../identifiants/activite-id'
import type { IdentifiantCraV1 } from '../identifiants/identifiant-cra-v1'
import type { LieuActiviteId } from '../identifiants/lieu-activite-id'
import type { MediateurId } from '../identifiants/mediateur-id'
import type { RdvId } from '../identifiants/rdv-id'
import type {
  ActiviteDeMediationDuMediateur,
  ActiviteDeMediationExistante,
  CreerLActiviteDeMediation,
  EmployeuseDeLaDate,
  LieuUtilisable,
  MarquerLeRendezVousHonore,
  ModifierLActiviteDeMediation,
  RendezVousDejaSaisi,
  RendezVousDUnAutreMediateur,
  TagsUtilisables,
} from '../ports'
import type { ActiviteDeMediation } from './activite-de-mediation'
import type { LieuSaisi } from './saisie-de-mediation'
import type { TypeDActivite } from './type-d-activite'

export type DependancesDeLaSaisieDeMediation = {
  readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
  readonly nouvelIdentifiant: () => ActiviteId
  readonly lieuUtilisable: LieuUtilisable
  readonly tagsUtilisables: TagsUtilisables
  readonly rendezVousDUnAutreMediateur: RendezVousDUnAutreMediateur
  readonly rendezVousDejaSaisi: RendezVousDejaSaisi
  readonly employeuseDeLaDate: EmployeuseDeLaDate
  readonly creer: CreerLActiviteDeMediation
  readonly modifier: ModifierLActiviteDeMediation
  readonly marquerLeRendezVousHonore: MarquerLeRendezVousHonore
  readonly maintenant: () => Date
}

export type EnregistrementDeMediation =
  | { readonly _tag: 'Creation'; readonly id: ActiviteId }
  | ({
      readonly _tag: 'Modification'
      readonly id: ActiviteId
    } & Omit<ActiviteDeMediationExistante, 'type'>)

export const enregistrementDeMediation =
  ({
    activiteDuMediateur,
    nouvelIdentifiant,
  }: {
    readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
    readonly nouvelIdentifiant: () => ActiviteId
  }) =>
  async ({
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
      return success({ _tag: 'Creation', id: nouvelIdentifiant() })
    }
    const existante = await activiteDuMediateur({ id, mediateurId })
    if (existante === null) return failure(ActiviteIntrouvable())
    if (existante.type !== type) return failure(TypeDActiviteIncompatible())
    return success({
      _tag: 'Modification',
      id,
      creation: existante.creation,
      identifiantV1: existante.identifiantV1,
      precedente: existante.precedente,
    })
  }

const lieuActuel = (
  enregistrement: EnregistrementDeMediation,
): LieuActiviteId | null =>
  enregistrement._tag === 'Modification'
    ? enregistrement.precedente.lieuActiviteId
    : null

export const lieuVerifie = async (
  lieu: LieuSaisi,
  enregistrement: EnregistrementDeMediation,
  lieuUtilisable: LieuUtilisable,
): Promise<Result<null, LieuInutilisable>> => {
  if (lieu._tag !== 'LieuActivite') return success(null)
  return (await lieuUtilisable(lieu.lieuActiviteId, lieuActuel(enregistrement)))
    ? success(null)
    : failure(LieuInutilisable())
}

export const rendezVousVerifie =
  ({
    rendezVousDUnAutreMediateur,
    rendezVousDejaSaisi,
  }: {
    readonly rendezVousDUnAutreMediateur: RendezVousDUnAutreMediateur
    readonly rendezVousDejaSaisi: RendezVousDejaSaisi
  }) =>
  async ({
    rdvId,
    activiteId,
    mediateurId,
  }: {
    readonly rdvId: RdvId | null
    readonly activiteId: ActiviteId
    readonly mediateurId: MediateurId
  }): Promise<Result<null, RendezVousIndisponible>> => {
    if (rdvId === null) return success(null)
    const [dUnAutre, dejaSaisi] = await Promise.all([
      rendezVousDUnAutreMediateur({ rdvId, mediateurId }),
      rendezVousDejaSaisi({ rdvId, activiteId }),
    ])
    return dUnAutre || dejaSaisi
      ? failure(RendezVousIndisponible())
      : success(null)
  }

export const creationOuModification = (
  enregistrement: EnregistrementDeMediation,
  maintenant: Date,
): {
  readonly creation: Date
  readonly identifiantV1: IdentifiantCraV1 | null
} =>
  enregistrement._tag === 'Modification'
    ? {
        creation: enregistrement.creation,
        identifiantV1: enregistrement.identifiantV1,
      }
    : { creation: maintenant, identifiantV1: null }

export const ecrireLActiviteDeMediation =
  ({
    creer,
    modifier,
  }: {
    readonly creer: CreerLActiviteDeMediation
    readonly modifier: ModifierLActiviteDeMediation
  }) =>
  (
    activite: ActiviteDeMediation,
    enregistrement: EnregistrementDeMediation,
  ): Promise<void> =>
    enregistrement._tag === 'Creation'
      ? creer(activite)
      : modifier(activite, enregistrement.precedente)
