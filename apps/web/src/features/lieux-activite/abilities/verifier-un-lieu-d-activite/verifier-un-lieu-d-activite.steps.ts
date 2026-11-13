import assert from 'node:assert'
import { LieuId, MediateurId } from '@app/web/features/lieux-activite'
import { effacerDuRegistre } from '@app/web/features/lieux-activite/lieux-activite.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { lieuUtilisablePar, verifierUnLieuDActivite } from './implementation'

const contexte: {
  semis?: { userId: string; mediateurId: string; lieuId: string }
  accepte?: boolean
} = {}

const semer = async (fin: Date | null) => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `verification-lieu-${userId}@example.com` },
  })
  const mediateur = await prismaClient.mediateur.create({
    data: { userId },
    select: { id: true },
  })
  const lieu = await prismaClient.lieuInclusion.create({
    data: {
      nom: `Espace numérique ${v4()}`,
      adresse: '1 rue de la Paix',
      commune: 'Reims',
      codePostal: '51100',
      banId: v4(),
    },
    select: { id: true },
  })
  await prismaClient.mediateurEnActivite.create({
    data: {
      mediateurId: mediateur.id,
      structureId: lieu.id,
      debut: new Date('2026-01-01'),
      fin,
    },
  })
  contexte.semis = { userId, mediateurId: mediateur.id, lieuId: lieu.id }
}

const verifier = async (dejaRattache: boolean) => {
  assert.ok(contexte.semis)
  const lieuId = LieuId(contexte.semis.lieuId)
  contexte.accepte = await verifierUnLieuDActivite({
    lieuId,
    mediateurId: MediateurId(contexte.semis.mediateurId),
    lieuActuel: dejaRattache ? lieuId : null,
  })
}

Given('un médiateur exerçant dans un lieu exploitable', async () => {
  await semer(null)
})

Given(
  "un médiateur ayant cessé d'exercer dans un lieu exploitable",
  async () => {
    await semer(new Date('2026-06-01'))
  },
)

When('on vérifie ce lieu pour ce médiateur', async () => {
  await verifier(false)
})

When(
  "on vérifie ce lieu pour ce médiateur, alors qu'il est déjà rattaché à l'activité",
  async () => {
    await verifier(true)
  },
)

When(
  'la saisie demande si ce lieu est utilisable par ce médiateur',
  async () => {
    assert.ok(contexte.semis)
    contexte.accepte = await lieuUtilisablePar(contexte.semis.mediateurId)(
      contexte.semis.lieuId,
      null,
    )
  },
)

When('la saisie demande si ce lieu est utilisable sans médiateur', async () => {
  assert.ok(contexte.semis)
  contexte.accepte = await lieuUtilisablePar(null)(contexte.semis.lieuId, null)
})

When(
  'la saisie demande si le lieu {string} est utilisable par ce médiateur',
  async (lieu: string) => {
    assert.ok(contexte.semis)
    contexte.accepte = await lieuUtilisablePar(contexte.semis.mediateurId)(
      lieu,
      null,
    )
  },
)

Then('le lieu est accepté', () => {
  assert.strictEqual(contexte.accepte, true)
})

Then('le lieu est refusé', () => {
  assert.strictEqual(contexte.accepte, false)
})

After(async () => {
  const semis = contexte.semis
  contexte.semis = undefined
  contexte.accepte = undefined
  if (!semis) return
  await prismaClient.mediateurEnActivite.deleteMany({
    where: { mediateurId: semis.mediateurId },
  })
  await effacerDuRegistre([semis.lieuId])
  await prismaClient.lieuInclusion.deleteMany({ where: { id: semis.lieuId } })
  await prismaClient.mediateur.deleteMany({ where: { id: semis.mediateurId } })
  await prismaClient.user.deleteMany({ where: { id: semis.userId } })
})
