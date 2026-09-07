import {
  employeuseMainSelect,
  employeuseMainToLieuData,
} from '@app/web/features/inscription/implementation/prisma/employeuse-en-lieu.data'
import { prismaClient } from '@app/web/prismaClient'
import type { EmployeuseId } from '../../domain'

/**
 * Données du lieu à matérialiser depuis l'employeuse `main` (source de vérité).
 *
 * Le lieu ne porte aucun lien vers l'employeuse — pas de FK, pas d'id repris. On
 * le retrouve donc par la sonde de corrélation des lieux (`lieuCorrele`, dans
 * l'API publique de `features/lieux-activite`),
 * celle-là même qu'emploient les autres chemins de matérialisation d'un lieu :
 * SIRET de provenance sûre, sinon dénomination à la même adresse. C'est ce qui
 * le rend partageable entre deux médiateurs de la même employeuse, alors même
 * que l'employeuse vit dans `main` (id entier) et le lieu dans coop (uuid).
 */
export const lieuDepuisEmployeuse = async (
  structureEmployeuseId: EmployeuseId,
) => {
  const structureMain =
    await prismaClient.structureAdministrativeMain.findUniqueOrThrow({
      where: { id: structureEmployeuseId },
      select: employeuseMainSelect,
    })

  return employeuseMainToLieuData(structureMain)
}
