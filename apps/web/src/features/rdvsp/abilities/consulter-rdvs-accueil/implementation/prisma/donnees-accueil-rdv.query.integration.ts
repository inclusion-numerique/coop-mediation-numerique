import { mediateurSansActivitesUserId } from '@app/fixtures/users/mediateurSansActivites'
import { compteRdvToDomain } from '@app/web/features/rdvsp/db'
import {
  type CompteRdvUtilisable,
  estUtilisable,
} from '@app/web/features/rdvsp/domain/compte-rdv'
import { prismaClient } from '@app/web/prismaClient'
import { lireDonneesAccueilRdv } from './donnees-accueil-rdv.query'

/**
 * Les compteurs de l'accueil sont du SQL, pas du domaine : aucun scénario BDD ne
 * les traverse. C'est ce qui a permis à un rendez-vous annulé de rester compté
 * « à venir » pendant des mois — sa date ne l'était pas encore.
 *
 * Les jeux de données mêlent donc volontairement statut et chronologie, seule
 * combinaison qui distingue un filtre correct d'un filtre sur la seule date.
 */

const COMPTE = 9_960_000
const ORGANISATION = 9_961_000
const RDV = 9_962_000

const MAINTENANT = new Date('2026-08-19T12:00:00.000Z')
const jours = (n: number) =>
  new Date(MAINTENANT.getTime() + n * 24 * 60 * 60_000)

const rdv = async ({
  id,
  status,
  debut,
  compteRenduRegle = false,
}: {
  id: number
  status: 'unknown' | 'seen' | 'excused' | 'revoked' | 'noshow'
  debut: Date
  compteRenduRegle?: boolean
}) => {
  await prismaClient.rdv.create({
    data: {
      id,
      uuid: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
      rdvAccountId: COMPTE,
      organisationId: ORGANISATION,
      address: '12 rue de la Paix, 75002 Paris',
      startsAt: debut,
      endsAt: new Date(debut.getTime() + 30 * 60_000),
      durationInMin: 30,
      status,
      compteRenduRegle,
      collectif: false,
      usersCount: 0,
      urlForAgents: `https://rdv.anct.gouv.fr/admin/rdvs/${id}`,
      rawData: {},
    },
  })
}

const lire = async () => {
  const row = await prismaClient.rdvAccount.findUniqueOrThrow({
    where: { id: COMPTE },
    include: { organisations: { select: { organisationId: true } } },
  })
  const compte = compteRdvToDomain(row)

  if (!estUtilisable(compte)) {
    throw new Error('Le compte de test devrait être utilisable')
  }

  return lireDonneesAccueilRdv({
    compte: compte satisfies CompteRdvUtilisable,
    maintenant: MAINTENANT,
  })
}

const nettoyer = async () => {
  await prismaClient.rdv.deleteMany({ where: { rdvAccountId: COMPTE } })
  await prismaClient.rdvAccount.deleteMany({
    where: { OR: [{ id: COMPTE }, { userId: mediateurSansActivitesUserId }] },
  })
  await prismaClient.rdvOrganisation.deleteMany({
    where: { id: ORGANISATION },
  })
}

describe('lireDonneesAccueilRdv', () => {
  beforeAll(async () => {
    await nettoyer()
    await prismaClient.rdvOrganisation.create({
      data: { id: ORGANISATION, name: 'Organisation de test' },
    })
    await prismaClient.rdvAccount.create({
      data: {
        id: COMPTE,
        userId: mediateurSansActivitesUserId,
        accessToken: 'jeton-acces',
        refreshToken: 'jeton-rafraichissement',
        expiresAt: jours(30),
      },
    })
  })

  afterAll(nettoyer)
  afterEach(async () => {
    await prismaClient.rdv.deleteMany({ where: { rdvAccountId: COMPTE } })
  })

  describe('rendez-vous à venir', () => {
    it('ne compte pas un rendez-vous annulé dont la date est encore devant', async () => {
      await rdv({ id: RDV + 1, status: 'revoked', debut: jours(2) })
      await rdv({ id: RDV + 2, status: 'excused', debut: jours(3) })

      const { aVenir, prochain } = await lire()

      expect(aVenir).toBe(0)
      expect(prochain).toBeNull()
    })

    it('ne compte pas un rendez-vous déjà statué dont la date est encore devant', async () => {
      await rdv({ id: RDV + 3, status: 'seen', debut: jours(1) })
      await rdv({ id: RDV + 4, status: 'noshow', debut: jours(2) })

      const { aVenir } = await lire()

      expect(aVenir).toBe(0)
    })

    it('met en avant le plus proche des rendez-vous réellement à venir', async () => {
      await rdv({ id: RDV + 5, status: 'unknown', debut: jours(5) })
      await rdv({ id: RDV + 6, status: 'unknown', debut: jours(1) })
      await rdv({ id: RDV + 7, status: 'revoked', debut: jours(0.5) })

      const { aVenir, prochain } = await lire()

      expect(aVenir).toBe(2)
      // Le plus proche dans le temps est annulé : il ne doit pas être choisi.
      expect(prochain?.id).toBe(RDV + 6)
    })

    it('ignore un rendez-vous passé, même sans statut', async () => {
      await rdv({ id: RDV + 8, status: 'unknown', debut: jours(-1) })

      const { aVenir } = await lire()

      expect(aVenir).toBe(0)
    })
  })

  describe('rendez-vous à traiter', () => {
    it('compte comme passé un rendez-vous échu sans présence saisie', async () => {
      await rdv({ id: RDV + 9, status: 'unknown', debut: jours(-2) })

      const { passes, honores } = await lire()

      expect(passes).toBe(1)
      expect(honores).toBe(0)
    })

    it('compte comme honoré un rendez-vous vu dont le compte rendu reste attendu', async () => {
      await rdv({ id: RDV + 10, status: 'seen', debut: jours(-2) })

      const { passes, honores } = await lire()

      expect(passes).toBe(0)
      expect(honores).toBe(1)
    })

    it('cesse de réclamer un compte rendu une fois celui-ci réglé', async () => {
      await rdv({
        id: RDV + 11,
        status: 'seen',
        debut: jours(-2),
        compteRenduRegle: true,
      })

      const { honores, dernier } = await lire()

      expect(honores).toBe(0)
      expect(dernier).toBeNull()
    })

    it('ne réclame rien pour un rendez-vous annulé', async () => {
      await rdv({ id: RDV + 12, status: 'revoked', debut: jours(-2) })

      const { passes, honores } = await lire()

      expect(passes).toBe(0)
      expect(honores).toBe(0)
    })
  })
})
