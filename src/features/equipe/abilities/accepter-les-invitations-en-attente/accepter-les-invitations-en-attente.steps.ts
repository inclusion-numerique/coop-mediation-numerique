import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { UtilisateurId } from '@/features/equipe/domain'
import {
  adhesionsDe,
  type CoordinateurSeme,
  invitationDe,
  type MediateurSeme,
  semerUnCoordinateur,
  semerUneInvitation,
  semerUnMediateurDEquipe,
} from '@/features/equipe/equipe.cucumber'
import { accepterLesInvitationsEnAttente } from './domain/accepter-les-invitations-en-attente'
import { enregistrerLesAcceptations } from './implementations/prisma/enregistrer-les-acceptations.mutation'
import {
  lireLeMediateurInvite,
  lireLesInvitationsDe,
} from './implementations/prisma/mediateur-invite.query'

const contexte: {
  coordinateur?: CoordinateurSeme
  invite?: MediateurSeme
  issue?: Awaited<
    ReturnType<ReturnType<typeof accepterLesInvitationsEnAttente>>
  >
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const invite = (): MediateurSeme => {
  assert.ok(contexte.invite)
  return contexte.invite
}

const inviter = async (statut: 'EnAttente' | 'Refusee') => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.invite = await semerUnMediateurDEquipe()
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: invite().email,
    statut,
  })
}

const invitation = () =>
  invitationDe({
    coordinateurId: coordinateur().coordinateurId,
    email: invite().email,
  })

const adhesions = () =>
  adhesionsDe({
    coordinateurId: coordinateur().coordinateurId,
    mediateurId: invite().mediateurId,
  })

Given('un médiateur invité par une équipe avant son inscription', async () => {
  await inviter('EnAttente')
})

Given("un médiateur qui a refusé l'invitation d'une équipe", async () => {
  await inviter('Refusee')
})

Given('son adresse électronique enregistrée est illisible', async () => {
  await prismaClient.user.update({
    where: { id: invite().userId },
    data: { email: `illisible-${v4()}` },
  })
})

When('ses invitations en attente sont acceptées', async () => {
  contexte.issue = await accepterLesInvitationsEnAttente({
    lireLeMediateurInvite,
    lireLesInvitationsDe,
    enregistrerLesAcceptations,
  })({ utilisateurId: UtilisateurId(invite().userId), maintenant: new Date() })
})

Then('son invitation en attente est désormais acceptée', async () => {
  assert.notStrictEqual((await invitation())?.acceptee ?? null, null)
})

Then('son invitation est rattachée à son compte médiateur', async () => {
  assert.strictEqual((await invitation())?.mediateurId, invite().mediateurId)
})

Then('son invitation refusée le reste', async () => {
  assert.strictEqual((await invitation())?.acceptee ?? null, null)
})

Then("il a rejoint l'équipe qui l'avait invité", async () => {
  assert.strictEqual((await adhesions()).length, 1)
})

Then("il n'a pas rejoint cette équipe", async () => {
  assert.strictEqual((await adhesions()).length, 0)
})

Then("l'acceptation est refusée faute de courriel lisible", () => {
  assert.strictEqual(
    contexte.issue?.success === false ? contexte.issue.error._tag : null,
    'CourrielDuMediateurIllisible',
  )
})

Then('son invitation reste en attente', async () => {
  assert.strictEqual((await invitation())?.acceptee ?? null, null)
})
