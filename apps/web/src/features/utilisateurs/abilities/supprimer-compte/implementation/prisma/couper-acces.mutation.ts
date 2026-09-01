import {
  identiteAnonymeFromDomain,
  liaisonRevoqueeFromDomain,
} from '@app/web/features/utilisateurs/db/compte.transfer'
import type {
  IdentiteAnonyme,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Le noyau de l'effacement : couper l'accès et effacer l'identité, en une seule
 * transaction.
 *
 * Il vient EN PREMIER, avant toute étape satellite, et pour une raison de
 * correction et non de confort : tant qu'une session reste ouverte, la personne
 * peut recréer pendant l'effacement ce qu'on vient d'effacer.
 *
 * Les trois écritures sont indissociables. Révoquer les jetons sans anonymiser
 * laisserait un compte identifiable qui ne peut plus se connecter ; anonymiser
 * sans révoquer laisserait des accès vivants sur une identité effacée — c'est
 * exactement le défaut d'aujourd'hui.
 *
 * La ligne `accounts` est mise à jour, jamais supprimée : c'est elle qui porte
 * la clé par laquelle ProConnect retrouvera la personne si elle revient.
 *
 * L'identité n'est écrite QU'UNE FOIS. Sur un compte déjà supprimé — le rejeu
 * par un administrateur, qui sert à finir un effacement laissé incomplet — elle
 * est déjà anonyme, et la réécrire lui donnerait une nouvelle adresse à chaque
 * passage : l'empreinte se calcule sur le courriel courant, lequel vaut déjà
 * `deleted+…` au second tour. Les sessions et les jetons, eux, sont toujours
 * repris : c'est précisément ce que l'ancien code ne faisait pas.
 */
export const couperAcces = ({
  utilisateurId,
  identite,
  supprimeLe,
  dejaAnonymise,
}: {
  readonly utilisateurId: UtilisateurId
  readonly identite: IdentiteAnonyme
  readonly supprimeLe: Date
  readonly dejaAnonymise: boolean
}): Promise<void> =>
  prismaClient.$transaction(async (transaction) => {
    await transaction.session.deleteMany({ where: { userId: utilisateurId } })

    await transaction.account.updateMany({
      where: { userId: utilisateurId },
      data: liaisonRevoqueeFromDomain(),
    })

    if (dejaAnonymise) return

    await transaction.user.update({
      where: { id: utilisateurId },
      data: identiteAnonymeFromDomain(identite, supprimeLe),
    })
  })
