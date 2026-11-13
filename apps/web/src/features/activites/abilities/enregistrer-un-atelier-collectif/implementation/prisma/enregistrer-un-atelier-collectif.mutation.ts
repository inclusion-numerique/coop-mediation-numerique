import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import {
  type ActiviteIntrouvable,
  type AtelierSansParticipant,
  type BeneficiaireEnDouble,
  type BeneficiaireId,
  BeneficiaireIntrouvable,
  type DateTropLointaine,
  type EmployeuseDeLaDate,
  type LieuInutilisable,
  type LieuUtilisable,
  type MarquerLeRendezVousHonore,
  type MediateurId,
  origineDeLaSaisie,
  type RendezVousIndisponible,
  type TagInutilisable,
  type TagsUtilisables,
  TypeDActivite,
  type TypeDActiviteIncompatible,
  tagsDeLaSaisie,
  type UtilisateurId,
} from '../../../../domain'
import {
  creerLActiviteDeMediation,
  modifierLActiviteDeMediation,
} from '../../../../implementation/prisma/activite-de-mediation.ecriture'
import {
  creationOuModification,
  enregistrementDeMediation,
  lieuVerifie,
  rendezVousVerifie,
} from '../../../../implementation/prisma/saisie-de-mediation'
import {
  ActionNonAutorisee,
  type AtelierEnregistre,
  atelierDeLaSaisie,
  type SaisieCollective,
} from '../../domain'

export type EchecDEnregistrement =
  | ActionNonAutorisee
  | ActiviteIntrouvable
  | TypeDActiviteIncompatible
  | BeneficiaireIntrouvable
  | BeneficiaireEnDouble
  | AtelierSansParticipant
  | LieuInutilisable
  | TagInutilisable
  | RendezVousIndisponible
  | DateTropLointaine

const suivisVerifies = async (
  suivis: readonly BeneficiaireId[],
  mediateurId: MediateurId,
): Promise<Result<null, BeneficiaireIntrouvable>> => {
  if (suivis.length === 0) return success(null)
  const trouves = await prismaClient.beneficiaire.count({
    where: {
      id: { in: [...suivis] },
      mediateurId,
      anonyme: false,
      suppression: null,
      fusionVersId: null,
    },
  })
  return trouves === new Set(suivis).size
    ? success(null)
    : failure(BeneficiaireIntrouvable())
}

export const enregistrerUnAtelierCollectif = async ({
  saisie,
  mediateurId,
  auteurId,
  employeuseDeLaDate,
  lieuUtilisable,
  tagsUtilisables,
  marquerLeRendezVousHonore,
  maintenant = new Date(),
}: {
  readonly saisie: SaisieCollective
  readonly mediateurId: MediateurId | null
  readonly auteurId: UtilisateurId
  readonly employeuseDeLaDate: EmployeuseDeLaDate
  readonly lieuUtilisable: LieuUtilisable
  readonly tagsUtilisables: TagsUtilisables
  readonly marquerLeRendezVousHonore: MarquerLeRendezVousHonore
  readonly maintenant?: Date
}): Promise<Result<AtelierEnregistre, EchecDEnregistrement>> => {
  if (mediateurId === null) return failure(ActionNonAutorisee())

  const enregistrement = await enregistrementDeMediation({
    id: saisie.id,
    type: TypeDActivite('Collectif'),
    mediateurId,
  })
  if (!enregistrement.success) return enregistrement

  const suivis = await suivisVerifies(saisie.suivis, mediateurId)
  if (!suivis.success) return suivis

  const lieu = await lieuVerifie(
    saisie.lieu,
    enregistrement.data,
    lieuUtilisable,
  )
  if (!lieu.success) return lieu

  const tags = tagsDeLaSaisie(saisie.tags, await tagsUtilisables(saisie.tags))
  if (!tags.success) return tags

  const rendezVous = await rendezVousVerifie(
    saisie.rdvId,
    enregistrement.data.id,
  )
  if (!rendezVous.success) return rendezVous

  const { creation, identifiantV1 } = creationOuModification(
    enregistrement.data,
    maintenant,
  )
  const atelier = atelierDeLaSaisie({
    saisie,
    id: enregistrement.data.id,
    mediateurId,
    employeuse: await employeuseDeLaDate(saisie.date),
    origine: origineDeLaSaisie({ rdvId: saisie.rdvId, identifiantV1 }),
    creation,
    maintenant,
  })
  if (!atelier.success) return atelier

  await (enregistrement.data._tag === 'Creation'
    ? creerLActiviteDeMediation(atelier.data)
    : modifierLActiviteDeMediation(
        atelier.data,
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
    data: { type: 'Collectif', id: atelier.data.id },
  })

  return success({ id: atelier.data.id, type: 'Collectif' })
}
