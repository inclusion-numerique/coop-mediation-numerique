import { redirect } from 'next/navigation'
import { PublicWebAppConfig } from '@/PublicWebAppConfig'

export const generateMetadata = () => {
  redirect(PublicWebAppConfig.centreAideUrl)
}

export default () => null
