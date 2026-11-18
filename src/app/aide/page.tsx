import { redirect } from 'next/navigation'
import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'

export const generateMetadata = () => {
  redirect(PublicWebAppConfig.centreAideUrl)
}

export default () => null
