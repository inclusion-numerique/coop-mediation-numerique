import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import type { RapportDeRelance } from '@/features/utilisateurs/domain'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'
import { OnboardingStatus } from '@/generated/prisma/client'
import { success } from '@/libraries/result'
import { relancerLesInscriptionsInachevees } from './domain/relancer-les-inscriptions-inachevees'
import { effacerLInscription } from './implementations/prisma/effacer-l-inscription.mutation'
import { inscriptionsInachevees } from './implementations/prisma/inscriptions-inachevees.query'

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
  return success(undefined)
}

Given(
  /^une inscription commencée il y a (\d+) jours, relance "([^"]+)"(, avec un bénéficiaire)?(, avertie d'une suppression pour demain)?$/,
  async (
    jours: string,
    statut: string,
    avecUnBeneficiaire: string | null,
    suppressionDemain: string | null,
  ) => {
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
      ...(suppressionDemain === null
        ? {}
        : { suppressionAnnonceeLe: new Date(Date.now() + UN_JOUR) }),
    })
  },
)

When('les inscriptions inachevées sont relancées', async () => {
  const resultat = await relancerLesInscriptionsInachevees({
    lireLesComptesARelancer: inscriptionsInachevees,
    noterLaRelance: noterLaRelance('Inscription'),
    envoyerLaRelance: async ({ utilisateurId: id }, palier) =>
      consigner(id, `relance J+${palier}`),
    envoyerLAvertissement: async ({ utilisateurId: id }) =>
      consigner(id, 'avertissement'),
    envoyerLAvisDEffacement: async ({ utilisateurId: id }) =>
      consigner(id, 'avis d’effacement'),
    effacerLInscription: async (id) =>
      id === relance.utilisateurId
        ? effacerLInscription(async () => undefined)(id)
        : success(undefined),
    retirerDesListes: async () => success(undefined),
  })({ maintenant: new Date() })
  relance.rapports = resultat.data
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

Then('cette inscription reçoit un avertissement', () => {
  assert.ok(relance.evenements.includes('avertissement'))
})

Then(
  /^sa suppression est annoncée dans (\d+) jours$/,
  async (jours: string) => {
    const { suppressionAnnonceeLe } = await prismaClient.user.findUniqueOrThrow(
      {
        where: { id: utilisateurId() },
        select: { suppressionAnnonceeLe: true },
      },
    )
    assert.ok(suppressionAnnonceeLe, 'Aucune suppression annoncée')
    const ecart = suppressionAnnonceeLe.getTime() - Date.now()
    assert.ok(Math.abs(ecart - Number(jours) * UN_JOUR) < UN_JOUR)
  },
)
