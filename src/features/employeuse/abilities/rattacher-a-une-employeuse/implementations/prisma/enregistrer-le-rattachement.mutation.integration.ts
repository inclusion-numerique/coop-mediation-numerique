import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { prismaClient } from '@/configuration/prisma'
import { SireneIndisponible } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/errors'
import { MotifSansRattachement } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/motif-sans-rattachement'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-a-une-employeuse'
import { IdentiteEmployeuse } from '@/features/employeuse/domain/identite-employeuse'
import { UtilisateurId } from '@/features/employeuse/domain/utilisateur-id'
import { Siret } from '@/libraries/insee'
import { failure, success } from '@/libraries/result'
import { statutDeConseillerNumerique } from './conseiller-numerique-en-poste.query'
import { creerLEmployeuse } from './creer-l-employeuse.mutation'
import { lireLesEmployeusesDuSiret } from './employeuses-du-siret.query'
import { enregistrerLeRattachement } from './enregistrer-le-rattachement.mutation'

const MEDIATEUR = '93b7d259-61b0-4069-ae42-db887984777f'
const CONSEILLER = '09d6e0af-56e7-43b8-a649-b7e9d3c70c51'
const NOS_UTILISATEURS = [MEDIATEUR, CONSEILLER]

const PROCONNECT_SIRET = '11111111111111'
const OTHER_SIRET = '22222222222222'

const rattacher = rattacherAUneEmployeuse({
  lireLeStatutDeConseillerNumerique: statutDeConseillerNumerique,
  lireLesEmployeusesDuSiret,
  creerLEmployeuse: creerLEmployeuse({ geocoder: async () => null }),
  enregistrerLeRattachement: enregistrerLeRattachement({
    garantirLaPersonne: ({ coopUserId, email }, transaction) =>
      transaction.personneMain.upsert({
        where: { coopId: coopUserId },
        create: { coopId: coopUserId, contact: { coop: { email } } },
        update: {},
        select: { id: true },
      }),
    synchroniserLaPersonne: async () => undefined,
  }),
  lireLEtablissement: async (siret) =>
    siret === PROCONNECT_SIRET
      ? success({
          _tag: 'Ouvert',
          identite: IdentiteEmployeuse({
            siret,
            denomination: 'Structure ProConnect',
            adresse: {
              voie: '1 rue du Test',
              commune: 'Paris',
              codePostal: '75001',
              codeInsee: '75101',
            },
          }),
        })
      : failure(SireneIndisponible()),
})

const importer = ({
  userId,
  siret,
}: {
  readonly userId: string
  readonly siret: Siret | null
}) =>
  rattacher({
    userId: UtilisateurId(userId),
    source: { _tag: 'ProConnect', siret },
  })

const employeusesActivesDe = async (userId: string) =>
  (
    await prismaClient.personneAffectationEmploiMain.findMany({
      where: { personne: { coopId: userId }, estActive: true },
      select: { structureAdministrativeId: true },
    })
  ).map(({ structureAdministrativeId }) => structureAdministrativeId)

describe('rattacher une employeuse depuis ProConnect', () => {
  const state = { proconnectMainId: 0, otherMainId: 0 }

  beforeAll(async () => {
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrative: {
          siret: { in: [PROCONNECT_SIRET, OTHER_SIRET] },
        },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { siret: { in: [PROCONNECT_SIRET, OTHER_SIRET] } },
    })

    const proconnect = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: PROCONNECT_SIRET,
        denominationSirene: 'Structure ProConnect',
        denominationAntenne: 'Structure ProConnect',
      },
      select: { id: true },
    })
    const other = await prismaClient.structureAdministrativeMain.create({
      data: {
        siret: OTHER_SIRET,
        denominationSirene: 'Autre structure',
        denominationAntenne: 'Autre structure',
      },
      select: { id: true },
    })
    state.proconnectMainId = proconnect.id
    state.otherMainId = other.id

    await prismaClient.user.createMany({
      data: NOS_UTILISATEURS.map((id) => ({
        id,
        email: `proconnect-${id}@integration.test`,
      })),
      skipDuplicates: true,
    })
  })

  const nettoyerPersonnesDeTest = async () => {
    const deNosPersonnes = { personne: { coopId: { in: NOS_UTILISATEURS } } }
    await prismaClient.contratMain.deleteMany({ where: deNosPersonnes })
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: deNosPersonnes,
    })
    await prismaClient.personneMain.deleteMany({
      where: { coopId: { in: NOS_UTILISATEURS } },
    })
  }

  afterAll(async () => {
    await nettoyerPersonnesDeTest()
    await prismaClient.personneAffectationEmploiMain.deleteMany({
      where: {
        structureAdministrativeId: {
          in: [state.proconnectMainId, state.otherMainId],
        },
      },
    })
    await prismaClient.structureAdministrativeMain.deleteMany({
      where: { id: { in: [state.proconnectMainId, state.otherMainId] } },
    })
    await prismaClient.user.deleteMany({
      where: { id: { in: NOS_UTILISATEURS } },
    })
  })

  beforeEach(async () => {
    await nettoyerPersonnesDeTest()
  })

  test('non-CN + SIRET : rattache à l’employeuse du SIRET fourni', async () => {
    const result = await importer({
      userId: MEDIATEUR,
      siret: Siret(PROCONNECT_SIRET),
    })

    expect(result).toEqual(
      success({
        _tag: 'Rattachee',
        userId: MEDIATEUR,
        employeuseId: state.proconnectMainId,
        employeuseCreee: null,
      }),
    )
    expect(await employeusesActivesDe(MEDIATEUR)).toEqual([
      state.proconnectMainId,
    ])
  })

  test('conseiller numerique : no-op, aucun rattachement au SIRET fourni', async () => {
    await prismaClient.personneMain.create({
      data: {
        coopId: CONSEILLER,
        affectationsEmploi: {
          create: {
            structureAdministrativeId: state.otherMainId,
            source: 'idposte',
            estActive: true,
          },
        },
      },
    })

    const result = await importer({
      userId: CONSEILLER,
      siret: Siret(PROCONNECT_SIRET),
    })

    expect(result).toEqual(
      success({
        _tag: 'SansRattachement',
        motif: MotifSansRattachement('ConseillerNumeriqueEnPoste'),
      }),
    )
    expect(await employeusesActivesDe(CONSEILLER)).not.toContain(
      state.proconnectMainId,
    )
  })

  test('aucun SIRET fourni : no-op', async () => {
    const result = await importer({
      userId: MEDIATEUR,
      siret: null,
    })

    expect(result).toEqual(
      success({
        _tag: 'SansRattachement',
        motif: MotifSansRattachement('SiretAbsent'),
      }),
    )
    expect(await employeusesActivesDe(MEDIATEUR)).toEqual([])
  })
})
