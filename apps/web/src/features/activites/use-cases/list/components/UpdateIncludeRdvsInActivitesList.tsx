'use client'

import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { trpc } from '@app/web/trpc'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useState } from 'react'

const UpdateIncludeRdvsInActivitesList = ({
  rdvAccountId,
  includeRdvsInActivitesList,
}: {
  rdvAccountId: number
  includeRdvsInActivitesList: boolean
}) => {
  const queryParams = useSearchParams()

  const [value, setValue] = useState(
    includeRdvsInActivitesList || !!queryParams.get('rdvs'),
  )

  const mutation =
    trpc.rdvServicePublic.updateIncludeRdvsInActivitesList.useMutation()
  const router = useRouter()

  console.log({ rdvAccountId, includeRdvsInActivitesList, value })

  const onChange = async (option: ChangeEvent<HTMLInputElement>) => {
    setValue(option.target.checked)

    await mutation.mutateAsync({
      includeRdvsInActivitesList: option.target.checked,
      rdvAccountId,
    })

    // get current query params
    const params = new URLSearchParams(queryParams.toString())

    params.delete('rdvs')

    // Router.replace() to trigger refresh
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const id = 'include-rdvs-in-activites-list'

  return (
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
  )
}

export default withTrpc(UpdateIncludeRdvsInActivitesList)
