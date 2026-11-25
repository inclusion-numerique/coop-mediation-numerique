import assert from 'node:assert'
import { Then, When } from '@cucumber/cucumber'
import {
  type LieuPourLInscription,
  listerLesLieuxPourLInscription,
} from '@/features/lieux-activite/abilities/lister-les-lieux-pour-l-inscription/implementations/prisma/lister-les-lieux-pour-l-inscription.query'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { ficheSemee } from '@/features/lieux-activite/lieux-activite.cucumber'

const listes = new Map<'inscription', readonly LieuPourLInscription[]>()

const lieuxListes = (): readonly LieuPourLInscription[] =>
  listes.get('inscription') ?? []

When("on liste les lieux de ce médiateur pour l'inscription", async () => {
  listes.set(
    'inscription',
    await listerLesLieuxPourLInscription({
      mediateurId: MediateurId(ficheSemee().mediateurRattacheId),
    }),
  )
})

Then("les lieux listés pour l'inscription contiennent ce lieu", () => {
  assert.deepStrictEqual(
    lieuxListes().map(({ id }) => id),
    [ficheSemee().lieuId],
  )
})

Then("aucun lieu n'est listé pour l'inscription", () => {
  assert.deepStrictEqual(lieuxListes(), [])
})

Then("le lieu listé pour l'inscription porte l'identifiant du registre", () => {
  assert.deepStrictEqual(
    lieuxListes().map(
      ({ structureCartographieNationaleId }) =>
        structureCartographieNationaleId,
    ),
    ['Coop-numérique_du-registre__France-Services_9999'],
  )
})
