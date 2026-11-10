import assert from 'node:assert'
import {
  type LieuPourLInscription,
  listerLesLieuxPourLInscription,
} from '@app/web/features/lieux-activite/abilities/lister-les-lieux-pour-l-inscription'
import { MediateurId } from '@app/web/features/lieux-activite/domain/mediateur-id'
import { ficheSemee } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { Then, When } from '@cucumber/cucumber'

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
