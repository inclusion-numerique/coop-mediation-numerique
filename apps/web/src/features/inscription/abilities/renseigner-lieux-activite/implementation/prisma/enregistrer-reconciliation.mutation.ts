import { inscriptionEtatFromDomain } from '@app/web/features/inscription/db'
import type { UserId } from '@app/web/features/inscription/domain'
import {
  type LieuAMaterialiser,
  lieuCorrele,
  preparerCorrele,
} from '@app/web/features/inscription/implementation/prisma/lieu-correle'
import type { CartoStructure } from '@app/web/features/lieux-activite/use-cases/ajouter/domain'
import { prismaClient } from '@app/web/prismaClient'
import { toStructureFromCartoStructure } from '@app/web/structure/toStructureFromCartoStructure'
import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import type { EnregistrerReconciliation, LieuActiviteInput } from '../../domain'

/**
 * Matérialise un nouveau lieu (SIRET ou saisie manuelle) depuis son nom et son
 * adresse géocodée — mêmes colonnes que le mapper canonique des informations
 * générales d'un lieu (`nom` + adresse BAN + coordonnées). Le reste des
 * informations sera renseigné plus tard dans la gestion des lieux d'activité.
 */
const lieuInclusionDepuisAdresse = (lieu: LieuActiviteInput) => ({
  id: v4(),
  nom: lieu.nom,
  siret: lieu.siret ?? null,
  // Volontairement PAS de `synchronisationSiret`. Ce SIRET vient de l'annuaire
  // des entreprises, mais il a transité par le navigateur : le serveur ne peut
  // pas distinguer celui que l'annuaire a rendu de celui qu'on lui souffle.
  // L'horodater le dirait vérifié — et `normalize-sirets`, qui saute les SIRET
  // récemment synchronisés, s'abstiendrait justement de le vérifier. On le
  // stocke donc non vérifié ; le job lui donnera sa valeur de preuve. Seules les
  // provenances lues côté serveur sont horodatées (cf. `employeuseMainToLieuData`).
  adresse: lieu.adresse,
  commune: lieu.commune,
  codePostal: lieu.codePostal,
  codeInsee: lieu.codeInsee,
  banId: lieu.banId ?? null,
  latitude: lieu.latitude,
  longitude: lieu.longitude,
})

/**
 * Matérialise le lieu — sauf s'il existe déjà. Aucun des chemins de création ne
 * dispose de l'id du lieu coop correspondant : on passe donc toujours par la
 * sonde de corrélation avant de créer, pour ne pas ajouter un doublon de plus.
 */
const materialiser = async (
  transaction: Prisma.TransactionClient,
  donnees: LieuAMaterialiser & Prisma.LieuInclusionCreateManyInput,
): Promise<{ readonly id: string }> => {
  const correle = await lieuCorrele(transaction, donnees)
  const prepare = correle && (await preparerCorrele(transaction, correle))

  if (prepare) return prepare

  return transaction.lieuInclusion.create({
    data: donnees,
    select: { id: true },
  })
}

/**
 * Résout le lieu auquel rattacher l'activité. L'ordre des branches porte le
 * modèle d'identité : l'id interne est la SEULE identité certaine d'un lieu de
 * la coop. L'id de cartographie nationale, lui, est une annotation tardive —
 * un lieu ajouté dans la coop n'en a pas ; c'est le job nightly de la carto qui,
 * après avoir agrégé les sources, normalisé et dédupliqué, le pose sur le lieu
 * publié puis le resynchronise dans la coop. Son absence ne dit donc rien de
 * l'existence du lieu, et sa présence ne prime jamais sur l'id interne (colonne
 * seulement indexée, non unique : y résoudre un lieu déjà identifié risquerait
 * de rattacher l'activité à un doublon).
 *
 * - id interne : le lieu existant ;
 * - sans id ni carto : un nouveau lieu, depuis nom + adresse géocodée ;
 * - carto déjà matérialisée localement : le lieu qui la porte ;
 * - carto non matérialisée : le lieu créé depuis la structure carto, et à défaut
 *   (carto désynchronisée) depuis l'adresse soumise — un lieu introuvable dans
 *   l'Entrepôt ne doit pas avorter l'inscription entière.
 *
 * Les deux dernières branches passent par `materialiser`, qui ne crée qu'à
 * défaut de lieu corrélé.
 */
const lieuARattacher = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuActiviteInput,
  structuresCartoParId: ReadonlyMap<string, CartoStructure>,
): Promise<{ readonly id: string }> => {
  if (lieu.id) return { id: lieu.id }

  if (!lieu.structureCartographieNationaleId)
    return materialiser(transaction, lieuInclusionDepuisAdresse(lieu))

  const porteurDeLaCarto = await transaction.lieuInclusion.findFirst({
    where: {
      structureCartographieNationaleId: lieu.structureCartographieNationaleId,
      // Un lieu supprimé n'est pas un rattachement possible : on laisse la
      // sonde décider s'il doit être relevé, et à quelles conditions. Sans ce
      // filtre, cette branche rattacherait le médiateur à un lieu retiré, en
      // court-circuitant les règles de modération.
      suppression: null,
    },
    // La colonne n'est qu'indexée, pas unique : à défaut d'unicité, on rattache
    // au plus ancien plutôt qu'à une ligne arbitraire.
    orderBy: { creation: 'asc' },
    select: { id: true },
  })

  if (porteurDeLaCarto) return porteurDeLaCarto

  const cartoStructure = structuresCartoParId.get(
    lieu.structureCartographieNationaleId,
  )

  return materialiser(
    transaction,
    cartoStructure
      ? toStructureFromCartoStructure(cartoStructure)
      : lieuInclusionDepuisAdresse(lieu),
  )
}

/**
 * Rattache le médiateur au lieu désiré. Le rattachement est idempotent : deux
 * lieux désirés peuvent se corréler au même lieu de la coop (l'un trouvé dans la
 * coop, l'autre dans la carto ou l'annuaire), et le médiateur n'exerce pas deux
 * fois dans le même lieu.
 */
const creerActivite = async (
  transaction: Prisma.TransactionClient,
  userId: UserId,
  lieu: LieuActiviteInput,
  structuresCartoParId: ReadonlyMap<string, CartoStructure>,
) => {
  const { id: structureId } = await lieuARattacher(
    transaction,
    lieu,
    structuresCartoParId,
  )

  const dejaRattache = await transaction.mediateurEnActivite.findFirst({
    where: {
      mediateur: { userId },
      structureId,
      suppression: null,
      fin: null,
    },
    select: { id: true },
  })

  if (dejaRattache) return dejaRattache

  return transaction.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId } },
      lieuInclusion: { connect: { id: structureId } },
      debut: new Date(),
    },
  })
}

/**
 * Applique la réconciliation en une transaction : clôt les activités retirées,
 * crée les nouvelles, puis projette l'état franchi (colonnes d'inscription issues
 * du transfer, jamais composées à la main). Les structures carto ont été résolues
 * hors transaction (Entrepôt, client Prisma distinct).
 */
export const enregistrerReconciliation: EnregistrerReconciliation = async ({
  etatFranchi,
  userId,
  aCloturer,
  aCreer,
  structuresCarto,
}) => {
  const structuresCartoParId = new Map(
    structuresCarto.map((structure) => [structure.id, structure]),
  )
  const now = new Date()

  await prismaClient.$transaction(async (transaction) => {
    await transaction.mediateurEnActivite.updateMany({
      where: { id: { in: [...aCloturer] } },
      data: { fin: now, suppression: now, suppressionParId: userId },
    })

    // Séquentiel, et non `Promise.all` : deux lieux désirés peuvent se corréler
    // au même lieu de la coop, et des sondes menées de front ne verraient pas
    // les créations l'une de l'autre — le doublon que l'on cherche à éviter.
    await aCreer.reduce(async (precedentes, lieu) => {
      await precedentes
      await creerActivite(transaction, userId, lieu, structuresCartoParId)
    }, Promise.resolve())

    await transaction.user.update({
      where: { id: userId },
      data: inscriptionEtatFromDomain(etatFranchi),
    })
  })
}
