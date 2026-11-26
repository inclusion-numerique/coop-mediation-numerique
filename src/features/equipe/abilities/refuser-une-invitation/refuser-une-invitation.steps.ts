import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { refuserUneInvitation as refuserUneInvitationAvec } from '@/features/equipe/abilities/refuser-une-invitation/domain/refuser-une-invitation'
import { enregistrerLeRefus } from '@/features/equipe/abilities/refuser-une-invitation/implementations/prisma/enregistrer-le-refus.mutation'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
} from '@/features/equipe/domain'
import {
  type CoordinateurSeme,
  invitationDe,
  semerUnCoordinateur,
  semerUneInvitation,
} from '@/features/equipe/equipe.cucumber'
import { prevenirLeCoordinateur } from '@/features/equipe/implementations/email'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '@/features/equipe/implementations/prisma/invitation.query'

const refuserUneInvitation = refuserUneInvitationAvec({
  lireUneInvitation,
  enregistrerLeRefus,
  lireLeCoordinateur,
  prevenirLeCoordinateur,
})

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
      email: Courriel(emailInvite()),
      coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    }),
    auteurId: null,
    maintenant: new Date(),
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
