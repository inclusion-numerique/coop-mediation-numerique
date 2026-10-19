import assert from 'node:assert'
import { ajouterUnMembre } from '@app/web/features/equipe/abilities/ajouter-un-membre'
import { CoordinateurId, UtilisateurId } from '@app/web/features/equipe/domain'
import {
  adhesionsDe,
  type CoordinateurSeme,
  invitationDe,
  type MediateurSeme,
  semerUnCoordinateur,
  semerUneAdhesion,
  semerUneInvitation,
  semerUnMediateurDEquipe,
} from '@app/web/features/equipe/equipe.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const contexte: {
  premiere?: CoordinateurSeme
  seconde?: CoordinateurSeme
  mediateur?: MediateurSeme
  issue?: Awaited<ReturnType<typeof ajouterUnMembre>>
} = {}

const premiere = (): CoordinateurSeme => {
  assert.ok(contexte.premiere)
  return contexte.premiere
}

const seconde = (): CoordinateurSeme => {
  assert.ok(contexte.seconde)
  return contexte.seconde
}

const mediateur = (): MediateurSeme => {
  assert.ok(contexte.mediateur)
  return contexte.mediateur
}

const ajouter = async () => {
  contexte.issue = await ajouterUnMembre({
    utilisateurId: UtilisateurId(mediateur().userId),
    coordinateurId: CoordinateurId(premiere().coordinateurId),
    auteurId: UtilisateurId(premiere().userId),
  })
}

Given('un médiateur invité dans deux équipes', async () => {
  contexte.premiere = await semerUnCoordinateur()
  contexte.seconde = await semerUnCoordinateur()
  contexte.mediateur = await semerUnMediateurDEquipe()
  await Promise.all(
    [premiere(), seconde()].map(({ coordinateurId }) =>
      semerUneInvitation({
        coordinateurId,
        email: mediateur().email,
        mediateurId: mediateur().mediateurId,
      }),
    ),
  )
})

Given("un médiateur déjà membre d'une équipe", async () => {
  contexte.premiere = await semerUnCoordinateur()
  contexte.mediateur = await semerUnMediateurDEquipe()
  await semerUneAdhesion({
    coordinateurId: premiere().coordinateurId,
    mediateurId: mediateur().mediateurId,
  })
})

When('un administrateur ajoute ce médiateur à la première équipe', async () => {
  await ajouter()
})

When('un administrateur ajoute ce médiateur à cette équipe', async () => {
  await ajouter()
})

Then("l'ajout du membre réussit", () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then("l'ajout du membre est refusé", () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then('ce médiateur fait partie de la première équipe', async () => {
  const adhesions = await adhesionsDe({
    coordinateurId: premiere().coordinateurId,
    mediateurId: mediateur().mediateurId,
  })
  assert.ok(adhesions.some(({ suppression }) => suppression === null))
})

Then('son invitation dans la première équipe est retirée', async () => {
  assert.strictEqual(
    await invitationDe({
      coordinateurId: premiere().coordinateurId,
      email: mediateur().email,
    }),
    null,
  )
})

Then(
  'son invitation dans la seconde équipe attend toujours sa réponse',
  async () => {
    const invitation = await invitationDe({
      coordinateurId: seconde().coordinateurId,
      email: mediateur().email,
    })
    assert.ok(invitation)
    assert.strictEqual(invitation.acceptee, null)
  },
)
