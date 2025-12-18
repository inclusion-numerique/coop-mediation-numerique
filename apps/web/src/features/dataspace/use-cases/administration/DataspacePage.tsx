'use client'

import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { DataspaceSearchValidation } from '@app/web/features/dataspace/use-cases/administration/DataspaceSearchValidation'
import { handleSubmit } from '@app/web/libs/form/handle-submit'
import { useAppForm } from '@app/web/libs/form/use-app-form'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { trpc } from '@app/web/trpc'
import { contentId } from '@app/web/utils/skipLinks'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'

const DataspacePage = ({
  apiIsMocked,
  mockedApiEmails,
}: {
  apiIsMocked: boolean
  mockedApiEmails?: string[]
}) => {
  const getMediateurMutation = trpc.dataspaceAdmin.getMediateur.useMutation()
  const isPending = getMediateurMutation.isPending

  const form = useAppForm({
    validators: {
      onChange: DataspaceSearchValidation,
    },
    defaultValues: {
      email: '',
    },
    onSubmit: async (data) => {
      if (isPending) return
      await getMediateurMutation.mutateAsync({ email: data.value.email })
    },
  })

  const result = getMediateurMutation.data
  const hasResult = getMediateurMutation.isSuccess
  const isError =
    hasResult &&
    result !== null &&
    typeof result === 'object' &&
    'error' in result
  const isNotFound = hasResult && result === null
  const hasData = hasResult && !isError && !isNotFound

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs currentPage="Dataspace" />
      <main id={contentId}>
        <AdministrationTitle icon="ri-database-2-line">
          Dataspace
        </AdministrationTitle>
        {apiIsMocked && (
          <>
            <Notice
              className="fr-notice--info fr-mb-4v"
              title="L'API Dataspace est mockée (données de démo) sur les branches de preview. Pour utiliser l'API, rendez-vous sur l'administration en prod."
            />
            <div className="fr-mb-4v fr-border-radius--8 fr-py-4v fr-px-6v  fr-border">
              <p className="fr-text--sm fr-mb-2v">Emails mockés :</p>
              <ul className="fr-text--xs fr-mb-0 fr-list-unstyled">
                {mockedApiEmails?.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        <div className="fr-border-radius--8 fr-py-4v fr-px-6v fr-background-alt--blue-france fr-mb-6v">
          <form.AppForm>
            <form
              onSubmit={handleSubmit(form)}
              className="fr-flex fr-flex-gap-4v fr-align-items-end"
            >
              <form.AppField name="email">
                {(field) => (
                  <field.Input
                    label="Rechercher un médiateur dans le Dataspace par email"
                    isPending={isPending}
                    classes={{ root: 'fr-mb-0 fr-flex-grow-1' }}
                    nativeInputProps={{
                      placeholder: 'example@coop-numerique.anct.gouv.fr',
                      type: 'email',
                    }}
                  />
                )}
              </form.AppField>
              <Button
                type="submit"
                priority="primary"
                {...buttonLoadingClassname(isPending)}
              >
                Rechercher
              </Button>
            </form>
          </form.AppForm>
        </div>

        {getMediateurMutation.error && (
          <Notice
            className="fr-notice--error fr-mb-4v"
            title="Une erreur est survenue lors de la recherche"
          />
        )}

        {isError && (
          <Notice
            className="fr-notice--error fr-mb-4v"
            title={`Erreur ${result.error.statusCode}&nbsp;: ${result.error.message}`}
          />
        )}

        {isNotFound && (
          <Notice
            className="fr-notice--warning fr-mb-4v"
            title="Aucun médiateur trouvé pour cet email"
          />
        )}

        {hasData && (
          <div className="fr-border-radius--8 fr-p-4v fr-background-alt--grey">
            <pre
              className="fr-text--sm fr-mb-0"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </CoopPageContainer>
  )
}

export default withTrpc(DataspacePage)
