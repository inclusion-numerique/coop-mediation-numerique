'use server'

import { withAdmin, withAuth } from '@app/web/features/authentification'
import { executeJob } from '@app/web/jobs/jobExecutors'
import { actionBuilder } from '@app/web/libraries/nextjs'

export const normaliserBeneficiairesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => executeJob({ name: 'normaliser-beneficiaires' }))
