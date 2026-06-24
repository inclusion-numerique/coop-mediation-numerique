'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { executeJob } from '@app/web/jobs/jobExecutors'
import { actionBuilder } from '@app/web/libraries/nextjs'

export const normaliserTelephonesBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () =>
    executeJob({ name: 'backfill-telephones-beneficiaires' }),
  )
