import type { UtilisateurDeLaSession } from '@/features/authentification/domain/utilisateur-de-la-session'
import type {
  PrismaSessionUsupper,
  UtilisateurDeLaSessionRow,
} from '@/features/authentification/implementations/prisma/utilisateur-de-la-session.select'
import { splitMediateursCoordonnes } from './coordination-de-la-session.transfer'

const emploisDeLaSession = (
  personneMain: UtilisateurDeLaSessionRow['personneMain'],
): UtilisateurDeLaSession['emplois'] =>
  personneMain?.employeuseActuelle
    ? [
        {
          id: String(personneMain.employeuseActuelle.structureAdministrativeId),
          structure: {
            nom: personneMain.employeuseActuelle.nom,
            codeInsee: personneMain.employeuseActuelle.codeInsee,
          },
        },
      ]
    : []

export const serializePrismaSessionUser = (
  prismaSessionUser: UtilisateurDeLaSessionRow,
  usurper?: PrismaSessionUsupper,
): UtilisateurDeLaSession => ({
  id: prismaSessionUser.id,
  firstName: prismaSessionUser.firstName,
  lastName: prismaSessionUser.lastName,
  name: prismaSessionUser.name,
  email: prismaSessionUser.email,
  phone: prismaSessionUser.phone,
  siret: prismaSessionUser.siret,
  role: prismaSessionUser.role === 'Admin' ? 'Admin' : 'User',
  isFixture: prismaSessionUser.isFixture,
  profilInscription: prismaSessionUser.profilInscription,
  acceptationCgu: prismaSessionUser.acceptationCgu,
  timezone: prismaSessionUser.timezone,
  mediateur: prismaSessionUser.mediateur,
  emplois: emploisDeLaSession(prismaSessionUser.personneMain),
  isConseillerNumerique:
    prismaSessionUser.personneMain?.conseillerNumeriqueEnPoste != null,
  coordinateur: splitMediateursCoordonnes(prismaSessionUser.coordinateur),
  emailVerified: prismaSessionUser.emailVerified?.toISOString() ?? null,
  created: prismaSessionUser.created.toISOString(),
  updated: prismaSessionUser.updated.toISOString(),
  hasSeenOnboarding: prismaSessionUser.hasSeenOnboarding?.toISOString() ?? null,
  inscriptionValidee:
    prismaSessionUser.inscriptionValidee?.toISOString() ?? null,
  structureEmployeuseRenseignee:
    prismaSessionUser.structureEmployeuseRenseignee?.toISOString() ?? null,
  lieuxActiviteRenseignes:
    prismaSessionUser.lieuxActiviteRenseignes?.toISOString() ?? null,
  usurper: usurper ?? null,
  rdvAccount: prismaSessionUser.rdvAccount
    ? {
        id: prismaSessionUser.rdvAccount.id,
        hasOauthTokens: !!(
          prismaSessionUser.rdvAccount.accessToken &&
          prismaSessionUser.rdvAccount.refreshToken
        ),
        error: prismaSessionUser.rdvAccount.error ?? null,
        deconnexion:
          prismaSessionUser.rdvAccount.deleted?.toISOString() ?? null,
        jetonDAcces:
          (prismaSessionUser.rdvAccount.accessToken ?? '').trim() !== '',
        includeRdvsInActivitesList:
          prismaSessionUser.rdvAccount.includeRdvsInActivitesList,
        created: prismaSessionUser.rdvAccount.created.toISOString(),
        updated: prismaSessionUser.rdvAccount.updated.toISOString(),
        syncFrom: prismaSessionUser.rdvAccount.syncFrom?.toISOString() ?? null,
        lastSynced:
          prismaSessionUser.rdvAccount.lastSynced?.toISOString() ?? null,
        organisations: prismaSessionUser.rdvAccount.organisations.map(
          ({ organisation }) => organisation,
        ),
        invalidWebhookOrganisationIds:
          prismaSessionUser.rdvAccount.invalidWebhookOrganisationIds ?? [],
      }
    : null,
})
