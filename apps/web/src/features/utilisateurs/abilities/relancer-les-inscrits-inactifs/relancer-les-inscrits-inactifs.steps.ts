import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { OnboardingStatus } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { relancerLesInscritsInactifs } from './commands/relancer-les-inscrits-inactifs'

const UN_JOUR = 24 * 60 * 60 * 1000

const relance: {
  utilisateurId?: string
  evenements: readonly string[]
} = { evenements: [] }

const utilisateurId = (): string => {
  assert.ok(relance.utilisateurId, 'Aucun inscrit semé')
  return relance.utilisateurId
}

const consigner = (destinataire: string, evenement: string) => {
  if (destinataire === relance.utilisateurId)
    relance.evenements = [...relance.evenements, evenement]
}

Given(
  /^un inscrit depuis (\d+) jours, relance "([^"]+)"(, avec un bénéficiaire)?$/,
  async (jours: string, statut: string, avecUnBeneficiaire: string | null) => {
    relance.evenements = []
    relance.utilisateurId = await semerUnCompteDeListe({
      prenom: 'Noe',
      marqueur: `Inscrit${v4().slice(0, 8)}`,
      creeLe: new Date(Date.now() - (Number(jours) + 1) * UN_JOUR),
      inscritLe: new Date(Date.now() - Number(jours) * UN_JOUR),
      relance:
        Object.values(OnboardingStatus).find((valeur) => valeur === statut) ??
        null,
      mediateur: { derniereActivite: null, dernierBeneficiaire: null },
      avecUnBeneficiaire: avecUnBeneficiaire !== null,
    })
  },
)

When('les inscrits inactifs sont relancés', async () => {
  await relancerLesInscritsInactifs({
    maintenant: new Date(),
    ports: {
      envoyerLaRelance: async ({ utilisateurId: id }, palier) =>
        consigner(id, `relance J+${palier}`),
      envoyerLAvertissement: async ({ utilisateurId: id }) =>
        consigner(id, 'avertissement'),
      envoyerLAvisDEffacement: async ({ utilisateurId: id }) =>
        consigner(id, 'avis de suppression'),
      supprimerLeCompte: async (id) => consigner(id, 'suppression'),
    },
  })
})

Then(/^cet inscrit reçoit la relance de J\+(\d+)$/, (palier: string) => {
  assert.ok(relance.evenements.includes(`relance J+${palier}`))
})

Then(
  "sa relance d'inscrit enregistrée est {string}",
  async (attendu: string) => {
    const { onboardingStatus } = await prismaClient.user.findUniqueOrThrow({
      where: { id: utilisateurId() },
      select: { onboardingStatus: true },
    })
    assert.strictEqual(onboardingStatus, attendu)
  },
)

Then('cet inscrit est supprimé', () => {
  assert.ok(relance.evenements.includes('suppression'))
})

Then('cet inscrit ne reçoit rien', () => {
  assert.deepStrictEqual(relance.evenements, [])
})
