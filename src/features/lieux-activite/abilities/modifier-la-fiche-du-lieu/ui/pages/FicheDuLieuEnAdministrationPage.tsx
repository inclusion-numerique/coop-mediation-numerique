import type { ReactNode } from 'react'
import { hrefDeFusionDuLieu } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import { EnteteDeLaFicheEnAdministration } from '../components/EnteteDeLaFicheEnAdministration'
import type { EnregistrerUneSection } from '../hooks/use-enregistrement-de-section'
import type { FicheAffichee } from '../presenters/fiche-du-lieu.presenter'
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
      fusionHref={hrefDeFusionDuLieu(lieuId)}
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
