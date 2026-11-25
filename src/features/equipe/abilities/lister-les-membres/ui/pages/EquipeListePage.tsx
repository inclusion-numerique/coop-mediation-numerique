import type { ReactNode } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { telephoneDisplayString } from '@/libraries/telephone'
import { CoopBreadcrumbs } from '@/libraries/ui/components'
import type { MembresDeLEquipe } from '../../domain'

const EquipeListePage = ({
  membres,
  enTete,
  liste,
}: {
  membres: MembresDeLEquipe
  enTete: ReactNode
  liste: ReactNode
}) => {
  const { coordinateur } = membres

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--1200">
        <CoopBreadcrumbs currentPage="Mon équipe" />
        <main id={contentId} className="fr-mb-16w">
          <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-mt-12v fr-mb-6v">
            <span className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v">
              <span
                className="ri-team-line fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
                aria-hidden
              />
              <h1 className="fr-page-title fr-m-0">Mon équipe</h1>
            </span>
            <span>{enTete}</span>
          </div>
          <div className="fr-mb-12v">
            Équipe coordonnée par{' '}
            <span className="fr-text--bold">{coordinateur.nom}</span>
            <div className="fr-flex fr-text-mention--grey fr-text--sm fr-mt-2v fr-mb-0 fr-flex-gap-2v">
              <span>
                <span className="ri-mail-line fr-mr-2v" aria-hidden />
                {coordinateur.email}
              </span>
              {coordinateur.telephone && (
                <>
                  <span className="fr-hidden fr-unhidden-md" aria-hidden>
                    ·
                  </span>
                  <span>
                    <span className="ri-phone-line fr-mr-2v" aria-hidden />
                    {telephoneDisplayString(coordinateur.telephone)}
                  </span>
                </>
              )}
            </div>
          </div>
          {liste}
        </main>
      </div>
    </>
  )
}

export default EquipeListePage
