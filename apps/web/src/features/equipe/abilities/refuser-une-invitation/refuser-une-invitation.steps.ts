import assert from 'node:assert'
import { refuserUneInvitation } from '@app/web/features/equipe/abilities/refuser-une-invitation'
import {
  CoordinateurId,
  Email,
  ReferenceInvitation,
} from '@app/web/features/equipe/domain'
import {
  type CoordinateurSeme,
  invitationDe,
  semerUnCoordinateur,
  semerUneInvitation,
} from '@app/web/features/equipe/equipe.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const contexte: {
  coordinateur?: CoordinateurSeme
  email?: string
  issue?: Awaited<ReturnType<typeof refuserUneInvitation>>
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const emailInvite = (): string => {
  assert.ok(contexte.email)
  return contexte.email
}

const inviter = async (statut: 'EnAttente' | 'Acceptee') => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.email = `refus-${coordinateur().coordinateurId}@example.com`
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: emailInvite(),
    statut,
  })
}

const invitation = () =>
  invitationDe({
    coordinateurId: coordinateur().coordinateurId,
    email: emailInvite(),
  })

Given('une personne invitée à rejoindre une équipe', async () => {
  await inviter('EnAttente')
})

Given('une personne qui a déjà accepté de rejoindre une équipe', async () => {
  await inviter('Acceptee')
})

When("cette personne refuse l'invitation", async () => {
  contexte.issue = await refuserUneInvitation({
    reference: ReferenceInvitation({
      email: Email(emailInvite()),
      coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    }),
    auteurId: null,
  })
})

Then('le refus réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('le refus est rejeté', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then("l'invitation est marquée refusée", async () => {
  assert.ok((await invitation())?.refusee)
})

Then("l'invitation reste acceptée", async () => {
  const lue = await invitation()
  assert.ok(lue?.acceptee)
  assert.strictEqual(lue?.refusee, null)
})
