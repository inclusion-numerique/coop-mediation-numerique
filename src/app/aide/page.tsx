import { redirect } from 'next/navigation'
import { centreAideUrl } from '@/configuration/projet/config'

export const generateMetadata = () => {
  redirect(centreAideUrl)
}

export default () => null
