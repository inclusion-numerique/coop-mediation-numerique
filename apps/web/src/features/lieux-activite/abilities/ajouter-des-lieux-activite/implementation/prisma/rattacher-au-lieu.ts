import type { Prisma } from '@prisma/client'
import { v4 } from 'uuid'
import { lieuCorrele, preparerCorrele } from '../../../../db/lieu-correle'
import type { CartoStructure, LieuDemande } from '../../domain'
import { lieuDepuisCarto } from './lieu-depuis-carto'

/**
 * Matérialise un nouveau lieu depuis son nom et son adresse géocodée — mêmes
 * colonnes que le mapper canonique des informations générales d'un lieu. Le
 * reste des informations sera renseigné plus tard dans la gestion des lieux.
 */
const lieuDepuisAdresse = (lieu: LieuDemande) => ({
  id: v4(),
  nom: lieu.nom,
  siret: lieu.siret ?? null,
  // Volontairement PAS de `synchronisationSiret`. Ce SIRET vient de l'annuaire
  // des entreprises, mais il a transité par le navigateur : le serveur ne peut
  // pas distinguer celui que l'annuaire a rendu de celui qu'on lui souffle.
  // L'horodater le dirait vérifié — et `normalize-sirets`, qui saute les SIRET
  // récemment synchronisés, s'abstiendrait justement de le vérifier. On le
  // stocke donc non vérifié ; le job lui donnera sa valeur de preuve.
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
  donnees: Parameters<typeof lieuCorrele>[1] &
    Prisma.LieuInclusionCreateManyInput,
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
 *   l'Entrepôt ne doit pas faire échouer l'ajout entier.
 *
 * Les deux dernières branches passent par `materialiser`, qui ne crée qu'à
 * défaut de lieu corrélé.
 */
const lieuARattacher = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuDemande,
  structuresCartoParId: ReadonlyMap<string, CartoStructure>,
): Promise<{ readonly id: string }> => {
  // L'id vient de l'écran, donc du client : le prendre au mot rattacherait le
  // médiateur à n'importe quel lieu par son uuid, y compris un lieu supprimé —
  // exactement ce que la branche carto ci-dessous refuse. Un id qui ne désigne
  // plus un lieu vivant retombe sur la matérialisation ordinaire, où la sonde
  // décide seule s'il y a lieu de relever le lieu retiré.
  const designe =
    lieu.id === null || lieu.id === undefined
      ? null
      : await transaction.lieuInclusion.findFirst({
          where: { id: lieu.id, suppression: null },
          select: { id: true },
        })

  if (designe) return designe

  if (!lieu.structureCartographieNationaleId)
    return materialiser(transaction, lieuDepuisAdresse(lieu))

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
    cartoStructure ? lieuDepuisCarto(cartoStructure) : lieuDepuisAdresse(lieu),
  )
}

/**
 * Rattache le médiateur au lieu demandé, dans la transaction de l'appelant.
 *
 * Cette fonction figure dans l'API publique de la feature parce que l'inscription
 * doit la composer dans SA transaction, qui clôt par ailleurs des activités et
 * projette l'état franchi. Un port de commande l'en sortirait, et deux écritures
 * concurrentes créeraient le doublon que la sonde existe pour éviter.
 *
 * Le rattachement est idempotent : deux lieux demandés peuvent se corréler au
 * même lieu de la coop (l'un trouvé dans la coop, l'autre dans la carto ou
 * l'annuaire), et le médiateur n'exerce pas deux fois dans le même lieu. Rend
 * l'id du lieu rejoint — celui de la corrélation, pas celui qui a été demandé.
 */
export const rattacherAuLieu = async (
  transaction: Prisma.TransactionClient,
  {
    userId,
    lieu,
    structuresCartoParId,
    maintenant,
  }: {
    readonly userId: string
    readonly lieu: LieuDemande
    readonly structuresCartoParId: ReadonlyMap<string, CartoStructure>
    readonly maintenant: Date
  },
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

  if (dejaRattache) return { lieuId: structureId }

  await transaction.mediateurEnActivite.create({
    data: {
      id: v4(),
      mediateur: { connect: { userId } },
      lieuInclusion: { connect: { id: structureId } },
      debut: maintenant,
      creationPar: { connect: { id: userId } },
    },
  })

  return { lieuId: structureId }
}
