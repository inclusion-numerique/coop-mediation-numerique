import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { activerLaMediationNumerique } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/domain/activer-la-mediation-numerique'
import { inscrireLeContactALaListe } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/brevo/inscrire-le-contact-a-la-liste.mutation'
import {
  activer,
  compteQuiActive,
} from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/prisma/activer.mutation'
import { inscritAInscrire } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/prisma/inscrit-a-inscrire.query'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'

const activerLaMediationNumeriqueAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  activerLaMediationNumerique({
    lireLeCompteQuiActive: compteQuiActive,
    activer: activer(synchroniserLaPersonne),
    lireLInscritAInscrire: inscritAInscrire,
    inscrireALaListeDeDiffusion: inscrireLeContactALaListe,
  })

const activation: {
  utilisateurId?: string
  resultat?: Awaited<
    ReturnType<ReturnType<typeof activerLaMediationNumeriqueAvec>>
  >
} = {}

const utilisateurId = (): string => {
  assert.ok(activation.utilisateurId, 'Aucun compte semé')
  return activation.utilisateurId
}

const semer = async (mediateur: boolean, coordinateur: boolean) => {
  activation.utilisateurId = await semerUnCompteDeListe({
    prenom: 'Coline',
    marqueur: `Mediation${v4().slice(0, 8)}`,
    creeLe: new Date('2026-01-01'),
    inscritLe: null,
    mediateur: mediateur
      ? { derniereActivite: null, dernierBeneficiaire: null }
      : null,
    coordinateur: coordinateur
      ? { aUneEquipe: false, aCoordonne: false }
      : null,
  })
}

Given('un coordinateur sans médiation numérique', async () => {
  await semer(false, true)
})

Given('un coordinateur qui a déjà activé la médiation numérique', async () => {
  await semer(true, true)
})

Given('un médiateur sans rôle coordinateur', async () => {
  await semer(true, false)
})

When('il active la médiation numérique', async () => {
  activation.resultat = await activerLaMediationNumeriqueAvec(
    async () => undefined,
  )({ utilisateurId: utilisateurId() })
})

Then("l'activation de la médiation aboutit", () => {
  assert.ok(activation.resultat?.success, "L'activation a échoué")
})

Then(
  "l'activation de la médiation échoue avec l'erreur {string}",
  (attendu: string) => {
    const { resultat } = activation
    assert.ok(resultat && !resultat.success, "L'activation a abouti")
    assert.strictEqual(resultat.error._tag, attendu)
  },
)

Then(/^son compte porte (?:le|un seul) rôle médiateur$/, async () => {
  assert.strictEqual(
    await prismaClient.mediateur.count({ where: { userId: utilisateurId() } }),
    1,
  )
})
