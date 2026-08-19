'use client'

import { afficherRdvsDansActivitesAction } from '@app/web/app/_actions/rdvsp/afficher-rdvs-dans-activites.action'
import { rattraperRdvsSansWebhookAction } from '@app/web/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import { Spinner } from '@app/web/ui/Spinner'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ChangeEvent, useEffect, useRef, useState } from 'react'

const UpdateIncludeRdvsInActivitesList = ({
  includeRdvsInActivitesList,
  syncDataOnLoad,
}: {
  includeRdvsInActivitesList: boolean
  syncDataOnLoad: boolean
}) => {
  const queryParams = useSearchParams()
  const router = useRouter()

  const [value, setValue] = useState(
    includeRdvsInActivitesList ||
      !!queryParams.get('rdvs') ||
      !!queryParams.get('voir-rdvs'),
  )

  const [synchronisationEnCours, setSynchronisationEnCours] = useState(false)

  // L'effet est joué deux fois en mode strict, et un remontage suffirait à
  // relancer une passe déjà en vol. Deux passes concurrentes sur le même compte
  // se disputeraient les mêmes lignes : on n'en laisse partir qu'une.
  const rattrapageLance = useRef(false)

  useEffect(() => {
    if (!syncDataOnLoad || rattrapageLance.current) {
      return
    }

    rattrapageLance.current = true
    setSynchronisationEnCours(true)

    rattraperRdvsSansWebhookAction().then((resultat) => {
      setSynchronisationEnCours(false)

      if (resultat.success && resultat.data.derive > 0) {
        router.refresh()
      }
    })
  }, [syncDataOnLoad, router])

  const onChange = async (option: ChangeEvent<HTMLInputElement>) => {
    setValue(option.target.checked)

    await afficherRdvsDansActivitesAction({ afficher: option.target.checked })

    // get current query params
    const params = new URLSearchParams(queryParams.toString())

    params.delete('rdvs')
    params.delete('voir-rdvs')

    // Router.replace() to trigger refresh
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const id = 'include-rdvs-in-activites-list'

  return (
    <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
      {synchronisationEnCours && (
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

export default UpdateIncludeRdvsInActivitesList
