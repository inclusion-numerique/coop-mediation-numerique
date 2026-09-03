import {
  type Correle,
  correler,
  type LieuAMaterialiser,
} from '@app/web/libraries/lieu-identite'
import type { Prisma } from '@prisma/client'

export type { Correle, LieuAMaterialiser }

/**
 * Sonde de corrélation des lieux d'inclusion : avant d'en créer un, chercher
 * celui que la coop connaît peut-être déjà sous une autre dénomination.
 *
 * Elle n'a pas la charge de RECONNAÎTRE un lieu — c'est `libraries/lieu-identite`,
 * qui s'en remet au standard partagé. Il lui reste ce qui touche la base :
 * ratisser, lire, et relever.
 *
 * Elle vit ici parce qu'elle interroge `lieuInclusion`, et elle figure dans
 * l'API publique de la feature parce que ses appelants doivent la composer
 * DANS leur propre transaction — d'où le client passé en paramètre. C'est le
 * cas qu'AR-7 prévoit : recoller en mémoire ferait sortir la corrélation de la
 * transaction qui l'utilise, et deux lecteurs concurrents créeraient le doublon
 * que la sonde existe précisément pour éviter.
 */

/**
 * Ratissage : le code INSEE ou le code postal.
 *
 * L'égalité stricte des codes INSEE ne suffit pas, et c'est tout l'intérêt du
 * standard : Paris, Lyon et Marseille sont désignées tantôt par le code de la
 * commune (75056), tantôt par celui de l'arrondissement (75101). Le standard les
 * réunit — encore faut-il que SQL ait présenté le candidat. Ratisser sur le seul
 * code INSEE les manquerait.
 *
 * Le code postal élargit donc la moisson ; `memeCommune` resserre ensuite.
 */
const auMemeEndroit = ({ codeInsee, codePostal }: LieuAMaterialiser) => ({
  OR: [...(codeInsee ? [{ codeInsee }] : []), { codePostal }],
})

/**
 * Sonde de corrélation : cherche dans la coop un lieu qui désigne le même
 * endroit que celui qu'on s'apprête à créer, pour s'y rattacher plutôt que d'en
 * créer un doublon.
 *
 * Aucune identité ne relie les deux. Un lieu venu de la cartographie nationale
 * ou de l'annuaire des entreprises ne porte pas l'id du lieu coop qui lui
 * correspond, et l'id de cartographie nationale ne peut pas jouer ce rôle : il
 * n'est posé qu'a posteriori par le job nightly de la carto, si bien qu'un lieu
 * créé dans la coop et publié depuis n'en a pas encore — et serait recréé.
 *
 * On corrèle donc sur ce qui désigne un ENDROIT : la dénomination, à la même
 * adresse, dans la même commune. Le jugement appartient au standard
 * `@gouvfr-anct/lieux-de-mediation-numerique`, partagé avec la cartographie
 * nationale — les dénominations y sont normalisées, parce que la même structure
 * ne porte pas le même libellé selon la source qui la décrit (« Mairie de
 * Fleury » côté coop, « COMMUNE DE FLEURY » côté annuaire).
 *
 * Le SIRET ne participe à aucun de ces jugements : il identifie une entité
 * juridique, pas un endroit.
 *
 * En cas de doute on ne fusionne pas : un doublon se détecte
 * (`detect-duplicate-lieux`) et se répare (fusion de lieux), une fusion à tort
 * perd l'adresse du lieu absorbé sans laisser de trace.
 *
 * Rend aussi la force de la corrélation et l'état de suppression du lieu trouvé,
 * dont dépend le droit de relever un lieu supprimé (cf. `preparerCorrele`).
 *
 * Même hiérarchie que la sonde des imports (`findOrCreateLieuInclusion`), sans
 * son géocodage : on est ici dans une transaction, qui n'a rien à attendre du
 * réseau. Le filtrage se fait en mémoire, la comparaison de noms n'étant pas
 * exprimable en SQL — une commune compte 2 lieux en moyenne, 89 au maximum.
 */
export const lieuCorrele = async (
  transaction: Prisma.TransactionClient,
  lieu: LieuAMaterialiser,
): Promise<Correle | null> => {
  const selection = {
    id: true,
    nom: true,
    adresse: true,
    latitude: true,
    longitude: true,
    commune: true,
    codePostal: true,
    codeInsee: true,
    suppression: true,
    // Sans elle, on opposerait la typologie DÉCLARÉE du lieu saisi à celle que le
    // standard DÉDUIT du nom du candidat — « Mairie de Fleury » rendrait MUNI, et
    // toute saisie déclarée autrement serait écartée à tort.
    typologies: true,
  } as const

  // Sans code INSEE, le standard ne reconnaîtra aucun candidat comme d'une même
  // commune : on s'arrête avant la requête. Le cas ne se présente pas en
  // production — les adresses viennent de l'API adresse, qui en rend toujours un,
  // et aucun des 12 477 lieux de la base n'en est dépourvu.
  if (!lieu.codeInsee) return null

  const candidats = await transaction.lieuInclusion.findMany({
    where: auMemeEndroit(lieu),
    orderBy: { creation: 'asc' },
    select: selection,
  })

  return correler(candidats, lieu)
}

/**
 * Résout la corrélation en un lieu prêt à porter une activité, ou `null` s'il
 * faut en matérialiser un nouveau.
 *
 * - Lieu corrélé actif : on s'y rattache — c'est tout l'intérêt de la sonde.
 * - Lieu corrélé supprimé : la suppression est un acte de modération (un lieu
 *   illégitime retiré de la cartographie). On ne la défait que sur corrélation
 *   FORTE — un simple homonyme ne doit pas pouvoir ressusciter un lieu banni —,
 *   et le lieu relevé revient INVISIBLE de la cartographie : le rendre à nouveau
 *   visible demande une nouvelle décision, jamais une simple ré-inscription.
 *   Sinon, il n'est pas relevé (`null`) : on matérialisera un lieu neuf, lui
 *   aussi invisible par défaut, sans toucher au lieu modéré.
 */
export const preparerCorrele = async (
  transaction: Prisma.TransactionClient,
  correle: Correle,
): Promise<{ readonly id: string } | null> => {
  if (correle.suppression === null) return { id: correle.id }

  if (!correle.forte) return null

  return transaction.lieuInclusion.update({
    where: { id: correle.id },
    data: {
      suppression: null,
      suppressionParId: null,
      // Un lieu relevé ne réapparaît pas de lui-même sur la cartographie : la
      // visibilité se re-décide, elle ne se réhérite pas d'un lieu modéré.
      visiblePourCartographieNationale: false,
      derniereModificationSource: null,
    },
    select: { id: true },
  })
}
