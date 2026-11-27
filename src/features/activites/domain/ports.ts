import type { Commune } from './commune'
import type { TagDeLActivite } from './coordination/activite-de-coordination'
import type { DateDActivite } from './date-d-activite'
import type { ActiviteId } from './identifiants/activite-id'
import type { BeneficiaireId } from './identifiants/beneficiaire-id'
import type { EmployeuseId } from './identifiants/employeuse-id'
import type { IdentifiantCraV1 } from './identifiants/identifiant-cra-v1'
import type { LieuActiviteId } from './identifiants/lieu-activite-id'
import type { MediateurId } from './identifiants/mediateur-id'
import type { RdvId } from './identifiants/rdv-id'
import type { TagId } from './identifiants/tag-id'
import type { ActiviteDeMediation } from './mediation/activite-de-mediation'
import type { TypeDActivite } from './mediation/type-d-activite'

export type ActiviteDeMediationPrecedente = {
  readonly lieuActiviteId: LieuActiviteId | null
  readonly suivis: readonly BeneficiaireId[]
  readonly anonymesOrphelins: readonly BeneficiaireId[]
}

export type ActiviteDeMediationExistante = {
  readonly type: TypeDActivite
  readonly creation: Date
  readonly identifiantV1: IdentifiantCraV1 | null
  readonly precedente: ActiviteDeMediationPrecedente
}

export type ActiviteDeMediationDuMediateur = (criteres: {
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
}) => Promise<ActiviteDeMediationExistante | null>

type NouvelIdentifiantDActivite = () => ActiviteId

export type RendezVousDUnAutreMediateur = (criteres: {
  readonly rdvId: RdvId
  readonly mediateurId: MediateurId
}) => Promise<boolean>

export type RendezVousDejaSaisi = (criteres: {
  readonly rdvId: RdvId
  readonly activiteId: ActiviteId
}) => Promise<boolean>

export type CreerLActiviteDeMediation = (
  activite: ActiviteDeMediation,
) => Promise<void>

export type ModifierLActiviteDeMediation = (
  activite: ActiviteDeMediation,
  precedente: ActiviteDeMediationPrecedente,
) => Promise<void>

export type EmployeuseALaDate = {
  readonly id: EmployeuseId
  readonly commune: Commune | null
}

export type EmployeuseDeLaDate = (
  date: DateDActivite,
) => Promise<EmployeuseALaDate | null>

type LieuUtilisable = (
  lieu: LieuActiviteId,
  lieuActuel: LieuActiviteId | null,
) => Promise<boolean>

type MarquerLeRendezVousHonore = (rdvId: RdvId) => Promise<void>

export type TagsUtilisables = (
  tagIds: readonly TagId[],
) => Promise<readonly TagDeLActivite[]>

export type EnregistrementDeMediationPorts = {
  readonly activiteDuMediateur: ActiviteDeMediationDuMediateur
  readonly nouvelIdentifiant: NouvelIdentifiantDActivite
}

export type LieuVerifiePorts = {
  readonly lieuUtilisable: LieuUtilisable
}

export type RendezVousVerifiePorts = {
  readonly rendezVousDUnAutreMediateur: RendezVousDUnAutreMediateur
  readonly rendezVousDejaSaisi: RendezVousDejaSaisi
}

export type EcritureDeMediationPorts = {
  readonly creer: CreerLActiviteDeMediation
  readonly modifier: ModifierLActiviteDeMediation
}

export type RendezVousHonorePorts = {
  readonly marquerLeRendezVousHonore: MarquerLeRendezVousHonore
}

export type SaisieDeMediationPorts = EnregistrementDeMediationPorts &
  LieuVerifiePorts &
  RendezVousVerifiePorts &
  EcritureDeMediationPorts &
  RendezVousHonorePorts & {
    readonly tagsUtilisables: TagsUtilisables
    readonly employeuseDeLaDate: EmployeuseDeLaDate
  }
