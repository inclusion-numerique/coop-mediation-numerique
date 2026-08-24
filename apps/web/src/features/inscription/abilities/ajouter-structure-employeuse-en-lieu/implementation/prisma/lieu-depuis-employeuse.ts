import {
  employeuseMainSelect,
  employeuseMainToLieuData,
} from '@app/web/features/inscription/implementation/prisma/employeuse-en-lieu.data'
import { prismaClient } from '@app/web/prismaClient'
import type { EmployeuseId } from '../../domain'

/**
 * Données du lieu à matérialiser depuis l'employeuse `main` (source de vérité),
 * et clé qui permet de le retrouver ensuite.
 *
 * Le lieu ne porte aucun lien vers l'employeuse — pas de FK, pas d'id repris :
 * on le retrouve par la clé de corrélation employée partout ailleurs, nom +
 * adresse + code INSEE. C'est ce qui le rend partageable entre deux médiateurs
 * de la même employeuse, alors même que l'employeuse vit dans `main` (id entier)
 * et le lieu dans coop (uuid).
 */
export const lieuDepuisEmployeuse = async (
  structureEmployeuseId: EmployeuseId,
) => {
  const structureMain =
    await prismaClient.structureAdministrativeMain.findUniqueOrThrow({
      where: { id: structureEmployeuseId },
      select: employeuseMainSelect,
    })

  const lieuData = employeuseMainToLieuData(structureMain)

  return {
    lieuData,
    lieuCorrele: {
      suppression: null,
      nom: lieuData.nom,
      adresse: lieuData.adresse,
      codeInsee: lieuData.codeInsee,
    },
  }
}
