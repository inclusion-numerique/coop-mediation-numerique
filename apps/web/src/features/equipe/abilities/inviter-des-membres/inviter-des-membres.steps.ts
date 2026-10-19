import assert from 'node:assert'
import { inviterDesMembres } from '@app/web/features/equipe/abilities/inviter-des-membres'
import {
  CoordinateurId,
  EmailInvitation,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
import {
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
  coordinateur?: CoordinateurSeme
  mediateur?: MediateurSeme
  issue?: Awaited<ReturnType<typeof inviterDesMembres>>
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const mediateur = (): MediateurSeme => {
  assert.ok(contexte.mediateur)
  return contexte.mediateur
}

const unique = (email: string): string =>
  email.replace('@', `+${coordinateur().coordinateurId.slice(0, 8)}@`)

const inviter = async (emails: readonly string[]) => {
  contexte.issue = await inviterDesMembres({
    coordinateur: {
      id: CoordinateurId(coordinateur().coordinateurId),
      nom: 'Coordinateur de test',
    },
    candidats: emails.map(EmailInvitation),
    auteurId: UtilisateurId(coordinateur().userId),
  })
}

Given('un coordinateur qui constitue son équipe', async () => {
  contexte.coordinateur = await semerUnCoordinateur()
})

Given('un coordinateur qui a déjà invité {string}', async (email: string) => {
  contexte.coordinateur = await semerUnCoordinateur()
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: unique(email),
  })
})

Given(
  "un coordinateur dont {string} a refusé l'invitation",
  async (email: string) => {
    contexte.coordinateur = await semerUnCoordinateur()
    await semerUneInvitation({
      coordinateurId: coordinateur().coordinateurId,
      email: unique(email),
      statut: 'Refusee',
    })
  },
)

Given('un autre coordinateur qui a invité {string}', async (email: string) => {
  const autre = await semerUnCoordinateur()
  await semerUneInvitation({
    coordinateurId: autre.coordinateurId,
    email: unique(email),
  })
})

Given('un médiateur inscrit sur la Coop', async () => {
  contexte.mediateur = await semerUnMediateurDEquipe()
})

Given('un médiateur déjà membre de cette équipe', async () => {
  contexte.mediateur = await semerUnMediateurDEquipe()
  await semerUneAdhesion({
    coordinateurId: coordinateur().coordinateurId,
    mediateurId: mediateur().mediateurId,
  })
})

When('le coordinateur invite {string}', async (email: string) => {
  await inviter([unique(email)])
})

When(
  'le coordinateur invite ce médiateur en écrivant son email en majuscules',
  async () => {
    await inviter([mediateur().email.toUpperCase()])
  },
)

Then('{int} invitation est envoyée', (nombre: number) => {
  assert.ok(contexte.issue?.success)
  assert.strictEqual(contexte.issue.data.envoyees.length, nombre)
})

Then("aucune invitation n'est envoyée", () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then('{string} attend une réponse', async (email: string) => {
  const invitation = await invitationDe({
    coordinateurId: coordinateur().coordinateurId,
    email: unique(email),
  })
  assert.ok(invitation)
  assert.strictEqual(invitation.acceptee, null)
  assert.strictEqual(invitation.refusee, null)
})

Then("l'invitation désigne ce médiateur", async () => {
  const invitation = await invitationDe({
    coordinateurId: coordinateur().coordinateurId,
    email: mediateur().email,
  })
  assert.strictEqual(invitation?.mediateurId, mediateur().mediateurId)
})
