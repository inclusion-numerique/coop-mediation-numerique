import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { key } from '@app/web/libs/injection/client'
import type { z } from 'zod'
import type { StatutRdvMisAJour } from '../domain/mettre-a-jour-statut-rdv'
import type { MettreAJourStatutRdvValidation } from './mettre-a-jour-statut-rdv.validation'

export const METTRE_A_JOUR_STATUT_RDV_ACTION_KEY = key<
  (
    input: z.input<typeof MettreAJourStatutRdvValidation>,
  ) => Promise<ServerActionResult<StatutRdvMisAJour, string>>
>('mettre-a-jour-statut-rdv.action')
