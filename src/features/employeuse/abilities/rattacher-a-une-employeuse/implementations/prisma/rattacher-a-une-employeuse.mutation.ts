import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { Prisma } from '@/generated/prisma/client'
import { EmployeuseId } from '../../../../domain/employeuse-id'
import type { RattacherAUneEmployeuse } from '../../domain/rattacher-a-une-employeuse'
import {
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
} from './garantir-l-affectation-d-emploi.mutation'
import {
  ensureStructureAdministrativeMain,
  type ServicesDeLEmployeuse,
} from './garantir-la-structure-administrative.mutation'

export type RegistreDesPersonnes = {
  readonly garantirLaPersonne: (
    compte: { readonly coopUserId: string; readonly email: string },
    transaction: Prisma.TransactionClient,
  ) => Promise<{ readonly id: number }>
  readonly synchroniserLaPersonne: (
    transaction: Prisma.TransactionClient,
    utilisateurId: string,
  ) => Promise<unknown>
}

export type ServicesDuRattachement = ServicesDeLEmployeuse &
  RegistreDesPersonnes

/**
 * L'employeuse d'abord (elle peut échouer sans conséquence pour l'appelant),
 * puis la personne et son affectation dans une seule transaction : on ne veut
 * pas d'une personne créée sans le rattachement qui la justifiait, ni d'une
 * affectation active laissée en double avec la précédente.
 */
export const rattacherAUneEmployeuse =
  (services: ServicesDuRattachement): RattacherAUneEmployeuse =>
  async ({ userId, identite }) => {
    const employeuse = await ensureStructureAdministrativeMain(services)({
      coopId: null,
      siret: identite.siret,
      identite: {
        // Une employeuse peut n'avoir aucune dénomination (non diffusible, entreprise
        // individuelle) : `ensureStructureAdministrativeMain` retraduit la chaîne vide
        // en `null`, valeur que porte déjà la colonne.
        nom: identite.denomination ?? '',
        adresse: identite.adresse.voie ?? '',
        commune: identite.adresse.commune,
        codePostal: identite.adresse.codePostal ?? '',
        codeInsee: identite.adresse.codeInsee ?? '',
      },
    })

    if (!employeuse) return { _tag: 'employeuseIndisponible' }

    await prismaClient.$transaction(async (transaction) => {
      const { email } = await transaction.user.findUniqueOrThrow({
        where: { id: userId },
        select: { email: true },
      })

      const personne = await services.garantirLaPersonne(
        { coopUserId: userId, email },
        transaction,
      )

      await ensureAffectationEmploiMain(
        { personneId: personne.id, structureAdministrativeId: employeuse.id },
        transaction,
      )

      // Un seul employeur courant : les autres rattachements déclarés par la coop
      // sont clos. Ceux des autres sources (idposte) appartiennent à l'Entrepôt.
      await deactivateCoopAffectationsExcept(
        {
          personneId: personne.id,
          keepStructureAdministrativeIds: [employeuse.id],
        },
        transaction,
      )

      await services.synchroniserLaPersonne(transaction, userId)
    })

    return { _tag: 'rattachee', employeuseId: EmployeuseId(employeuse.id) }
  }
