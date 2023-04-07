import '@stack/web/app/app.css'
import { PropsWithChildren } from 'react'
import { PublicWebAppConfig, ServerWebAppConfig } from '@stack/web/webAppConfig'
import { Metadata } from 'next'
import { Dsfr } from '@stack/web/app/Dsfr'
import { Matomo } from '@stack/web/app/Matomo'
import { PreloadResources } from '@stack/web/app/PreloadResources'
import { EnvInformation } from '@stack/web/app/EnvInformation'
import { getServerBaseUrl } from '@stack/web/utils/baseUrl'

export const generateMetadata = (): Metadata => {
  const mainOrPreviewMeta: Metadata = ServerWebAppConfig.isMain
    ? {}
    : { robots: 'noindex' }

  return {
    metadataBase: new URL(getServerBaseUrl()),
    title: PublicWebAppConfig.projectTitle,
    themeColor: '#000091',
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
}

const RootLayout = ({ children }: PropsWithChildren) => {
  // Do we want to disable SSG for CSFR on this website ?
  // const nonce = headers().get('x-sde-script-nonce') ?? undefined
  const nonce = undefined
  return (
    <html lang="fr" data-fr-theme="light" data-fr-scheme="light">
      <body>
        <PreloadResources />
        <Dsfr nonce={nonce} />
        <Matomo nonce={nonce} />
        <EnvInformation />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
