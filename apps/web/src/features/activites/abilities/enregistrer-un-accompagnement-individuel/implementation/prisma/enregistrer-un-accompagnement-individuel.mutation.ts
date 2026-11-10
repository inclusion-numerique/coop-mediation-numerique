import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import { v4 } from 'uuid'
import {
  type ActiviteDeMediationPrecedente,
  creerLActiviteDeMediation,
  lireLActiviteDeMediationPrecedente,
  modifierLActiviteDeMediation,
} from '../../../../db/activite-de-mediation.ecriture'
import {
  ActiviteId,
  ActiviteIntrouvable,
  BeneficiaireId,
  BeneficiaireIntrouvable,
  type DateTropLointaine,
  type EmployeuseDeLaDate,
  IdentifiantCraV1,
  LieuActiviteId,
  LieuInutilisable,
  type LieuUtilisable,
  type MarquerLeRendezVousHonore,
  type MediateurId,
  origineDeLaSaisie,
  type RdvId,
  RendezVousIndisponible,
  type TagInutilisable,
  type TagsUtilisables,
  TypeDActiviteIncompatible,
  tagsDeLaSaisie,
  type UtilisateurId,
} from '../../../../domain'
import {
  type AccompagnementEnregistre,
  ActionNonAutorisee,
  accompagnementDeLaSaisie,
  type BeneficiaireSaisi,
  beneficiaireAccompagneDe,
  type SaisieIndividuelle,
} from '../../domain'

export type EchecDEnregistrement =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | BeneficiaireIntrouvable
  | LieuInutilisable
  | TagInutilisable
  | RendezVousIndisponible
  | DateTropLointaine

type Enregistrement =
  | { readonly _tag: 'Creation'; readonly id: ActiviteId }
  | {
      readonly _tag: 'Modification'
      readonly id: ActiviteId
      readonly creation: Date
      readonly identifiantV1: IdentifiantCraV1 | null
      readonly precedente: ActiviteDeMediationPrecedente
    }

const enregistrementDe = async (
  saisie: SaisieIndividuelle,
  mediateurId: MediateurId,
): Promise<
  Result<Enregistrement, ActiviteIntrouvable | TypeDActiviteIncompatible>
> => {
  if (saisie.id === null) {
    return success({ _tag: 'Creation', id: ActiviteId(v4()) })
  }
  const existante = await lireLActiviteDeMediationPrecedente({
    id: saisie.id,
    mediateurId,
  })
  if (existante === null) return failure(ActiviteIntrouvable())
  if (existante.type !== 'Individuel') {
    return failure(TypeDActiviteIncompatible())
  }
  return success({
    _tag: 'Modification',
    id: saisie.id,
    creation: existante.creation,
    identifiantV1:
      existante.identifiantV1 === null
        ? null
        : IdentifiantCraV1(existante.identifiantV1),
    precedente: existante.precedente,
  })
}

const suiviDe = async (
  beneficiaire: BeneficiaireSaisi,
  mediateurId: MediateurId,
): Promise<Result<BeneficiaireId | null, BeneficiaireIntrouvable>> => {
  if (beneficiaire.id === null) return success(null)
  const trouve = await prismaClient.beneficiaire.findFirst({
    where: {
      id: beneficiaire.id,
      mediateurId,
      suppression: null,
      fusionVersId: null,
    },
    select: { anonyme: true },
  })
  if (trouve === null) return failure(BeneficiaireIntrouvable())
  return success(trouve.anonyme ? null : BeneficiaireId(beneficiaire.id))
}

const lieuVerifie = async (
  saisie: SaisieIndividuelle,
  enregistrement: Enregistrement,
  lieuUtilisable: LieuUtilisable,
): Promise<Result<null, LieuInutilisable>> => {
  if (saisie.lieu._tag !== 'LieuActivite') return success(null)
  const actuel =
    enregistrement._tag === 'Modification' &&
    enregistrement.precedente.lieuActiviteId !== null
      ? LieuActiviteId(enregistrement.precedente.lieuActiviteId)
      : null
  return (await lieuUtilisable(saisie.lieu.lieuActiviteId, actuel))
    ? success(null)
    : failure(LieuInutilisable())
}

const rendezVousVerifie = async (
  rdvId: RdvId | null,
  activiteId: ActiviteId,
): Promise<Result<null, RendezVousIndisponible>> => {
  if (rdvId === null) return success(null)
  const deja = await prismaClient.activite.findFirst({
    where: { rdvId, suppression: null, id: { not: activiteId } },
    select: { id: true },
  })
  return deja === null ? success(null) : failure(RendezVousIndisponible())
}

export const enregistrerUnAccompagnementIndividuel = async ({
  saisie,
  mediateurId,
  auteurId,
  employeuseDeLaDate,
  lieuUtilisable,
  tagsUtilisables,
  marquerLeRendezVousHonore,
  maintenant = new Date(),
}: {
  readonly saisie: SaisieIndividuelle
  readonly mediateurId: MediateurId | null
  readonly auteurId: UtilisateurId
  readonly employeuseDeLaDate: EmployeuseDeLaDate
  readonly lieuUtilisable: LieuUtilisable
  readonly tagsUtilisables: TagsUtilisables
  readonly marquerLeRendezVousHonore: MarquerLeRendezVousHonore
  readonly maintenant?: Date
}): Promise<Result<AccompagnementEnregistre, EchecDEnregistrement>> => {
  if (mediateurId === null) return failure(ActionNonAutorisee())

  const enregistrement = await enregistrementDe(saisie, mediateurId)
  if (!enregistrement.success) return enregistrement

  const suivi = await suiviDe(saisie.beneficiaire, mediateurId)
  if (!suivi.success) return suivi

  const lieu = await lieuVerifie(saisie, enregistrement.data, lieuUtilisable)
  if (!lieu.success) return lieu

  const tags = tagsDeLaSaisie(saisie.tags, await tagsUtilisables(saisie.tags))
  if (!tags.success) return tags

  const rendezVous = await rendezVousVerifie(
    saisie.rdvId,
    enregistrement.data.id,
  )
  if (!rendezVous.success) return rendezVous

  const accompagnement = accompagnementDeLaSaisie({
    saisie,
    id: enregistrement.data.id,
    mediateurId,
    beneficiaire: beneficiaireAccompagneDe(saisie.beneficiaire, suivi.data),
    employeuse: await employeuseDeLaDate(saisie.date),
    origine: origineDeLaSaisie({
      rdvId: saisie.rdvId,
      identifiantV1:
        enregistrement.data._tag === 'Modification'
          ? enregistrement.data.identifiantV1
          : null,
    }),
    creation:
      enregistrement.data._tag === 'Modification'
        ? enregistrement.data.creation
        : maintenant,
    maintenant,
  })
  if (!accompagnement.success) return accompagnement

  await (enregistrement.data._tag === 'Creation'
    ? creerLActiviteDeMediation(accompagnement.data)
    : modifierLActiviteDeMediation(
        accompagnement.data,
        enregistrement.data.precedente,
      ))

  if (saisie.rdvId !== null) {
    await marquerLeRendezVousHonore(saisie.rdvId)
  }

  addMutationLog({
    userId: auteurId,
    nom:
      enregistrement.data._tag === 'Creation'
        ? 'CreerActivite'
        : 'ModifierActivite',
    duration: 0,
    data: { type: 'Individuel', id: accompagnement.data.id },
  })

  return success({ id: accompagnement.data.id, type: 'Individuel' })
}
