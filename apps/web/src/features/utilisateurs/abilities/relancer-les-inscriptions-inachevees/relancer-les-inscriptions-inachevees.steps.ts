import assert from 'node:assert'
import type { RapportDeRelance } from '@app/web/features/utilisateurs/domain'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { OnboardingStatus } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { relancerLesInscriptionsInachevees } from './commands/relancer-les-inscriptions-inachevees'
import { effacerLInscription } from './implementation'

const UN_JOUR = 24 * 60 * 60 * 1000

const relance: {
  utilisateurId?: string
  rapports: readonly RapportDeRelance[]
  evenements: readonly string[]
} = { rapports: [], evenements: [] }

const utilisateurId = (): string => {
  assert.ok(relance.utilisateurId, 'Aucune inscription semée')
  return relance.utilisateurId
}

const consigner = (destinataire: string, evenement: string) => {
  if (destinataire === relance.utilisateurId)
    relance.evenements = [...relance.evenements, evenement]
}

Given(
  /^une inscription commencée il y a (\d+) jours, relance "([^"]+)"(, avec un bénéficiaire)?$/,
  async (jours: string, statut: string, avecUnBeneficiaire: string | null) => {
    relance.evenements = []
    relance.utilisateurId = await semerUnCompteDeListe({
      prenom: 'Ines',
      marqueur: `Inscription${v4().slice(0, 8)}`,
      creeLe: new Date(Date.now() - Number(jours) * UN_JOUR),
      inscritLe: null,
      relance:
        Object.values(OnboardingStatus).find((valeur) => valeur === statut) ??
        null,
      mediateur: { derniereActivite: null, dernierBeneficiaire: null },
      avecUnBeneficiaire: avecUnBeneficiaire !== null,
    })
  },
)

When('les inscriptions inachevées sont relancées', async () => {
  relance.rapports = await relancerLesInscriptionsInachevees({
    maintenant: new Date(),
    ports: {
      envoyerLaRelance: async ({ utilisateurId: id }, palier) =>
        consigner(id, `relance J+${palier}`),
      envoyerLAvertissement: async ({ utilisateurId: id }) =>
        consigner(id, 'avertissement'),
      envoyerLAvisDEffacement: async ({ utilisateurId: id }) =>
        consigner(id, 'avis d’effacement'),
      effacerLInscription: async (id) => {
        if (id === relance.utilisateurId) await effacerLInscription(id)
      },
      retirerDesListes: async () => undefined,
    },
  })
})

Then(/^cette inscription reçoit la relance de J\+(\d+)$/, (palier: string) => {
  assert.ok(relance.evenements.includes(`relance J+${palier}`))
})

Then('sa relance enregistrée est {string}', async (attendu: string) => {
  const { onboardingStatus } = await prismaClient.user.findUniqueOrThrow({
    where: { id: utilisateurId() },
    select: { onboardingStatus: true },
  })
  assert.strictEqual(onboardingStatus, attendu)
})

Then('cette inscription est effacée', async () => {
  assert.strictEqual(
    await prismaClient.user.count({ where: { id: utilisateurId() } }),
    0,
  )
})

Then("cette inscription n'est pas effacée", async () => {
  assert.strictEqual(
    await prismaClient.user.count({ where: { id: utilisateurId() } }),
    1,
  )
})

Then("la personne est prévenue de l'effacement", () => {
  assert.ok(relance.evenements.includes('avis d’effacement'))
})
