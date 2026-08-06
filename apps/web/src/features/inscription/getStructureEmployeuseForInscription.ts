import {
  consulterEmployeuseActuelle,
  employeuseActuelleAffichage,
} from '@app/web/features/employeuse/server'

// Structure employeuse COURANTE de l'inscription. La lecture appartient à la feature employeuse
// (ability `consulter-employeuse-actuelle`) ; l'inscription n'en consomme que la mise à plat
// d'affichage. L'`id` exposé est l'entier `main.structure_administrative.id` : clé de la mutation
// `ajouterStructureEmployeuseEnLieuActivite`, qui matérialise le lieu depuis les données main.
export const getStructureEmployeuseForInscription = async ({
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

export type StructureEmployeuseForInscription = NonNullable<
  Awaited<ReturnType<typeof getStructureEmployeuseForInscription>>
>

export type InscriptionStructureEmployeuse =
  StructureEmployeuseForInscription['structure']
