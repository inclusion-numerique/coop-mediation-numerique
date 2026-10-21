import assert from 'node:assert'
import { relancerUneInvitation } from '@app/web/features/equipe/abilities/relancer-une-invitation'
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
  issue?: Awaited<ReturnType<typeof relancerUneInvitation>>
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const emailInvite = (): string => {
  assert.ok(contexte.email)
  return contexte.email
}

const inviter = async (statut: 'EnAttente' | 'Refusee') => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.email = `relance-${coordinateur().coordinateurId}@example.com`
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: emailInvite(),
    statut,
  })
}

const relancerPar = async (auteur: CoordinateurSeme) => {
  contexte.issue = await relancerUneInvitation({
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

Given(
  "un coordinateur qui attend la réponse d'une personne invitée",
  async () => {
    await inviter('EnAttente')
  },
)

Given("un coordinateur dont l'invitation a été refusée", async () => {
  await inviter('Refusee')
})

When('le coordinateur relance cette invitation', async () => {
  await relancerPar(coordinateur())
})

When(
  "le coordinateur d'une autre équipe relance cette invitation",
  async () => {
    await relancerPar(await semerUnCoordinateur())
  },
)

Then('la relance réussit', () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then('la relance est refusée', () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then("l'invitation porte la date de sa relance", async () => {
  const invitation = await invitationDe({
    coordinateurId: coordinateur().coordinateurId,
    email: emailInvite(),
  })
  assert.ok(invitation?.renvoyee)
})
