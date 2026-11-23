import type { z } from 'zod'
import type { ServerActionResult } from '@/libraries/nextjs/action/result'
import { keyFor } from '@/libraries/nextjs/injection/client'
import type { StatutRdvMisAJour } from '../domain/mettre-a-jour-statut-rdv'
import type { MettreAJourStatutRdvValidation } from './mettre-a-jour-statut-rdv.validation'

export const METTRE_A_JOUR_STATUT_RDV_ACTION_KEY = keyFor<
  (
    input: z.input<typeof MettreAJourStatutRdvValidation>,
  ) => Promise<ServerActionResult<StatutRdvMisAJour, string>>
>('mettre-a-jour-statut-rdv.action')
