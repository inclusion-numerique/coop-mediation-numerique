import { keyFor } from '@app/web/libs/injection/client'
import type { CommuneDuCra } from './commune-du-cra'

export const RECHERCHER_DES_COMMUNES_DU_CRA_KEY = keyFor<
  (texte: string) => Promise<readonly CommuneDuCra[]>
>('activites.rechercher-des-communes')
