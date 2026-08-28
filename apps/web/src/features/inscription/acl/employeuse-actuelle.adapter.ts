import {
  consulterEmployeuseActuelle,
  employeuseActuelleAffichage,
} from '@app/web/features/employeuse/server'

/**
 * Couche anti-corruption vers la feature employeuse : le seul endroit où
 * l'inscription traduit le vocabulaire d'une autre feature dans le sien.
 *
 * La lecture ne lui appartient pas — elle est faite par l'ability
 * `consulter-employeuse-actuelle` d'employeuse, atteinte par sa frontière. Ce
 * module n'en consomme que la mise à plat d'affichage, et tranche ici les replis
 * dont les écrans d'inscription ont besoin, sans les faire remonter dans la
 * lecture.
 *
 * L'`id` exposé est l'entier `main.structure_administrative.id` : la clé qu'attend
 * la matérialisation du lieu depuis les données main.
 */
export const employeuseActuelleAdaptee = async ({
  userId,
}: {
  userId: string
}) => {
  const employeuseActuelle = await consulterEmployeuseActuelle({ userId })
  if (!employeuseActuelle) return null

  const {
    id,
    nom,
    adresse,
    commune,
    codePostal,
    codeInsee,
    siret,
    rna,
    nomReferent,
    courrielReferent,
    telephoneReferent,
  } = employeuseActuelleAffichage(employeuseActuelle)

  return {
    structure: {
      id,
      // Le domaine dit `null` quand l'employeuse n'a aucune dénomination (14 en production) ; la
      // carte d'inscription attend un libellé. Le repli d'affichage est décidé ici, chez le
      // consommateur, et n'a pas à remonter dans la lecture.
      nom: nom ?? '',
      adresse,
      commune,
      codePostal,
      codeInsee,
      // `main` ne porte pas le complément d'adresse (décision 6 révisée) -> toujours null.
      complementAdresse: null,
      siret,
      rna,
      nomReferent,
      courrielReferent,
      telephoneReferent,
    },
  }
}

export type EmployeuseActuelleAdaptee = NonNullable<
  Awaited<ReturnType<typeof employeuseActuelleAdaptee>>
>

export type EmployeuseAffichee = EmployeuseActuelleAdaptee['structure']

/**
 * L'identifiant seul de l'employeuse actuelle — ce que demandent les abilities
 * qui agissent sur elle, par opposition aux écrans qui l'affichent.
 *
 * Même lecture, même frontière : l'`id` est l'entier
 * `main.structure_administrative.id`.
 */
export const employeuseActuelleId = async ({
  userId,
}: {
  userId: string
}): Promise<number | null> => {
  const employeuseActuelle = await consulterEmployeuseActuelle({ userId })
  if (!employeuseActuelle) return null

  return employeuseActuelleAffichage(employeuseActuelle).id
}
