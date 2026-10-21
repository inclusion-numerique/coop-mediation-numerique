import assert from 'node:assert'
import { annulerUneInvitation } from '@app/web/features/equipe/abilities/annuler-une-invitation'
import {
  CoordinateurId,
  Email,
  ReferenceInvitation,
  UtilisateurId,
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
  issue?: Awaited<ReturnType<typeof annulerUneInvitation>>
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
  contexte.email = `annulation-${coordinateur().coordinateurId}@example.com`
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: emailInvite(),
    statut,
  })
}

const annulerPar = async (auteur: CoordinateurSeme) => {
  contexte.issue = await annulerUneInvitation({
    reference: ReferenceInvitation({
      email: Email(emailInvite()),
      coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    }),
    gestionnaire: {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(auteur.coordinateurId),
    },
    auteurId: UtilisateurId(auteur.userId),
  })
}

Given('un coordinateur qui a invité une personne', async () => {
  await inviter('EnAttente')
})

Given("un coordinateur dont l'invitation a été acceptée", async () => {
  await inviter('Acceptee')
})

When('le coordinateur annule cette invitation', async () => {
  await annulerPar(coordinateur())
})

When("le coordinateur d'une autre équipe annule cette invitation", async () => {
  await annulerPar(await semerUnCoordinateur())
})

Then("l'annulation réussit", () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then("l'annulation est refusée", () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then("cette invitation n'existe plus", async () => {
  assert.strictEqual(
    await invitationDe({
      coordinateurId: coordinateur().coordinateurId,
      email: emailInvite(),
    }),
    null,
  )
})

Then('cette invitation existe toujours', async () => {
  assert.notStrictEqual(
    await invitationDe({
      coordinateurId: coordinateur().coordinateurId,
      email: emailInvite(),
    }),
    null,
  )
})
