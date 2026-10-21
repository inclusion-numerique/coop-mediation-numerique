import assert from 'node:assert'
import {
  inviterDesMembres,
  type MediateursAInviter,
  rechercherDesMediateursAInviter,
} from '@app/web/features/equipe/abilities/inviter-des-membres'
import {
  CoordinateurId,
  Email,
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
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'

const contexte: {
  coordinateur?: CoordinateurSeme
  mediateur?: MediateurSeme
  issue?: Awaited<ReturnType<typeof inviterDesMembres>>
  proposes?: MediateursAInviter
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
    coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    candidats: emails.map(Email),
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

const rechercher = async (recherche: string) => {
  contexte.proposes = await rechercherDesMediateursAInviter({
    coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    recherche,
  })
}

const nomDe = async ({ userId }: MediateurSeme): Promise<string> => {
  const { lastName } = await prismaClient.user.findUniqueOrThrow({
    where: { id: userId },
    select: { lastName: true },
  })
  assert.ok(lastName)
  return lastName
}

const estPropose = (): boolean =>
  (contexte.proposes?.mediateurs ?? []).some(
    ({ mediateurId }) => mediateurId === mediateur().mediateurId,
  )

Given('un ancien membre de cette équipe', async () => {
  contexte.mediateur = await semerUnMediateurDEquipe()
  await semerUneAdhesion({
    coordinateurId: coordinateur().coordinateurId,
    mediateurId: mediateur().mediateurId,
    archivee: true,
  })
})

Given("un médiateur membre de l'équipe d'un autre coordinateur", async () => {
  const autre = await semerUnCoordinateur()
  contexte.mediateur = await semerUnMediateurDEquipe()
  await semerUneAdhesion({
    coordinateurId: autre.coordinateurId,
    mediateurId: mediateur().mediateurId,
  })
})

Given('un médiateur dont le compte est supprimé', async () => {
  contexte.mediateur = await semerUnMediateurDEquipe({ profilSupprime: true })
})

When('le coordinateur recherche ce médiateur par son nom', async () => {
  await rechercher(await nomDe(mediateur()))
})

When(
  'le coordinateur recherche ce médiateur par son nom en majuscules',
  async () => {
    await rechercher((await nomDe(mediateur())).toUpperCase())
  },
)

When('le coordinateur recherche ce médiateur par son email', async () => {
  await rechercher(mediateur().email)
})

When(
  "le coordinateur recherche ce médiateur par son nom et un prénom qui n'est pas le sien",
  async () => {
    await rechercher(`Inconnu ${await nomDe(mediateur())}`)
  },
)

Then('ce médiateur est proposé', () => {
  assert.ok(estPropose())
})

Then("ce médiateur n'est pas proposé", () => {
  assert.ok(!estPropose())
})
