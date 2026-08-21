import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { conseillerNumeriqueWhere } from './employeuse.transfer'

/**
 * Sémantique SQL du filtre « relève du dispositif », qu'aucun test unitaire ne peut établir : ce qui
 * est en jeu est la traduction Prisma, pas la forme de l'objet.
 *
 * Le cas qui justifie ce fichier est le QUATRIÈME : un utilisateur sans `main.personne`. Il ne relève
 * pas du dispositif et doit donc apparaître dans le filtre « hors dispositif » ; s'il tombait des
 * deux côtés, un compte disparaîtrait d'un écran d'annuaire sans la moindre erreur pour le signaler.
 *
 * Les assertions ont été vérifiées par mutation : retirer `estActive` du filtre en fait tomber trois.
 */
describe('conseillerNumeriqueWhere', () => {
  const avecIdposteActive = v4()
  const avecIdposteDesactivee = v4()
  const avecCoopSeulement = v4()
  const sansPersonne = v4()

  const tous = [
    avecIdposteActive,
    avecIdposteDesactivee,
    avecCoopSeulement,
    sansPersonne,
  ]

  const state = { employeuseId: 0 }

  const seedUtilisateur = (id: string) =>
    prismaClient.user.create({
      data: { id, email: `dispositif+${id}@test.gouv.fr`, isFixture: true },
      select: { id: true },
    })

  const seedAffectation = async (
    coopId: string,
    source: string,
    estActive: boolean,
  ) => {
    const personne = await prismaClient.personneMain.create({
      data: { coopId },
      select: { id: true },
    })
    await prismaClient.personneAffectationEmploiMain.create({
      data: {
        personneId: personne.id,
        structureAdministrativeId: state.employeuseId,
        source,
        estActive,
      },
    })
  }

  /** Ids retenus par le filtre, bornés à ce jeu de test — la base en contient bien d'autres. */
  const filtres = async (releveDuDispositif: boolean): Promise<string[]> => {
    const users = await prismaClient.user.findMany({
      where: {
        id: { in: tous },
        ...conseillerNumeriqueWhere(releveDuDispositif),
      },
      select: { id: true },
      orderBy: { email: 'asc' },
    })
    return users.map(({ id }) => id)
  }

  beforeAll(async () => {
    const employeuse = await prismaClient.structureAdministrativeMain.create({
      data: { denominationAntenne: `Dispositif ${v4()}` },
      select: { id: true },
    })
    state.employeuseId = employeuse.id

    await Promise.all(tous.map((id) => seedUtilisateur(id)))

    await seedAffectation(avecIdposteActive, 'idposte', true)
    await seedAffectation(avecIdposteDesactivee, 'idposte', false)
    await seedAffectation(avecCoopSeulement, 'coop', true)
    // `sansPersonne` reste volontairement sans `main.personne`.
  })

  afterAll(async () => {
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { structureAdministrativeId: state.employeuseId },
    })
    await prismaClient.personneMain.deleteMany({
      where: { coopId: { in: tous } },
    })
    await prismaClient.user.deleteMany({ where: { id: { in: tous } } })
    await prismaClient.structureAdministrativeMain.delete({
      where: { id: state.employeuseId },
    })
  })

  it('ne retient que l’affectation idposte active', async () => {
    expect(await filtres(true)).toEqual([avecIdposteActive])
  })

  // Le contrat conum terminé : l'Entrepôt désactive l'affectation, et la personne sort du dispositif
  // immédiatement — sans attendre qu'une synchro recopie un drapeau.
  it('exclut une affectation idposte désactivée', async () => {
    expect(await filtres(true)).not.toContain(avecIdposteDesactivee)
  })

  it('ne confond pas le déclaratif coop avec le dispositif', async () => {
    expect(await filtres(true)).not.toContain(avecCoopSeulement)
  })

  it('range tout le reste hors dispositif, personne absente comprise', async () => {
    const horsDispositif = await filtres(false)

    expect(horsDispositif).toContain(sansPersonne)
    expect(horsDispositif).toContain(avecIdposteDesactivee)
    expect(horsDispositif).toContain(avecCoopSeulement)
    expect(horsDispositif).not.toContain(avecIdposteActive)
  })

  // Les deux filtres partitionnent : aucun compte ne peut tomber dans les deux, ni dans aucun.
  it('partitionne l’ensemble des comptes', async () => {
    const dans = await filtres(true)
    const hors = await filtres(false)

    expect([...dans, ...hors].toSorted()).toEqual(tous.toSorted())
  })
})
