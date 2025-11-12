'use client'

import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { trpc } from '@app/web/trpc'
import { Spinner } from '@app/web/ui/Spinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'

const UpdateIncludeRdvsInActivitesList = ({
  rdvAccountId,
  includeRdvsInActivitesList,
  syncDataOnLoad,
  userId,
}: {
  userId: string
  rdvAccountId: number
  includeRdvsInActivitesList: boolean
  syncDataOnLoad: boolean
}) => {
  const queryParams = useSearchParams()

  const [value, setValue] = useState(
    includeRdvsInActivitesList ||
      !!queryParams.get('rdvs') ||
      !!queryParams.get('voir-rdvs'),
  )

  const mutation =
    trpc.rdvServicePublic.updateIncludeRdvsInActivitesList.useMutation()

  const refreshRdvDataMutation =
    trpc.rdvServicePublic.refreshRdvData.useMutation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshRdvDataMutation is not in dependencies as it should not retrigger the call
  useEffect(() => {
    if (syncDataOnLoad) {
      refreshRdvDataMutation.mutateAsync({ userId }).then((result) => {
        if (result?.hasDiff) {
          router.refresh()
        }
      })
    }
  }, [syncDataOnLoad])

  const router = useRouter()

  const onChange = async (option: ChangeEvent<HTMLInputElement>) => {
    setValue(option.target.checked)

    await mutation.mutateAsync({
      includeRdvsInActivitesList: option.target.checked,
      rdvAccountId,
    })

    // get current query params
    const params = new URLSearchParams(queryParams.toString())

    params.delete('rdvs')
    params.delete('voir-rdvs')

    // Router.replace() to trigger refresh
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const id = 'include-rdvs-in-activites-list'

  const isLoading = refreshRdvDataMutation.isPending

  return (
    <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
      {isLoading && (
        <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
          <Spinner
            size="small"
            inline
            className="fr-text-mention--grey fr-mb-0"
          />
          <span className="fr-text--xs fr-text-mention--grey fr-mb-0 fr-mr-4v">
            Synchronisation des rendez-vous
          </span>
        </div>
      )}
      <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
        <div className="fr-checkbox-group fr-checkbox-group--sm">
          <input
            type="checkbox"
            id={id}
            name={id}
            defaultChecked={value}
            onChange={onChange}
          />
          <label className="fr-label fr-whitespace-nowrap" htmlFor={id}>
            Voir les RDVs{' '}
            <span
              className="fr-background-alt--blue-france fr-p-1v fr-border-radius--8 fr-flex fr-ml-2v"
              aria-hidden
            >
              <RDVServicePublicLogo
                className="fr-display-block"
                height={16}
                width={16}
              />
            </span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default withTrpc(UpdateIncludeRdvsInActivitesList)
