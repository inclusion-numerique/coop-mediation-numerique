import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import type { Lieu } from '../../../../domain/lieu'
import { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import {
  ecrireAuRegistre,
  lieuCorrele,
  lieuFromDomain,
  preparerCorrele,
  toutesLesColonnes,
} from '../../../../implementation'
import { type EchecDeCreation, MediateurRequis } from '../../domain/errors'

/**
 * Rattache le médiateur au lieu, sauf s'il y exerce déjà.
 *
 * L'idempotence n'est pas une précaution de style : la sonde peut rendre un lieu
 * où le médiateur exerce déjà — c'est même le cas le plus probable quand
 * quelqu'un ressaisit un lieu qu'il n'avait pas retrouvé à la recherche.
 */
const rattacher = async (
  transaction: Prisma.TransactionClient,
  {
    mediateurId,
    structureId,
    debut,
    creationParId,
  }: {
    readonly mediateurId: MediateurId
    readonly structureId: string
    readonly debut: Date
    readonly creationParId: string | null
  },
) => {
  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: { mediateurId, structureId, suppression: null, fin: null },
    select: { id: true },
  })

  if (dejaRattache) return

  await transaction.mediateurEnActivite.create({
    data: { id: v4(), mediateurId, structureId, debut, creationParId },
  })
}

/**
 * Poser la fiche des deux côtés : dans la coop, et au registre des lieux de
 * l'Entrepôt, dans la même transaction.
 *
 * Rien de tel sur le chemin de la corrélation : on n'y crée pas de fiche, on
 * rejoint celle que la coop connaissait déjà, et le registre n'a donc rien de
 * nouveau à apprendre — c'est le rattachement qui change, pas le lieu.
 */
const creerLaFiche = async (
  transaction: Prisma.TransactionClient,
  lieu: Lieu,
  donnees: ReturnType<typeof lieuFromDomain>,
): Promise<{ readonly id: string }> => {
  const cree = await transaction.lieuInclusion.create({
    data: donnees,
    select: { id: true },
  })

  await ecrireAuRegistre(transaction, {
    lieu,
    colonnes: toutesLesColonnes,
    maintenant: lieu.tracabilite.creation.date,
  })

  return cree
}

/**
 * Créer un lieu, c'est aussi s'y rattacher : on ne crée pas une fiche pour
 * personne. Les deux écritures vont ensemble, dans une transaction.
 *
 * La saisie est déjà devenue un lieu du domaine avant d'arriver ici : le type du
 * formulaire ne descend pas jusqu'à l'écriture.
 *
 * On ne crée qu'à défaut de lieu corrélé. On n'arrive sur ce formulaire qu'après
 * une recherche restée sans résultat, mais cette garde est un choix de l'écran :
 * rien n'empêche d'y venir directement, ni d'y ressaisir un lieu que la
 * recherche n'avait pas su rendre — une dénomination différente suffit. La sonde
 * est donc le dernier rempart, le même que pour les lieux rattachés depuis la
 * recherche.
 *
 * Rend l'identifiant du lieu REJOINT, qui n'est pas toujours celui du lieu
 * construit : sur corrélation, c'est celui du lieu que la coop connaissait déjà.
 */
export const creerLieuActivite = async ({
  lieu,
  mediateurId,
}: {
  lieu: Lieu
  mediateurId: MediateurId | null
}): Promise<Result<{ readonly id: LieuId }, EchecDeCreation>> => {
  if (mediateurId == null) return failure(MediateurRequis)

  const donnees = lieuFromDomain(lieu)

  const structureId = await prismaClient.$transaction(async (transaction) => {
    const correle = await lieuCorrele(transaction, donnees)
    const prepare = correle && (await preparerCorrele(transaction, correle))

    const { id } = prepare ?? (await creerLaFiche(transaction, lieu, donnees))

    await rattacher(transaction, {
      mediateurId,
      structureId: id,
      // Le rattachement naît avec le lieu, de la main de la même personne.
      debut: lieu.tracabilite.creation.date,
      creationParId: lieu.tracabilite.creation.par,
    })

    return id
  })

  return success({ id: LieuId(structureId) })
}
