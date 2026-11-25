import { describe, expect, it } from 'vitest'
import type { UtilisateurDeLaSessionRow } from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.select'
import { serializePrismaSessionUser } from './serialize-prisma-session-user.transfer'

const CREATION = new Date('2026-01-10T08:00:00.000Z')
const MODIFICATION = new Date('2026-02-20T10:30:00.000Z')

const LIGNE: UtilisateurDeLaSessionRow = {
  id: 'utilisateur-1',
  email: 'jeanne.dupont@example.fr',
  phone: null,
  siret: null,
  firstName: 'Jeanne',
  lastName: 'Dupont',
  name: 'Jeanne Dupont',
  emailVerified: null,
  created: CREATION,
  updated: MODIFICATION,
  role: 'User',
  isFixture: false,
  profilInscription: 'Mediateur',
  acceptationCgu: null,
  hasSeenOnboarding: null,
  structureEmployeuseRenseignee: null,
  lieuxActiviteRenseignes: null,
  inscriptionValidee: null,
  timezone: 'Europe/Paris',
  lastSeen: MODIFICATION,
  personneMain: null,
  mediateur: null,
  coordinateur: null,
  rdvAccount: null,
}

const COMPTE_RDV: NonNullable<UtilisateurDeLaSessionRow['rdvAccount']> = {
  id: 7,
  created: CREATION,
  updated: MODIFICATION,
  lastSynced: null,
  accessToken: 'acces',
  refreshToken: 'rafraichissement',
  deleted: null,
  error: null,
  syncFrom: null,
  includeRdvsInActivitesList: true,
  organisations: [
    { organisation: { id: 3, name: 'France services', email: null } },
  ],
  invalidWebhookOrganisationIds: [],
}

describe('serializePrismaSessionUser', () => {
  it('traduit un utilisateur sans rattachement en utilisateur de la session', () => {
    expect(serializePrismaSessionUser(LIGNE)).toEqual({
      id: 'utilisateur-1',
      firstName: 'Jeanne',
      lastName: 'Dupont',
      name: 'Jeanne Dupont',
      email: 'jeanne.dupont@example.fr',
      phone: null,
      siret: null,
      role: 'User',
      isFixture: false,
      profilInscription: 'Mediateur',
      acceptationCgu: null,
      timezone: 'Europe/Paris',
      mediateur: null,
      emplois: [],
      isConseillerNumerique: false,
      coordinateur: null,
      emailVerified: null,
      created: '2026-01-10T08:00:00.000Z',
      updated: '2026-02-20T10:30:00.000Z',
      hasSeenOnboarding: null,
      inscriptionValidee: null,
      structureEmployeuseRenseignee: null,
      lieuxActiviteRenseignes: null,
      usurper: null,
      rdvAccount: null,
    })
  })

  it('garde le rôle administrateur', () => {
    expect(serializePrismaSessionUser({ ...LIGNE, role: 'Admin' }).role).toBe(
      'Admin',
    )
  })

  it('ramène le rôle support à un utilisateur ordinaire', () => {
    expect(serializePrismaSessionUser({ ...LIGNE, role: 'Support' }).role).toBe(
      'User',
    )
  })

  it('écrit les étapes de l’inscription en dates ISO', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        emailVerified: CREATION,
        hasSeenOnboarding: CREATION,
        inscriptionValidee: MODIFICATION,
        structureEmployeuseRenseignee: CREATION,
        lieuxActiviteRenseignes: MODIFICATION,
      }),
    ).toMatchObject({
      emailVerified: '2026-01-10T08:00:00.000Z',
      hasSeenOnboarding: '2026-01-10T08:00:00.000Z',
      inscriptionValidee: '2026-02-20T10:30:00.000Z',
      structureEmployeuseRenseignee: '2026-01-10T08:00:00.000Z',
      lieuxActiviteRenseignes: '2026-02-20T10:30:00.000Z',
    })
  })

  it('traduit l’employeuse actuelle en emploi de la session', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        personneMain: {
          employeuseActuelle: {
            structureAdministrativeId: 12,
            nom: 'Mairie de Lyon',
            codeInsee: '69123',
          },
          conseillerNumeriqueEnPoste: null,
        },
      }).emplois,
    ).toEqual([
      { id: '12', structure: { nom: 'Mairie de Lyon', codeInsee: '69123' } },
    ])
  })

  it('ne donne aucun emploi à une personne sans employeuse actuelle', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        personneMain: {
          employeuseActuelle: null,
          conseillerNumeriqueEnPoste: null,
        },
      }).emplois,
    ).toEqual([])
  })

  it('reconnaît un conseiller numérique à son poste actif', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        personneMain: {
          employeuseActuelle: null,
          conseillerNumeriqueEnPoste: { personneId: 5 },
        },
      }).isConseillerNumerique,
    ).toBe(true)
  })

  it('sépare les membres actuels et anciens de l’équipe du coordinateur', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        coordinateur: {
          id: 'coordinateur-1',
          mediateursCoordonnes: [
            { mediateurId: 'actuel', suppression: null },
            { mediateurId: 'ancien', suppression: MODIFICATION },
          ],
        },
      }).coordinateur,
    ).toEqual({
      id: 'coordinateur-1',
      mediateursCoordonnes: [{ mediateurId: 'actuel' }],
      ancienMediateursCoordonnes: [{ mediateurId: 'ancien' }],
    })
  })

  it('transmet l’usurpateur de la session', () => {
    expect(
      serializePrismaSessionUser(LIGNE, { id: 'administrateur-1' }).usurper,
    ).toEqual({ id: 'administrateur-1' })
  })

  it('traduit le compte RDV Service Public sans en exposer les jetons', () => {
    expect(
      serializePrismaSessionUser({ ...LIGNE, rdvAccount: COMPTE_RDV })
        .rdvAccount,
    ).toEqual({
      id: 7,
      hasOauthTokens: true,
      error: null,
      deconnexion: null,
      jetonDAcces: true,
      includeRdvsInActivitesList: true,
      created: '2026-01-10T08:00:00.000Z',
      updated: '2026-02-20T10:30:00.000Z',
      syncFrom: null,
      lastSynced: null,
      organisations: [{ id: 3, name: 'France services', email: null }],
      invalidWebhookOrganisationIds: [],
    })
  })

  it('ne reconnaît pas de jetons OAuth sans jeton de rafraîchissement', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        rdvAccount: { ...COMPTE_RDV, refreshToken: null },
      }).rdvAccount?.hasOauthTokens,
    ).toBe(false)
  })

  it('ne reconnaît pas de jeton d’accès fait d’espaces', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        rdvAccount: { ...COMPTE_RDV, accessToken: '   ' },
      }).rdvAccount?.jetonDAcces,
    ).toBe(false)
  })

  it('écrit la déconnexion et les synchronisations du compte RDV en dates ISO', () => {
    expect(
      serializePrismaSessionUser({
        ...LIGNE,
        rdvAccount: {
          ...COMPTE_RDV,
          deleted: MODIFICATION,
          syncFrom: CREATION,
          lastSynced: MODIFICATION,
          error: 'invalid_grant',
        },
      }).rdvAccount,
    ).toMatchObject({
      deconnexion: '2026-02-20T10:30:00.000Z',
      syncFrom: '2026-01-10T08:00:00.000Z',
      lastSynced: '2026-02-20T10:30:00.000Z',
      error: 'invalid_grant',
    })
  })
})
