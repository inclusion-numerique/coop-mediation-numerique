import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { signaler } from '@/configuration/telemetry/serveur'
import { relancerUneInvitation as relancerUneInvitationAvec } from '@/features/equipe/abilities/relancer-une-invitation/domain/relancer-une-invitation'
import { enregistrerLaRelance } from '@/features/equipe/abilities/relancer-une-invitation/implementations/prisma/enregistrer-la-relance.mutation'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
  UtilisateurId,
} from '@/features/equipe/domain'
import {
  type CoordinateurSeme,
  invitationDe,
  semerUnCoordinateur,
  semerUneInvitation,
} from '@/features/equipe/equipe.cucumber'
import { envoyerUneInvitation } from '@/features/equipe/implementations/email'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '@/features/equipe/implementations/prisma/invitation.query'

const relancerUneInvitation = relancerUneInvitationAvec({
  lireUneInvitation,
  lireLeCoordinateur,
  envoyerUneInvitation,
  signaler,
  enregistrerLaRelance,
})

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

const ilYADeuxJours = () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)

const inviter = async (
  statut: 'EnAttente' | 'Refusee',
  envoyeeLe: Date = ilYADeuxJours(),
) => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.email = `relance-${coordinateur().coordinateurId}@example.com`
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: emailInvite(),
    statut,
    envoyeeLe,
  })
}

const relancerPar = async (auteur: CoordinateurSeme) => {
  contexte.issue = await relancerUneInvitation({
    reference: ReferenceInvitation({
      email: Courriel(emailInvite()),
      coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    }),
    gestionnaire: {
      type: 'Coordinateur',
      coordinateurId: CoordinateurId(auteur.coordinateurId),
    },
    auteurId: UtilisateurId(auteur.userId),
    maintenant: new Date(),
  })
}

Given(
  "un coordinateur qui attend la réponse d'une personne invitée",
  async () => {
    await inviter('EnAttente')
  },
)

Given("un coordinateur qui vient d'inviter une personne", async () => {
  await inviter('EnAttente', new Date())
})

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
