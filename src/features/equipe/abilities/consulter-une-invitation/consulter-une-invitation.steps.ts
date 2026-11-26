import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { consulterUneInvitation as consulterUneInvitationAvec } from '@/features/equipe/abilities/consulter-une-invitation/domain/consulter-une-invitation'
import { type VueInvitation } from '@/features/equipe/abilities/consulter-une-invitation/domain/index'
import { compterLesMembresActifs } from '@/features/equipe/abilities/consulter-une-invitation/implementations/prisma/membres-actifs.query'
import {
  CoordinateurId,
  Courriel,
  ReferenceInvitation,
} from '@/features/equipe/domain'
import {
  type CoordinateurSeme,
  semerUnCoordinateur,
  semerUneAdhesion,
  semerUneInvitation,
  semerUnMediateurDEquipe,
} from '@/features/equipe/equipe.cucumber'
import {
  codeInvitation,
  referenceDuCode,
} from '@/features/equipe/implementations/email/lien-invitation.transfer'
import { lireLeCoordinateur } from '@/features/equipe/implementations/prisma/coordinateur.query'
import { lireUneInvitation } from '@/features/equipe/implementations/prisma/invitation.query'

const consulterUneInvitation = consulterUneInvitationAvec({
  lireUneInvitation,
  lireLeCoordinateur,
  compterLesMembresActifs,
})

const contexte: {
  coordinateur?: CoordinateurSeme
  email?: string
  vue?: VueInvitation
} = {}

const coordinateur = (): CoordinateurSeme => {
  assert.ok(contexte.coordinateur)
  return contexte.coordinateur
}

const emailInvite = (): string => {
  assert.ok(contexte.email)
  return contexte.email
}

const semer = async ({
  statut,
  membres,
}: {
  statut: 'EnAttente' | 'Refusee'
  membres: number
}) => {
  contexte.coordinateur = await semerUnCoordinateur()
  contexte.email = `consultation-${coordinateur().coordinateurId}@example.com`
  await semerUneInvitation({
    coordinateurId: coordinateur().coordinateurId,
    email: emailInvite(),
    statut,
  })
  await Promise.all(
    Array.from({ length: membres }, async () => {
      const membre = await semerUnMediateurDEquipe()
      await semerUneAdhesion({
        coordinateurId: coordinateur().coordinateurId,
        mediateurId: membre.mediateurId,
      })
    }),
  )
}

const ouvrir = async (session: string | null) => {
  const consultation = await consulterUneInvitation({
    reference: referenceDuCode(
      codeInvitation(
        ReferenceInvitation({
          email: Courriel(emailInvite()),
          coordinateurId: CoordinateurId(coordinateur().coordinateurId),
        }),
      ),
    ),
    session: session === null ? null : Courriel(session),
  })
  assert.ok(consultation.success)
  contexte.vue = consultation.data
}

Given(
  'une invitation en attente dans une équipe de {int} membre(s)',
  async (membres: number) => {
    await semer({ statut: 'EnAttente', membres })
  },
)

Given('une invitation refusée', async () => {
  await semer({ statut: 'Refusee', membres: 0 })
})

When('la personne invitée ouvre son invitation', async () => {
  await ouvrir(null)
})

When(
  'la personne invitée ouvre son invitation, connectée avec son email en majuscules',
  async () => {
    await ouvrir(emailInvite().toUpperCase())
  },
)

When('une autre personne connectée ouvre cette invitation', async () => {
  await ouvrir('quelqu-un-d-autre@example.com')
})

Then('elle voit une invitation en attente', () => {
  assert.strictEqual(contexte.vue?.type, 'EnAttente')
})

Then("l'équipe compte {int} membres", (membres: number) => {
  assert.ok(contexte.vue?.type === 'EnAttente')
  assert.strictEqual(contexte.vue.tailleEquipe, membres)
})

Then("elle apprend que l'invitation n'est plus valide", () => {
  assert.strictEqual(contexte.vue?.type, 'DejaTraitee')
})

Then("elle est avertie qu'il ne s'agit pas de son invitation", () => {
  assert.strictEqual(contexte.vue?.type, 'MauvaisDestinataire')
})
