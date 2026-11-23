import type { ReactNode } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import type { LieuId } from '../../../../domain/lieu-id'
import { EnteteDeLaFicheEnAdministration } from '../components/EnteteDeLaFicheEnAdministration'
import type { EnregistrerUneSection } from '../enregistrer-une-section'
import type { FicheAffichee } from '../fiche-du-lieu.presenter'
import { FicheDuLieuPage } from './FicheDuLieuPage'

export const FicheDuLieuEnAdministrationPage = ({
  lieuId,
  fiche,
  enregistrer,
  mediateurs,
}: {
  lieuId: LieuId
  fiche: FicheAffichee
  enregistrer: EnregistrerUneSection
  mediateurs: ReactNode
}) => (
  <>
    <SkipLinksPortal />
    <EnteteDeLaFicheEnAdministration
      nom={fiche.nom}
      fusionHref={`/administration/lieux-activite/${lieuId}/merge`}
    />
    <main
      id={contentId}
      className="fr-mt-12v fr-pb-20v fr-flex fr-justify-content-center"
    >
      <FicheDuLieuPage
        fiche={fiche}
        enregistrer={enregistrer}
        mediateurs={mediateurs}
      />
    </main>
  </>
)
