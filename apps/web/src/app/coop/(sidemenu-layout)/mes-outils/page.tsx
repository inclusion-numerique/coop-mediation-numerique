import { metadataTitle } from '@app/web/app/metadataTitle'
import type { Metadata } from 'next'
import { MesOutils } from './MesOutils'

export const metadata: Metadata = {
  title: metadataTitle('Mes outils'),
}

const Page = () => <MesOutils />

export default Page
