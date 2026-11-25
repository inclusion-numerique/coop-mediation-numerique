import type { EmailConfig } from 'next-auth/providers/email'
import { createTransport } from 'nodemailer'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { contactEmail, projectTitle } from '@/configuration/projet'
import { connexionParCourriel } from '@/features/authentification/implementations/email/connexion-par-courriel.email'
import { compileMjml } from '@/libraries/emails/rendu'

const debugMagicLink = environnementServeur.NODE_ENV === 'development'

export const sendVerificationRequest: EmailConfig['sendVerificationRequest'] =
  async ({ url, provider, identifier }) => {
    // For quicker dev UX, display url in console in dev environment
    if (debugMagicLink) {
      // biome-ignore lint/suspicious/noConsole: needed for dev / debug
      console.log(`[AUTH] Magic link for ${identifier}: ${url}`)
    }

    const transport = createTransport(provider.server as string)
    const result = await transport.sendMail({
      to: identifier,
      from: provider.from,
      replyTo: contactEmail,
      subject: `Connexion à ${projectTitle}`,
      text: connexionParCourriel.text({ url }),
      html: await compileMjml(connexionParCourriel.mjml({ url })),
    })
    const failed = [...result.rejected].filter(Boolean)
    if (failed.length > 0) {
      throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
    }
  }
