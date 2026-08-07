import { prismaClient } from '@app/web/prismaClient'
import { EmployeuseId } from '../../../../domain/employeuse-id'
import type { RattacherAUneEmployeuse } from '../../domain/rattacher-a-une-employeuse'
import {
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
} from './ensureAffectationEmploiMain'
import { ensurePersonneMain } from './ensurePersonneMain'
import { ensureStructureAdministrativeMain } from './ensureStructureAdministrativeMain'

/**
 * L'employeuse d'abord (elle peut échouer sans conséquence pour l'appelant),
 * puis la personne et son affectation dans une seule transaction : on ne veut
 * pas d'une personne créée sans le rattachement qui la justifiait, ni d'une
 * affectation active laissée en double avec la précédente.
 */
export const rattacherAUneEmployeuse: RattacherAUneEmployeuse = async ({
  userId,
  identite,
}) => {
  const employeuse = await ensureStructureAdministrativeMain({
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

    const personne = await ensurePersonneMain(
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
  })

  return { _tag: 'rattachee', employeuseId: EmployeuseId(employeuse.id) }
}
