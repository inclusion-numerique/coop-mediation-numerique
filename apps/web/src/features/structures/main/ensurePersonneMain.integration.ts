import { ensurePersonneMain } from '@app/web/features/structures/main/ensurePersonneMain'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'

describe('ensurePersonneMain', () => {
  const dejaRelieId = v4()
  const parEmailId = v4()
  const nouveauId = v4()
  const casseId = v4()
  const tieBreakId = v4()
  const emailIdposte = `idposte+${v4()}@test.gouv.fr`
  const emailNouveau = `nouveau+${v4()}@test.gouv.fr`
  const emailCasse = `Casse+${v4()}@Test.Gouv.FR`
  const emailPartage = `partage+${v4()}@test.gouv.fr`

  const created = {
    dejaRelieePersonneId: 0,
    idpostePersonneId: 0,
    cassePersonneId: 0,
    avecAffectationId: 0,
    sansAffectationId: 0,
    structureId: 0,
  }

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
        utilisateur(casseId, emailCasse),
        utilisateur(tieBreakId, emailPartage),
      ],
    })

    // Cas 1 : personne déjà reliée (coop_id posé).
    const dejaReliee = await prismaClient.personneMain.create({
      data: { coopId: dejaRelieId },
      select: { id: true },
    })
    created.dejaRelieePersonneId = dejaReliee.id

    // Cas 2 : personne existant via idposte (clé RÉELLE `mail_perso`), sans coop_id.
    const idposte = await prismaClient.personneMain.create({
      data: { contact: { idposte: { mail_perso: emailIdposte } } },
      select: { id: true },
    })
    created.idpostePersonneId = idposte.id

    // Cas 3 : email stocké en minuscules, recherché avec une autre casse (normalisation).
    const casse = await prismaClient.personneMain.create({
      data: { contact: { coop: { email: emailCasse.toLowerCase() } } },
      select: { id: true },
    })
    created.cassePersonneId = casse.id

    // Cas 4 (tie-break) : deux personnes partagent le même email ; une seule porte une affectation
    // idposte active + structure -> c'est celle-là qu'on doit relier.
    const structure = await prismaClient.structureAdministrativeMain.create({
      data: { denominationAntenne: `Tie-break ${v4()}` },
      select: { id: true },
    })
    created.structureId = structure.id

    const avecAffectation = await prismaClient.personneMain.create({
      data: { contact: { idposte: { mail_pro: emailPartage } } },
      select: { id: true },
    })
    created.avecAffectationId = avecAffectation.id

    const sansAffectation = await prismaClient.personneMain.create({
      data: { contact: { coop: { email: emailPartage } } },
      select: { id: true },
    })
    created.sansAffectationId = sansAffectation.id

    await prismaClient.personneAffectationEmploiMain.create({
      data: {
        personneId: avecAffectation.id,
        structureAdministrativeId: structure.id,
        source: 'idposte',
        estActive: true,
      },
    })
  })

  afterAll(async () => {
    // FK en RESTRICT : affectations d'abord, puis personnes, puis structure.
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { structureAdministrativeId: created.structureId },
    })
    await prismaClient.personneMain.deleteMany({
      where: {
        id: {
          in: [
            created.dejaRelieePersonneId,
            created.idpostePersonneId,
            created.cassePersonneId,
            created.avecAffectationId,
            created.sansAffectationId,
          ],
        },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: created.structureId },
    })
    await prismaClient.user.deleteMany({
      where: {
        id: {
          in: [dejaRelieId, parEmailId, nouveauId, casseId, tieBreakId],
        },
      },
    })
  })

  it('renvoie la personne déjà reliée sans en créer', async () => {
    const result = await ensurePersonneMain({
      coopUserId: dejaRelieId,
      email: `u1+${dejaRelieId}@test.gouv.fr`,
    })
    expect(result.id).toBe(created.dejaRelieePersonneId)
  })

  it('relie par email (idposte.mail_perso) une personne préexistante en posant le coop_id', async () => {
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

  it('matche l’email insensiblement à la casse', async () => {
    const result = await ensurePersonneMain({
      coopUserId: casseId,
      email: emailCasse, // casse mixte, stocké en minuscules
    })
    expect(result.id).toBe(created.cassePersonneId)
  })

  it('en cas d’email partagé, préfère la personne portant l’affectation idposte active', async () => {
    const result = await ensurePersonneMain({
      coopUserId: tieBreakId,
      email: emailPartage,
    })
    expect(result.id).toBe(created.avecAffectationId)
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
