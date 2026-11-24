import type { PropsWithChildren } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import BackButton from '@/libraries/ui/components/BackButton'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import { filDArianeDesLieux } from '../presenters/fil-d-ariane.presenter'

export const LieuDuReseauPage = ({ children }: PropsWithChildren) => (
  <>
    <SkipLinksPortal />
    <main
      id={contentId}
      className="fr-container fr-flex fr-justify-content-center"
      style={{ maxWidth: 2500 }}
    >
      {children}
    </main>
  </>
)

export const EnteteDuLieuDuReseau = ({
  departement,
  nom,
}: {
  departement: string
  nom: string
}) => (
  <>
    <CoopBreadcrumbs
      parents={filDArianeDesLieux(departement)}
      currentPage={nom}
    />
    <BackButton className="fr-mt-8v" />
  </>
)
