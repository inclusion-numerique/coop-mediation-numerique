import { sessionUserSelect } from '@app/web/auth/getSessionUserFromSessionToken'
import { serializePrismaSessionUser } from '@app/web/auth/serializePrismaSessionUser'
import { conseillerNumeriqueWhere } from '@app/web/features/employeuse/server'
import {
  dispositifDepuisMain,
  profilDepuisDispositif,
} from '@app/web/features/inscription/use-cases/initialize/dispositifDepuisMain'
import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import { garantirCoordinateurDuDispositif } from './garantirCoordinateurDuDispositif'

/**
 * Ce que la synchro nocturne faisait, et qui doit tenir sans elle.
 *
 * Elle appelait l'API Dataspace une fois par compte pour recopier dans `coop.users` ce que `main`
 * portait déjà, puis produisait deux effets. Ce fichier vérifie, sur la vraie base, que chaque point
 * a bien son remplaçant — et surtout que les remplaçants lisent le dispositif au lieu d'un drapeau.
 *
 * Les scénarios construisent leur propre état plutôt que de s'appuyer sur les fixtures : celles-ci
 * portent déjà des affectations, ce qui rendrait indécidable le cas « hors dispositif ».
 */
describe('le dispositif conseiller numérique sans synchro', () => {
  const conseiller = v4()
  const horsDispositif = v4()
  const coordinateur = v4()

  const tous = [conseiller, horsDispositif, coordinateur]
  const state = { employeuseId: 0 }

  const seedUtilisateur = (id: string) =>
    prismaClient.user.create({
      data: { id, email: `dispositif+${id}@test.gouv.fr`, isFixture: true },
      select: { id: true },
    })

  const seedPersonne = (coopId: string, estCoordinateur: boolean) =>
    prismaClient.personneMain.create({
      data: { coopId, isCoordinateur: estCoordinateur },
      select: { id: true },
    })

  const seedAffectation = (personneId: number, source: string) =>
    prismaClient.personneAffectationEmploiMain.create({
      data: {
        personneId,
        structureAdministrativeId: state.employeuseId,
        source,
        estActive: true,
      },
    })

  beforeAll(async () => {
    const employeuse = await prismaClient.structureAdministrativeMain.create({
      data: { denominationAntenne: `Dispositif ${v4()}` },
      select: { id: true },
    })
    state.employeuseId = employeuse.id

    await Promise.all(tous.map((id) => seedUtilisateur(id)))

    const personneConseiller = await seedPersonne(conseiller, false)
    await seedAffectation(personneConseiller.id, 'idposte')

    // Déclaré coop seulement : connu de `main`, mais hors dispositif.
    const personneHors = await seedPersonne(horsDispositif, false)
    await seedAffectation(personneHors.id, 'coop')

    const personneCoordinateur = await seedPersonne(coordinateur, true)
    await seedAffectation(personneCoordinateur.id, 'idposte')
  })

  afterAll(async () => {
    await prismaClient.mediateur.deleteMany({ where: { userId: { in: tous } } })
    await prismaClient.coordinateur.deleteMany({
      where: { userId: { in: tous } },
    })
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

  const sessionDe = async (userId: string) =>
    serializePrismaSessionUser(
      await prismaClient.user.findUniqueOrThrow({
        where: { id: userId },
        select: sessionUserSelect,
      }),
    )

  // Remplace : l'écriture de `coop.users.is_conseiller_numerique`.
  describe('le drapeau de session', () => {
    it('est vrai pour une affectation idposte active', async () => {
      expect((await sessionDe(conseiller)).isConseillerNumerique).toBe(true)
    })

    it('est faux pour une affectation coop seule', async () => {
      expect((await sessionDe(horsDispositif)).isConseillerNumerique).toBe(
        false,
      )
    })
  })

  // Remplace : `getProfileFromDataspace` et le « trouvé / pas trouvé » de l'API.
  describe('le profil d’inscription', () => {
    it('déduit conseiller numérique', async () => {
      const dispositif = await dispositifDepuisMain(conseiller)

      expect(dispositif).toEqual({
        connue: true,
        estConseillerNumerique: true,
        estCoordinateur: false,
      })
      expect(profilDepuisDispositif(dispositif)).toBe('ConseillerNumerique')
    })

    it('déduit coordinateur conseiller numérique', async () => {
      expect(
        profilDepuisDispositif(await dispositifDepuisMain(coordinateur)),
      ).toBe('CoordinateurConseillerNumerique')
    })

    // Une personne absente de `main` remplace exactement le 404 de l'API.
    it('ne déduit aucun profil d’une personne inconnue de main', async () => {
      const dispositif = await dispositifDepuisMain(v4())

      expect(dispositif.connue).toBe(false)
      expect(profilDepuisDispositif(dispositif)).toBeNull()
    })
  })

  // Remplace : `upsertCoordinateur`, le seul effet que la dérivation ne peut pas produire.
  describe('la garantie du rôle coordinateur', () => {
    it('crée la ligne coop, puis ne la recrée pas', async () => {
      expect(await garantirCoordinateurDuDispositif(coordinateur)).toEqual({
        cree: true,
      })
      expect(await garantirCoordinateurDuDispositif(coordinateur)).toEqual({
        cree: false,
      })
    })

    it('ne crée rien pour qui ne coordonne pas dans le dispositif', async () => {
      expect(await garantirCoordinateurDuDispositif(conseiller)).toEqual({
        cree: false,
      })
      expect(await garantirCoordinateurDuDispositif(horsDispositif)).toEqual({
        cree: false,
      })
    })
  })

  // Remplace : les `where` sur la colonne.
  it('le filtre range chaque compte d’un seul côté', async () => {
    const dans = await prismaClient.user.findMany({
      where: { id: { in: tous }, ...conseillerNumeriqueWhere(true) },
      select: { id: true },
    })
    const hors = await prismaClient.user.findMany({
      where: { id: { in: tous }, ...conseillerNumeriqueWhere(false) },
      select: { id: true },
    })

    expect([...dans, ...hors].map(({ id }) => id).toSorted()).toEqual(
      tous.toSorted(),
    )
    expect(dans.map(({ id }) => id).toSorted()).toEqual(
      [conseiller, coordinateur].toSorted(),
    )
  })

  // L'import automatique des lieux n'a PAS de remplaçant : `main.personne_affectations_lieu` est une
  // vue construite sur `coop.mediateurs_en_activite`, et la table historique ne contient que des
  // affectations de source `coop`. Aucune affectation lieu ne vient du dispositif — ce que ce test
  // épingle, pour qu'une future « source idposte » ne passe pas inaperçue.
  it('ne trouve aucune affectation lieu d’origine idposte dans main', async () => {
    const [{ total }] = await prismaClient.$queryRaw<{ total: bigint }[]>`
      SELECT count(*) AS total
      FROM main.personne_affectations_lieu_legacy
      WHERE source <> 'coop'`

    expect(Number(total)).toBe(0)
  })
})
