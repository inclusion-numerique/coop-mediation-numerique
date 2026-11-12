import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import {
  ActiviteIntrouvable,
  BeneficiaireId,
  BeneficiaireIntrouvable,
  type DateTropLointaine,
  type EmployeuseDeLaDate,
  LieuInutilisable,
  type LieuUtilisable,
  type MarquerLeRendezVousHonore,
  type MediateurId,
  origineDeLaSaisie,
  RendezVousIndisponible,
  type TagInutilisable,
  type TagsUtilisables,
  TypeDActivite,
  TypeDActiviteIncompatible,
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

  const enregistrement = await enregistrementDeMediation({
    id: saisie.id,
    type: TypeDActivite('Individuel'),
    mediateurId,
  })
  if (!enregistrement.success) return enregistrement

  const suivi = await suiviDe(saisie.beneficiaire, mediateurId)
  if (!suivi.success) return suivi

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

  const accompagnement = accompagnementDeLaSaisie({
    saisie,
    id: enregistrement.data.id,
    mediateurId,
    beneficiaire: beneficiaireAccompagneDe(saisie.beneficiaire, suivi.data),
    employeuse: await employeuseDeLaDate(saisie.date),
    origine: origineDeLaSaisie({
      rdvId: saisie.rdvId,
      identifiantV1: creationOuModification(enregistrement.data, maintenant)
        .identifiantV1,
    }),
    creation: creationOuModification(enregistrement.data, maintenant).creation,
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
