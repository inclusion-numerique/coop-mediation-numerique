import { redirect } from 'next/navigation'
import { centreAideUrl } from '@/configuration/projet'

export const generateMetadata = () => {
  redirect(centreAideUrl)
}

export default () => null
