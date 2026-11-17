import assert from 'node:assert'
import { reglerLePartageStatistiques } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques'
import { AuteurId, PerimetrePartage } from '@app/web/features/mediateurs/domain'
import {
  compteSeme,
  rattachementsSemes,
} from '@app/web/features/mediateurs/mediateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Then, When } from '@cucumber/cucumber'

type Issue = Awaited<ReturnType<typeof reglerLePartageStatistiques>>

type Partage = { readonly id: string; readonly deleted: Date | null }

const dernier: { reglage?: Issue; avant?: Partage | null } = {}

const momentDuReglage = new Date('2026-06-01T10:00:00.000Z')

const partageDu = (role: 'mediateur' | 'coordinateur') => {
  const { mediateurId, coordinateurId } = compteSeme()
  const proprietaireId = role === 'mediateur' ? mediateurId : coordinateurId
  if (proprietaireId === null) return Promise.resolve(null)
  return prismaClient.partageStatistiques.findUnique({
    where:
      role === 'mediateur'
        ? { mediateurId: proprietaireId }
        : { coordinateurId: proprietaireId },
    select: { id: true, deleted: true },
  })
}

const perimetreDuCompte = (): PerimetrePartage =>
  PerimetrePartage(
    compteSeme().mediateurId === null ? 'Coordinateur' : 'Mediateur',
  )

const regler = async (
  actif: boolean,
  perimetre: PerimetrePartage = perimetreDuCompte(),
) => {
  dernier.avant = await partageDu('mediateur')
  dernier.reglage = await reglerLePartageStatistiques({
    rattachements: rattachementsSemes(),
    perimetre,
    actif,
    auteurId: AuteurId(compteSeme().userId),
    maintenant: momentDuReglage,
  })
}

When('ce compte active le partage de ses statistiques', async () => {
  await regler(true)
})

When('ce compte active le partage des statistiques de son équipe', async () => {
  await regler(true, PerimetrePartage('Coordinateur'))
})

When('ce compte désactive le partage de ses statistiques', async () => {
  await regler(false)
})

Then('le partage du médiateur est actif', async () => {
  assert.strictEqual(dernier.reglage?.success, true)
  assert.strictEqual((await partageDu('mediateur'))?.deleted, null)
})

Then('le partage du coordinateur est actif', async () => {
  assert.strictEqual(dernier.reglage?.success, true)
  assert.strictEqual((await partageDu('coordinateur'))?.deleted, null)
})

Then('le partage du médiateur est inactif', async () => {
  assert.strictEqual(dernier.reglage?.success, true)
  assert.notStrictEqual((await partageDu('mediateur'))?.deleted ?? null, null)
})

Then('le lien du partage est resté le même', async () => {
  assert.strictEqual((await partageDu('mediateur'))?.id, dernier.avant?.id)
})

Then('la date de désactivation du partage est restée la même', async () => {
  assert.deepStrictEqual(
    (await partageDu('mediateur'))?.deleted,
    dernier.avant?.deleted,
  )
})

Then("ce compte n'a aucun partage", async () => {
  assert.strictEqual(dernier.reglage?.success, true)
  assert.strictEqual(await partageDu('mediateur'), null)
})

Then("le médiateur n'a aucun partage", async () => {
  assert.strictEqual(await partageDu('mediateur'), null)
})

Then("le coordinateur n'a aucun partage", async () => {
  assert.strictEqual(await partageDu('coordinateur'), null)
})

Then(
  "le réglage du partage échoue car le compte n'a pas de statistiques à partager",
  () => {
    assert.deepStrictEqual(dernier.reglage, {
      success: false,
      error: { _tag: 'AucuneStatistiqueAPartager' },
    })
  },
)

Then(
  "le réglage du partage échoue car le compte n'est pas rattaché à ce périmètre",
  () => {
    assert.deepStrictEqual(dernier.reglage, {
      success: false,
      error: { _tag: 'PerimetreNonRattache' },
    })
  },
)
