import assert from 'node:assert'
import { semerUnCompteDeListe } from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { terminerLUsurpation } from './commands/terminer-l-usurpation'

const fin: {
  usurpateurId?: string
  cibleId?: string
  jeton?: string
  resultat?: Awaited<ReturnType<typeof terminerLUsurpation>>
} = {}

const exiger = (valeur: string | undefined): string => {
  assert.ok(valeur, 'Contexte incomplet')
  return valeur
}

const semer = async ({
  usurpee,
  usurpateurAdministrateur,
}: {
  usurpee: boolean
  usurpateurAdministrateur: boolean
}) => {
  const marqueur = `FinUsurpation${v4().slice(0, 8)}`
  fin.usurpateurId = await semerUnCompteDeListe({
    prenom: 'Ada',
    marqueur,
    role: usurpateurAdministrateur ? 'Admin' : 'User',
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-01'),
  })
  fin.cibleId = await semerUnCompteDeListe({
    prenom: 'Cible',
    marqueur,
    creeLe: new Date('2026-01-01'),
    inscritLe: new Date('2026-01-02'),
    mediateur: { derniereActivite: null, dernierBeneficiaire: null },
  })
  fin.jeton = v4()
  await prismaClient.session.create({
    data: {
      sessionToken: fin.jeton,
      userId: usurpee ? fin.cibleId : fin.usurpateurId,
      usurperId: usurpee ? fin.usurpateurId : null,
      expires: new Date(Date.now() + 86_400_000),
    },
  })
}

Given('une session usurpée par un administrateur', async () => {
  await semer({ usurpee: true, usurpateurAdministrateur: true })
})

Given('une session usurpée par un ancien administrateur', async () => {
  await semer({ usurpee: true, usurpateurAdministrateur: false })
})

Given('une session sans usurpation', async () => {
  await semer({ usurpee: false, usurpateurAdministrateur: true })
})

When("l'usurpation de cette session est terminée", async () => {
  fin.resultat = await terminerLUsurpation(exiger(fin.jeton))
})

Then("la fin de l'usurpation aboutit", () => {
  assert.ok(fin.resultat?.success, "La fin de l'usurpation a échoué")
})

Then(
  "la fin de l'usurpation échoue avec l'erreur {string}",
  (attendu: string) => {
    const { resultat } = fin
    assert.ok(resultat && !resultat.success, "La fin de l'usurpation a abouti")
    assert.strictEqual(resultat.error._tag, attendu)
  },
)

Then("la session est rendue à l'administrateur", async () => {
  assert.deepStrictEqual(
    await prismaClient.session.findUniqueOrThrow({
      where: { sessionToken: exiger(fin.jeton) },
      select: { userId: true, usurperId: true },
    }),
    { userId: fin.usurpateurId, usurperId: null },
  )
})
