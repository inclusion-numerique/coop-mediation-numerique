'use client'

import Alert from '@codegouvfr/react-dsfr/Alert'
import Button from '@codegouvfr/react-dsfr/Button'
import { catchError } from 'next/error'

export const FrontiereDErreur = catchError(
  ({ className }: { className?: string }, { retry }) => (
    <div className={className}>
      <Alert
        severity="error"
        small
        description={
          <>
            Ces statistiques n’ont pas pu être chargées.{' '}
            <Button priority="tertiary no outline" size="small" onClick={retry}>
              Réessayer
            </Button>
          </>
        }
      />
    </div>
  ),
)
