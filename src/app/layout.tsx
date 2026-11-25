import '@codegouvfr/react-dsfr/assets/dsfr_plus_icons.scss'
import '@codegouvfr/react-dsfr/dsfr/utility/colors/colors.min.css'
import '@/styles/app.css'
import type { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import type { PropsWithChildren } from 'react'
import { terminerLUsurpationAction } from '@/app/_actions/utilisateurs/terminer-l-usurpation.action'
import {
  Display,
  DsfrHead,
  DsfrProvider,
  getHtmlAttributes,
} from '@/configuration/dsfr'
import { estMain, projectTitle } from '@/configuration/projet'
import { Matomo } from '@/configuration/telemetry'
import { EnvInformation } from '@/features/navigation/ui/slots/EnvInformation.slot'
import { TERMINER_L_USURPATION_ACTION_KEY } from '@/features/utilisateurs/abilities/terminer-l-usurpation/action/terminer-l-usurpation.key'
import { ClientBinder } from '@/libraries/nextjs/injection'
import { Toaster } from '@/libraries/ui/toast'

export const metadata: Metadata = {
  title: projectTitle,
  robots: estMain ? 'index, follow' : 'noindex, nofollow',
  description: projectTitle,
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
          <NuqsAdapter>{children}</NuqsAdapter>
        </ClientBinder>
        <Toaster />
        <Display />
      </DsfrProvider>
    </body>
  </html>
)

export default RootLayout
