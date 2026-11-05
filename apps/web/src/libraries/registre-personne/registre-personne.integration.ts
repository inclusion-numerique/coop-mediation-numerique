import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import {
  ensurePersonneMain,
  retirerDuRegistre,
  synchroniserPersonne,
} from './registre-personne'

const courriel = (prefixe: string) => `${prefixe}+${v4()}@test.gouv.fr`

describe('registre des personnes', () => {
  const comptes: string[] = []
  const lignes: number[] = []
  const structures: number[] = []

  const compte = async (
    email = courriel('compte'),
    surcharge: { deleted?: Date; firstName?: string; lastName?: string } = {},
  ) => {
    const id = v4()
    comptes.push(id)
    await prismaClient.user.create({
      data: { id, email, isFixture: true, ...surcharge },
    })
    return { id, email }
  }

  const ligne = async (data: Parameters<typeof creer>[0]) => {
    const { id } = await creer(data)
    lignes.push(id)
    return id
  }

  const creer = (data: {
    coopId?: string
    nom?: string
    prenom?: string
    cnPgId?: number
    contact?: object
    isCoordinateur?: boolean
  }) => prismaClient.personneMain.create({ data, select: { id: true } })

  const relire = (id: number) =>
    prismaClient.personneMain.findUnique({ where: { id } })

  const lire = (coopId: string) =>
    prismaClient.personneMain.findUniqueOrThrow({ where: { coopId } })

  afterAll(async () => {
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: { structureAdministrativeId: { in: structures } },
    })
    await prismaClient.personneMain.deleteMany({
      where: { OR: [{ id: { in: lignes } }, { coopId: { in: comptes } }] },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: { in: structures } },
    })
    await prismaClient.mediateur.deleteMany({
      where: { userId: { in: comptes } },
    })
    await prismaClient.user.deleteMany({ where: { id: { in: comptes } } })
  })

  describe('lier un compte à sa ligne', () => {
    it('renvoie la ligne déjà reliée sans en créer', async () => {
      const { id, email } = await compte()
      const reliee = await ligne({ coopId: id })

      expect(await ensurePersonneMain({ coopUserId: id, email })).toEqual({
        id: reliee,
      })
    })

    it.each(['mail_perso', 'mail_pro'])(
      'relie une ligne libre par son %s idposte',
      async (cle) => {
        const { id, email } = await compte()
        const libre = await ligne({ contact: { idposte: { [cle]: email } } })

        expect(await ensurePersonneMain({ coopUserId: id, email })).toEqual({
          id: libre,
        })
        expect((await relire(libre))?.coopId).toBe(id)
      },
    )

    it('compare le courriel sans tenir compte de la casse', async () => {
      const email = `Casse+${v4()}@Test.Gouv.FR`
      const { id } = await compte(email)
      const libre = await ligne({
        contact: { coop: { email: email.toLowerCase() } },
      })

      expect((await ensurePersonneMain({ coopUserId: id, email })).id).toBe(
        libre,
      )
    })

    it('préfère la ligne portant une affectation idposte active', async () => {
      const { id, email } = await compte()
      const structure = await prismaClient.structureAdministrativeMain.create({
        data: { denominationAntenne: `Départage ${v4()}` },
        select: { id: true },
      })
      structures.push(structure.id)
      await ligne({ contact: { coop: { email } } })
      const avecAffectation = await ligne({
        contact: { idposte: { mail_pro: email } },
      })
      await prismaClient.personneAffectationEmploiMain.create({
        data: {
          personneId: avecAffectation,
          structureAdministrativeId: structure.id,
          source: 'idposte',
          estActive: true,
        },
      })

      expect((await ensurePersonneMain({ coopUserId: id, email })).id).toBe(
        avecAffectation,
      )
    })

    it('reprend la ligne d’un compte supprimé', async () => {
      const ancien = await compte(courriel('ancien'), { deleted: new Date() })
      const { id, email } = await compte()
      const delaissee = await ligne({
        coopId: ancien.id,
        contact: { idposte: { mail_pro: email } },
      })

      expect((await ensurePersonneMain({ coopUserId: id, email })).id).toBe(
        delaissee,
      )
    })

    it('laisse la ligne d’un autre compte vivant et en crée une', async () => {
      const titulaire = await compte()
      const { id, email } = await compte()
      const occupee = await ligne({
        coopId: titulaire.id,
        contact: { idposte: { mail_pro: email } },
      })

      const personne = await ensurePersonneMain({ coopUserId: id, email })

      expect(personne.id).not.toBe(occupee)
      expect((await relire(occupee))?.coopId).toBe(titulaire.id)
      expect((await lire(id)).id).toBe(personne.id)
    })

    it('préfère une ligne libre à la ligne d’un autre compte vivant', async () => {
      const titulaire = await compte()
      const { id, email } = await compte()
      await ligne({
        coopId: titulaire.id,
        contact: { idposte: { mail_pro: email } },
      })
      const libre = await ligne({ contact: { idposte: { mail_perso: email } } })

      expect((await ensurePersonneMain({ coopUserId: id, email })).id).toBe(
        libre,
      )
    })

    it('crée une ligne quand aucune ne porte le courriel', async () => {
      const { id, email } = await compte()

      const personne = await ensurePersonneMain({ coopUserId: id, email })

      expect((await lire(id)).id).toBe(personne.id)
    })
  })

  describe('synchroniser un compte', () => {
    const synchroniser = (id: string) =>
      prismaClient.$transaction((transaction) =>
        synchroniserPersonne(transaction, id),
      )

    it('crée la ligne avec l’identité normalisée, signée par la Coop', async () => {
      const { id, email } = await compte(courriel('nouveau'), {
        firstName: 'jean-luc',
        lastName: 'Martin',
      })

      await synchroniser(id)

      expect(await lire(id)).toMatchObject({
        nom: 'MARTIN',
        prenom: 'Jean-Luc',
        contact: { coop: { email } },
        isMediateur: false,
        isCoordinateur: false,
        editedBy: 'coop',
      })
    })

    it('reporte la visibilité et le rôle du médiateur', async () => {
      const { id } = await compte()
      await prismaClient.mediateur.create({
        data: { userId: id, isVisible: true },
      })

      await synchroniser(id)

      expect(await lire(id)).toMatchObject({
        isMediateur: true,
        isVisible: true,
      })
    })

    it('n’écrit rien quand la ligne est déjà alignée', async () => {
      const { id } = await compte(courriel('stable'), {
        firstName: 'Camille',
        lastName: 'Martin',
      })
      await synchroniser(id)
      const { updatedAtCoop } = await lire(id)

      await synchroniser(id)

      expect((await lire(id)).updatedAtCoop).toEqual(updatedAtCoop)
    })

    it('préserve les blocs des autres sources', async () => {
      const { id, email } = await compte()
      const idposte = { mail_pro: 'autre@structure.fr' }
      await ligne({ coopId: id, contact: { idposte } })

      await synchroniser(id)

      expect((await lire(id)).contact).toEqual({ idposte, coop: { email } })
    })

    it('garde le rôle coordinateur posé par le dispositif', async () => {
      const { id } = await compte()
      await ligne({ coopId: id, cnPgId: 910_000_001, isCoordinateur: true })

      await synchroniser(id)

      expect((await lire(id)).isCoordinateur).toBe(true)
    })

    it('ne crée pas de ligne pour un compte supprimé', async () => {
      const { id } = await compte(courriel('supprime'), {
        deleted: new Date(),
      })

      await synchroniser(id)

      expect(
        await prismaClient.personneMain.findUnique({ where: { coopId: id } }),
      ).toBeNull()
    })
  })

  describe('retirer un compte du registre', () => {
    const retirer = (id: string) =>
      prismaClient.$transaction((transaction) =>
        retirerDuRegistre(transaction, id),
      )

    it('supprime une ligne purement Coop', async () => {
      const { id, email } = await compte()
      const purementCoop = await ligne({
        coopId: id,
        contact: { coop: { email } },
      })

      await retirer(id)

      expect(await relire(purementCoop)).toBeNull()
    })

    it('détache une ligne qui a une autre source', async () => {
      const { id, email } = await compte()
      const idposte = { mail_pro: 'autre@structure.fr' }
      const partagee = await ligne({
        coopId: id,
        contact: { idposte, coop: { email } },
      })

      await retirer(id)

      expect(await relire(partagee)).toMatchObject({
        coopId: null,
        contact: { idposte },
      })
    })
  })
})
