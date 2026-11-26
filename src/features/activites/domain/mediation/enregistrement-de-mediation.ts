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
  ActiviteDeMediationExistante,
  ActiviteDeMediationPrecedente,
  SaisieDeMediationPorts,
} from '../ports'
import type { ActiviteDeMediation } from './activite-de-mediation'
import type { LieuSaisi } from './saisie-de-mediation'
import type { TypeDActivite } from './type-d-activite'

export type EnregistrementDeMediation =
  | { readonly _tag: 'Creation'; readonly id: ActiviteId }
  | ({
      readonly _tag: 'Modification'
      readonly id: ActiviteId
    } & Omit<ActiviteDeMediationExistante, 'type'>)

export type EcritureDeMediation<Activite extends ActiviteDeMediation> =
  | { readonly _tag: 'Creation'; readonly activite: Activite }
  | {
      readonly _tag: 'Modification'
      readonly activite: Activite
      readonly precedente: ActiviteDeMediationPrecedente
    }

export const enregistrementDeMediation =
  ({
    activiteDuMediateur,
    nouvelIdentifiant,
  }: Pick<
    SaisieDeMediationPorts,
    'activiteDuMediateur' | 'nouvelIdentifiant'
  >) =>
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

export const lieuVerifie =
  ({ lieuUtilisable }: Pick<SaisieDeMediationPorts, 'lieuUtilisable'>) =>
  async ({
    lieu,
    enregistrement,
  }: {
    readonly lieu: LieuSaisi
    readonly enregistrement: EnregistrementDeMediation
  }): Promise<Result<null, LieuInutilisable>> => {
    if (lieu._tag !== 'LieuActivite') return success(null)
    return (await lieuUtilisable(
      lieu.lieuActiviteId,
      lieuActuel(enregistrement),
    ))
      ? success(null)
      : failure(LieuInutilisable())
  }

export const rendezVousVerifie =
  ({
    rendezVousDUnAutreMediateur,
    rendezVousDejaSaisi,
  }: Pick<
    SaisieDeMediationPorts,
    'rendezVousDUnAutreMediateur' | 'rendezVousDejaSaisi'
  >) =>
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

export const ecritureDe = <Activite extends ActiviteDeMediation>(
  activite: Activite,
  enregistrement: EnregistrementDeMediation,
): EcritureDeMediation<Activite> =>
  enregistrement._tag === 'Creation'
    ? { _tag: 'Creation', activite }
    : { _tag: 'Modification', activite, precedente: enregistrement.precedente }

export const ecrireLActiviteDeMediation =
  ({ creer, modifier }: Pick<SaisieDeMediationPorts, 'creer' | 'modifier'>) =>
  (ecriture: EcritureDeMediation<ActiviteDeMediation>): Promise<void> =>
    ecriture._tag === 'Creation'
      ? creer(ecriture.activite)
      : modifier(ecriture.activite, ecriture.precedente)

export const rendezVousHonore =
  ({
    marquerLeRendezVousHonore,
  }: Pick<SaisieDeMediationPorts, 'marquerLeRendezVousHonore'>) =>
  async (rdvId: RdvId | null): Promise<RdvId | null> => {
    if (rdvId === null) return null
    await marquerLeRendezVousHonore(rdvId)
    return rdvId
  }
