import assert from 'node:assert'
import {
  type Accepteur,
  accepterUneInvitation,
} from '@app/web/features/equipe/abilities/accepter-une-invitation'
import {
  CoordinateurId,
  Email,
  MediateurId,
  ReferenceInvitation,
  UtilisateurId,
} from '@app/web/features/equipe/domain'
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
  coordinateur?: CoordinateurSeme
  invite?: MediateurSeme
  note?: MediateurSeme
  inscriptionValidee?: boolean
  issue?: Awaited<ReturnType<typeof accepterUneInvitation>>
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const invite = (): MediateurSeme => {
  assert.ok(contexte.invite)
  return contexte.invite
}

const note = (): MediateurSeme => {
  assert.ok(contexte.note)
  return contexte.note
}

const inviter = async ({
  inscriptionValidee = true,
  ancienMembre = false,
}: {
  inscriptionValidee?: boolean
  ancienMembre?: boolean
} = {}) => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.invite = await semerUnMediateurDEquipe({ inscriptionValidee })
  contexte.inscriptionValidee = inscriptionValidee
  if (ancienMembre)
    await semerUneAdhesion({
      coordinateurId: coordinateur().coordinateurId,
      mediateurId: invite().mediateurId,
      archivee: true,
    })
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: invite().email,
    mediateurId: invite().mediateurId,
  })
}

const accepteurDe = (
  mediateur: MediateurSeme,
  inscriptionValidee: boolean,
): Accepteur =>
  inscriptionValidee
    ? {
        type: 'InscriptionValidee',
        email: Email(mediateur.email),
        mediateurId: MediateurId(mediateur.mediateurId),
      }
    : { type: 'InscriptionEnCours', email: Email(mediateur.email) }

const accepterPar = async (
  mediateur: MediateurSeme,
  inscriptionValidee = true,
) => {
  contexte.issue = await accepterUneInvitation({
    reference: ReferenceInvitation({
      email: Email(invite().email),
      coordinateurId: CoordinateurId(coordinateur().coordinateurId),
    }),
    accepteur: accepteurDe(mediateur, inscriptionValidee),
    auteurId: UtilisateurId(mediateur.userId),
  })
}

const estMembre = async (mediateur: MediateurSeme): Promise<boolean> =>
  (
    await adhesionsDe({
      coordinateurId: coordinateur().coordinateurId,
      mediateurId: mediateur.mediateurId,
    })
  ).some(({ suppression }) => suppression === null)

const invitation = () =>
  invitationDe({
    coordinateurId: coordinateur().coordinateurId,
    email: invite().email,
  })

Given('un médiateur inscrit invité à rejoindre une équipe', async () => {
  await inviter()
})

Given("un ancien membre invité à rejoindre de nouveau l'équipe", async () => {
  await inviter({ ancienMembre: true })
})

Given(
  "un médiateur en cours d'inscription invité à rejoindre une équipe",
  async () => {
    await inviter({ inscriptionValidee: false })
  },
)

Given(
  "une invitation adressée à une personne mais notée au nom d'un autre médiateur",
  async () => {
    contexte.coordinateur = await semerUnCoordinateur()
    contexte.invite = await semerUnMediateurDEquipe()
    contexte.note = await semerUnMediateurDEquipe()
    contexte.inscriptionValidee = true
    await semerUneInvitation({
      coordinateurId: coordinateur().coordinateurId,
      email: invite().email,
      mediateurId: note().mediateurId,
    })
  },
)

When("ce médiateur accepte l'invitation", async () => {
  await accepterPar(invite(), contexte.inscriptionValidee)
})

When("la personne invitée accepte l'invitation", async () => {
  await accepterPar(invite())
})

When('un autre médiateur accepte cette invitation', async () => {
  await accepterPar(await semerUnMediateurDEquipe())
})

Then("l'acceptation réussit", () => {
  assert.strictEqual(contexte.issue?.success, true)
})

Then("l'acceptation est refusée", () => {
  assert.strictEqual(contexte.issue?.success, false)
})

Then("ce médiateur est membre de l'équipe", async () => {
  assert.strictEqual(await estMembre(invite()), true)
})

Then("la personne invitée est membre de l'équipe", async () => {
  assert.strictEqual(await estMembre(invite()), true)
})

Then("ce médiateur n'est pas membre de l'équipe", async () => {
  assert.strictEqual(await estMembre(invite()), false)
})

Then("le médiateur noté n'est pas membre de l'équipe", async () => {
  assert.strictEqual(await estMembre(note()), false)
})

Then('son ancienne adhésion reste archivée', async () => {
  const adhesions = await adhesionsDe({
    coordinateurId: coordinateur().coordinateurId,
    mediateurId: invite().mediateurId,
  })
  assert.strictEqual(adhesions.length, 2)
  assert.strictEqual(
    adhesions.filter(({ suppression }) => suppression !== null).length,
    1,
  )
})

Then("l'invitation est marquée acceptée", async () => {
  assert.ok((await invitation())?.acceptee)
})

Then("l'invitation reste en attente", async () => {
  const lue = await invitation()
  assert.strictEqual(lue?.acceptee, null)
  assert.strictEqual(lue?.refusee, null)
})
