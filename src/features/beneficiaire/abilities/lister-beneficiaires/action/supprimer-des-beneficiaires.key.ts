import type { ServerActionResult } from '@/libraries/nextjs'
import { keyFor } from '@/libraries/nextjs/injection'

/**
 * La suppression est injectée par clé, pas importée. Deux raisons, dans cet ordre.
 *
 * Storybook n'applique pas la transformation `'use server'` de Next : là où la
 * compilation remplace le module par une référence, il agrège le vrai module et
 * tire tout le graphe serveur derrière lui, jusqu'à la garde `server-only` qui se
 * déclenche — à raison. L'extraction des stories échouait pour cette seule raison.
 *
 * Et l'ability `lister-beneficiaires` cesse au passage de dépendre de l'ability
 * `supprimer-beneficiaires` : elle ne déclare plus qu'un besoin, pas une provenance.
 */
export type SupprimerBeneficiaires = (input: {
  ids: string[]
}) => Promise<ServerActionResult<unknown>>

export const SUPPRIMER_DES_BENEFICIAIRES_KEY = keyFor<SupprimerBeneficiaires>(
  'lister-beneficiaires.supprimer-des-beneficiaires',
)
