import '@app/web/app/setup'
import { terminerLUsurpationAction } from '@app/web/app/_actions/utilisateurs/terminer-l-usurpation.action'
import { EnvInformation } from '@app/web/app/EnvInformation'
import { Matomo } from '@app/web/app/Matomo'
import { Display, DsfrProvider } from '@app/web/configuration/dsfr'
import {
  DsfrHead,
  getHtmlAttributes,
} from '@app/web/configuration/dsfr/server-only-index'
import { TERMINER_L_USURPATION_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/terminer-l-usurpation/action/terminer-l-usurpation.key'
import Toaster from '@app/web/libraries/ui/toast/Toaster'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import type { Metadata } from 'next'
import type { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: PublicWebAppConfig.projectTitle,
  robots: PublicWebAppConfig.isMain ? 'index, follow' : 'noindex, nofollow',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
    other: {
      rel: 'icon',
      url: '/favicon/favicon.svg',
      type: 'image/svg+xml',
    },
  },
  description: PublicWebAppConfig.projectTitle,
  manifest: '/favicon/manifest.webmanifest',
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
