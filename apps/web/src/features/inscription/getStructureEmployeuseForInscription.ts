import {
  personneEmployeuseSelect,
  resolveEmployeuseActuelle,
} from '@app/web/features/structures/main/affectationEmploiMain'
import { prismaClient } from '@app/web/prismaClient'

// Structure employeuse COURANTE de l'inscription, lue en PUR MAIN (ADR-002 périmètre élargi) :
// `coop.user → main.personne (coop_id) → affectation active → structure_administrative`, via
// `resolveEmployeuseActuelle`. Plus aucune référence à `coop.employes_structures` / `structureMain`.
// L'`id` exposé est l'entier `main.structure_administrative.id` : clé de la mutation
// `ajouterStructureEmployeuseEnLieuActivite`, qui matérialise le lieu depuis les données main.
export const getStructureEmployeuseForInscription = async ({
  userId,
}: {
  userId: string
}) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: { personneMain: { select: personneEmployeuseSelect } },
  })

  const employeuse = resolveEmployeuseActuelle(user?.personneMain ?? null)
  if (!employeuse) return null

  return {
    structure: {
      id: employeuse.structureMainId,
      nom: employeuse.nom,
      adresse: employeuse.adresse,
      commune: employeuse.commune,
      codePostal: employeuse.codePostal,
      codeInsee: employeuse.codeInsee,
      // `main` ne porte pas le complément d'adresse (décision 6 révisée) -> toujours null.
      complementAdresse: null,
      siret: employeuse.siret,
      rna: employeuse.rna,
      nomReferent: employeuse.nomReferent,
      courrielReferent: employeuse.courrielReferent,
      telephoneReferent: employeuse.telephoneReferent,
    },
  }
}

export type StructureEmployeuseForInscription = NonNullable<
  Awaited<ReturnType<typeof getStructureEmployeuseForInscription>>
>

export type InscriptionStructureEmployeuse =
  StructureEmployeuseForInscription['structure']
