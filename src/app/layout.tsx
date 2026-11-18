import '@/app/setup'
import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'
import { terminerLUsurpationAction } from '@/app/_actions/utilisateurs/terminer-l-usurpation.action'
import { EnvInformation } from '@/app/EnvInformation'
import { Matomo } from '@/app/Matomo'
import { Display, DsfrProvider } from '@/configuration/dsfr'
import {
  DsfrHead,
  getHtmlAttributes,
} from '@/configuration/dsfr/server-only-index'
import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { TERMINER_L_USURPATION_ACTION_KEY } from '@/features/utilisateurs/abilities/terminer-l-usurpation/action/terminer-l-usurpation.key'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'
import Toaster from '@/libraries/ui/toast/Toaster'

export const metadata: Metadata = {
  title: PublicWebAppConfig.projectTitle,
  robots: PublicWebAppConfig.isMain ? 'index, follow' : 'noindex, nofollow',
  description: PublicWebAppConfig.projectTitle,
}

const RootLayout = ({ children }: PropsWithChildren) => (
  <html {...getHtmlAttributes({ lang: 'fr' })}>
    <head>
      <link
        rel="preload"
        href="/images/spinner.svg"
        as="image"
        type="image/svg+xml"
      />
    </head>
    <body>
      <DsfrHead
        preloadFonts={['Marianne-Regular', 'Marianne-Medium', 'Marianne-Bold']}
        doDisableFavicon
      />
      <DsfrProvider lang="fr">
        <Matomo />
        <EnvInformation />
        <ClientBinder
          bind={TERMINER_L_USURPATION_ACTION_KEY}
          to={terminerLUsurpationAction}
        >
          {children}
        </ClientBinder>
        <Toaster />
        <Display />
      </DsfrProvider>
    </body>
  </html>
)

export default RootLayout
