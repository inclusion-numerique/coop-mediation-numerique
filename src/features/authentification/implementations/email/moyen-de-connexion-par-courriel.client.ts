import type { CallbacksOptions } from 'next-auth'
import Email from 'next-auth/providers/email'
import {
  branche,
  estPreview,
  previewBranchAuthFallbacks,
} from '@/configuration/projet'
import { expediteur, serveurSmtp } from '@/configuration/smtp'
import { signaler } from '@/configuration/telemetry/serveur'
import { sendVerificationRequest } from './send-verification-request.mutation'
import { lireLUtilisateurALaConnexion } from './utilisateur-a-la-connexion.transfer'

const affichage: {
  readonly via: 'courriel'
  readonly branchePreview: string | null
} = { via: 'courriel', branchePreview: estPreview() ? branche() : null }

export const moyenDeConnexionParCourriel = {
  fournisseurs: () => [
    Email({
      server: serveurSmtp,
      from: expediteur,
      sendVerificationRequest,
    }),
  ],
  aLaConnexion:
    ({
      garantirLeRoleCoordinateur,
      enregistrerLesDonneesDeLUtilisateur,
      enregistrerLaDerniereConnexion,
    }: {
      garantirLeRoleCoordinateur: (userId: string) => Promise<unknown>
      enregistrerLesDonneesDeLUtilisateur: (donnees: {
        userId: string
        firstName: string
        lastName: string
        phone: string | null
        siret: string | null
      }) => Promise<void>
      enregistrerLaDerniereConnexion: (connexion: {
        userId: string
      }) => Promise<void>
    }): CallbacksOptions['signIn'] =>
    async (params) => {
      if (params.email?.verificationRequest) {
        return true
      }

      if (params.account?.provider !== 'email' || !params.user.id) {
        return true
      }

      const lu = lireLUtilisateurALaConnexion(params.user)
      if (!lu.success) {
        signaler(lu.error)
        return true
      }

      const user = lu.data
      const [partieLocale = ''] = user.email.split('@')
      const [prenomDeLAdresse, nomDeLAdresse] = partieLocale.split('.')
      const fallbackFirstName = prenomDeLAdresse || 'User'
      const fallbackLastName = nomDeLAdresse || '-'
      const fallbackSiret = previewBranchAuthFallbacks.anctSiret

      if (!user.firstName || !user.lastName || !user.siret) {
        enregistrerLesDonneesDeLUtilisateur({
          userId: user.id,
          firstName: user.firstName || fallbackFirstName,
          lastName: user.lastName || fallbackLastName,
          phone: user.phone || null,
          siret: user.siret || fallbackSiret,
        }).catch((error) => {
          signaler(error)
        })
      }

      garantirLeRoleCoordinateur(user.id).catch((error: unknown) => {
        signaler(error)
      })

      enregistrerLaDerniereConnexion({ userId: params.user.id }).catch(
        (error) => {
          signaler(error)
        },
      )
      return true
    },
  affichage,
}
