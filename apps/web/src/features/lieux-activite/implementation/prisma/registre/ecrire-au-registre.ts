import type { Prisma } from '@prisma/client'
import type { Lieu } from '../../../domain/lieu'
import { lieuToDomain } from '../lieu.transfer'
import type { LigneDuLieu } from '../ligne-du-lieu'
import { adresseDuRegistre } from './adresse-du-registre'
import { identifiantCarto, inscriptionCorrelee } from './inscription-correlee'
import {
  type ColonnesDuRegistre,
  lieuVersRegistre,
} from './lieu.registre.transfer'

/**
 * Ce que le registre retient de l'auteur d'une écriture. `carto`, `coop`,
 * `app_python`, `id-poste` s'y côtoient déjà : c'est la convention de
 * l'Entrepôt, pas la nôtre.
 */
const EDITE_PAR = 'coop'

/**
 * La source que porte une inscription dont la coop tient les valeurs — l'étiquette
 * que la colonne emploie déjà, sur 8 518 lignes.
 *
 * Elle est posée à CHAQUE écriture, y compris sur une inscription moissonnée
 * ailleurs : dès lors que la coop en écrit la fiche, c'est d'elle que viennent
 * les données qu'on y lit, et `source` doit le dire. Une inscription qui
 * annoncerait `dora` en portant ce que le médiateur vient de saisir tromperait
 * ses lecteurs sur la provenance de ce qu'ils ont sous les yeux.
 *
 * Ce que la fiche était avant reste lisible : `coop.lieu_inclusion` en garde la
 * mémoire, et `updated_at_carto` face à `updated_at_coop` dit laquelle des deux
 * sources a parlé en dernier.
 */
const SOURCE_COOP = 'Coop numérique'

/**
 * L'identifiant de cartographie, s'il est libre ou déjà porté par l'inscription
 * qu'on s'apprête à écrire — `null` sinon.
 *
 * Il est UNIQUE côté registre et ne l'est PAS côté coop. Deux lieux coop qui le
 * partageraient feraient donc échouer la seconde écriture sur
 * `lieu_inclusion_carto_id_ukey`, en plein enregistrement du médiateur. Entre une
 * inscription sans identifiant et un enregistrement qui casse, on choisit la
 * première : réunir des lieux coop qui n'auraient jamais dû se partager le même
 * identifiant est le métier de la réconciliation cartographique, pas celui du
 * formulaire qu'on est en train de valider.
 */
const identifiantCartoARevendiquer = async (
  transaction: Prisma.TransactionClient,
  {
    identifiant,
    inscriptionId,
  }: {
    readonly identifiant: string | null
    readonly inscriptionId: number | null
  },
): Promise<string | null> => {
  if (identifiant == null) return null

  const porteur = await transaction.lieuInclusionRegistreMain.findUnique({
    where: { structureCartographieNationaleId: identifiant },
    select: { id: true },
  })

  return porteur == null || porteur.id === inscriptionId ? identifiant : null
}

/**
 * Écrit le lieu au registre de l'Entrepôt, dans la transaction de l'appelant.
 *
 * Trois issues, dans cet ordre, et l'ordre est tout le sujet.
 *
 * 1. Le lieu y est déjà inscrit sous son lien coop : on met à jour. `colonnes`
 *    choisit ce que la modification touche, sur le motif de l'écriture coop —
 *    une section n'écrit que ses propres colonnes, sinon deux enregistrements
 *    rapprochés se réécrivent l'un l'autre avec des valeurs périmées.
 *
 * 2. Le registre décrit déjà cet endroit, sous une autre source et sans lien
 *    coop : on ADOPTE cette inscription — on y pose le lien et les valeurs de la
 *    coop — au lieu d'en créer une seconde. C'est le cas qui rend une inscription
 *    aveugle dangereuse : la sonde de la coop ne regarde que `coop.lieu_inclusion`,
 *    où un lieu moissonné chez `dora` ne figure pas. La fiche coop se crée donc à
 *    bon droit, et c'est ici, et seulement ici, qu'on évite le doublon au registre
 *    national.
 *
 * 3. Personne ne le connaît : on inscrit.
 *
 * L'adresse est résolue à chaque écriture, y compris quand la section n'y touche
 * pas : c'est une lecture indexée, et elle rattrape les lignes dont
 * `adresse_id` n'a jamais été posé.
 */
export const ecrireAuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    lieu,
    colonnes,
    maintenant,
  }: {
    readonly lieu: Lieu
    readonly colonnes: (
      toutes: ColonnesDuRegistre,
    ) => Partial<ColonnesDuRegistre>
    readonly maintenant: Date
  },
): Promise<void> => {
  const toutes = lieuVersRegistre(lieu)
  const adresseId = await adresseDuRegistre(transaction, lieu)

  const tracabilite = {
    adresseId,
    source: SOURCE_COOP,
    editedBy: EDITE_PAR,
    updatedAtCoop: maintenant,
  }

  const inscrit = await transaction.lieuInclusionRegistreMain.findUnique({
    where: { structureCoopId: lieu.id },
    select: { id: true },
  })

  if (inscrit != null) {
    await transaction.lieuInclusionRegistreMain.update({
      where: { id: inscrit.id },
      data: { ...colonnes(toutes), ...tracabilite },
    })

    return
  }

  const aAdopter = await inscriptionCorrelee(transaction, lieu)

  // Adopter, c'est reprendre l'inscription en entier : la coop en devient la
  // source, et `updated_at` — colonne générée, qu'on n'écrit pas — le dira
  // d'elle-même en prenant `updated_at_coop`.
  if (aAdopter != null) {
    await transaction.lieuInclusionRegistreMain.update({
      where: { id: aAdopter },
      data: {
        ...toutes,
        ...tracabilite,
        structureCartographieNationaleId: await identifiantCartoARevendiquer(
          transaction,
          { identifiant: identifiantCarto(lieu), inscriptionId: aAdopter },
        ),
        structureCoopId: lieu.id,
      },
    })

    return
  }

  await transaction.lieuInclusionRegistreMain.create({
    data: {
      ...toutes,
      ...tracabilite,
      structureCartographieNationaleId: await identifiantCartoARevendiquer(
        transaction,
        { identifiant: identifiantCarto(lieu), inscriptionId: null },
      ),
      structureCoopId: lieu.id,
      createdAt: maintenant,
    },
  })
}

/** À la création, tout le lieu s'écrit. */
export const toutesLesColonnes = (
  toutes: ColonnesDuRegistre,
): ColonnesDuRegistre => toutes

/**
 * Écrit au registre un lieu en entier, depuis la LIGNE que la coop en a
 * stockée.
 *
 * C'est la forme dont ont besoin les chemins qui viennent de créer ou de fondre
 * une fiche : ils tiennent la ligne, pas le lieu du domaine. Partir de la ligne
 * relue plutôt que des données préparées n'est pas un détour — c'est ce que la
 * coop a effectivement enregistré, défauts de colonnes compris, qui doit partir
 * au registre, sans quoi les deux tables diraient des choses proches mais pas
 * identiques.
 *
 * C'est aussi ce que la feature expose au-dehors : un appelant d'une autre
 * feature n'a pas à connaître le transfer qui va de la ligne au domaine.
 */
export const ecrireLeLieuAuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    ligne,
    maintenant,
  }: { readonly ligne: LigneDuLieu; readonly maintenant: Date },
): Promise<void> =>
  ecrireAuRegistre(transaction, {
    lieu: lieuToDomain(ligne),
    colonnes: toutesLesColonnes,
    maintenant,
  })

/**
 * Marque l'inscription comme supprimée, sans effacer la ligne : le registre
 * appartient à l'Entrepôt et sert d'autres consommateurs, à qui la disparition
 * pure et simple d'un lieu ne dirait rien. `deleted_at` est sa suppression
 * logique — « NULL = lieu actif », dit la colonne.
 *
 * `updateMany` et non `update` : un lieu que le flux quotidien n'a jamais vu, et
 * que la coop n'a jamais modifié depuis la double écriture, n'a pas
 * d'inscription à retirer. Ce n'est pas une erreur, c'est zéro ligne.
 */
export const retirerDuRegistre = async (
  transaction: Prisma.TransactionClient,
  {
    lieuId,
    maintenant,
  }: { readonly lieuId: string; readonly maintenant: Date },
): Promise<void> => {
  await transaction.lieuInclusionRegistreMain.updateMany({
    where: { structureCoopId: lieuId },
    data: {
      deletedAt: maintenant,
      editedBy: EDITE_PAR,
      updatedAtCoop: maintenant,
    },
  })
}
