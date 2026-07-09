'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { executeJob } from '@app/web/jobs/jobExecutors'
import { actionBuilder } from '@app/web/libraries/nextjs'

export const normaliserBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  // Le job est dry-run par défaut : l'action admin applique réellement.
  .execute(async () =>
    executeJob({
      name: 'normaliser-beneficiaires',
      payload: { dryRun: false },
    }),
  )
