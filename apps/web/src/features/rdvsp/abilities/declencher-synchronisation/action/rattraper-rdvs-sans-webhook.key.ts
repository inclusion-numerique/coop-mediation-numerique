import type { ServerActionResult } from '@app/web/libraries/nextjs/action/result'
import { key } from '@app/web/libs/injection/client'
import type { ResultatDeclenchement } from '../domain/declencher-synchronisation'

export const RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY = key<
  () => Promise<ServerActionResult<ResultatDeclenchement, string>>
>('rattraper-rdvs-sans-webhook.action')
