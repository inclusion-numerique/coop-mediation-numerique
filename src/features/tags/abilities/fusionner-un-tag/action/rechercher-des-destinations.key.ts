import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'
import type { TypeDePortee } from '../../../domain'

export const RECHERCHER_DES_DESTINATIONS_ACTION_KEY = keyFor<
  (input: {
    readonly sourceId: string
    readonly recherche: string
  }) => Promise<ServerActionResult<readonly DestinationAffichee[], string>>
>('rechercher-des-destinations.action')

export type DestinationAffichee = {
  readonly tag: {
    readonly id: string
    readonly nom: string
    readonly description: string | null
    readonly portee: TypeDePortee
    readonly equipe: {
      readonly numero: number
      readonly coordonneePar: string
    } | null
    readonly badge: {
      readonly libelle: string
      readonly classe: string
      readonly infobulle: string | null
    }
  }
  readonly accompagnements: number
}
