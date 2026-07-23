import { ensurePersonneMain } from '@app/web/features/structures/main/ensurePersonneMain'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

describe('ensurePersonneMain', () => {
  const dejaRelieId = v4()
  const parEmailId = v4()
  const nouveauId = v4()
  const emailIdposte = `idposte+${v4()}@test.gouv.fr`
  const emailNouveau = `nouveau+${v4()}@test.gouv.fr`

  const created = { dejaRelieePersonneId: 0, idpostePersonneId: 0 }

  const utilisateur = (id: string, email: string) => ({
    id,
    email,
    profilInscription: 'Mediateur' as const,
    acceptationCgu: new Date(),
  })

  beforeAll(async () => {
    await prismaClient.user.createMany({
      data: [
        utilisateur(dejaRelieId, `u1+${dejaRelieId}@test.gouv.fr`),
        utilisateur(parEmailId, emailIdposte),
        utilisateur(nouveauId, emailNouveau),
      ],
    })

    // Cas 1 : personne déjà reliée (coop_id posé).
    const dejaReliee = await prismaClient.personneMain.create({
      data: { coopId: dejaRelieId },
      select: { id: true },
    })
    created.dejaRelieePersonneId = dejaReliee.id

    // Cas 2 : personne existant via idposte (email dans le contact), sans coop_id.
    const idposte = await prismaClient.personneMain.create({
      data: { contact: { idposte: { email: emailIdposte } } },
      select: { id: true },
    })
    created.idpostePersonneId = idposte.id
  })

  afterAll(async () => {
    await prismaClient.personneMain.deleteMany({
      where: {
        coopId: { in: [dejaRelieId, parEmailId, nouveauId] },
      },
    })
    await prismaClient.user.deleteMany({
      where: { id: { in: [dejaRelieId, parEmailId, nouveauId] } },
    })
  })

  it('renvoie la personne déjà reliée sans en créer', async () => {
    const result = await ensurePersonneMain({
      coopUserId: dejaRelieId,
      email: `u1+${dejaRelieId}@test.gouv.fr`,
    })
    expect(result.id).toBe(created.dejaRelieePersonneId)
  })

  it('relie par email une personne préexistante (idposte) en posant le coop_id', async () => {
    const result = await ensurePersonneMain({
      coopUserId: parEmailId,
      email: emailIdposte,
    })

    expect(result.id).toBe(created.idpostePersonneId)
    const linked = await prismaClient.personneMain.findUniqueOrThrow({
      where: { id: created.idpostePersonneId },
      select: { coopId: true },
    })
    expect(linked.coopId).toBe(parEmailId)
  })

  it('crée une personne quand aucune n’existe', async () => {
    const result = await ensurePersonneMain({
      coopUserId: nouveauId,
      email: emailNouveau,
    })

    const personne = await prismaClient.personneMain.findUniqueOrThrow({
      where: { id: result.id },
      select: { coopId: true },
    })
    expect(personne.coopId).toBe(nouveauId)
  })
})
