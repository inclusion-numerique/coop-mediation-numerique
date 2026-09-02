import { modifierLaFicheDuLieuAction } from '@app/web/app/_actions/lieux-activite/modifier-la-fiche-du-lieu.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { consulterLaFicheDuLieu } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import {
  FicheDuLieuPage,
  ficheAffichee,
} from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import RemoveMediateurFromLieuModal from '@app/web/features/mon-reseau/use-cases/acteurs/components/RemoveMediateurFromLieuModal/RemoveMediateurFromLieuModal'
import LieuMediateursEnActivite from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuMediateursEnActivite'
import { mediateursEnActiviteDuLieu } from '@app/web/features/mon-reseau/use-cases/lieux/db/mediateursEnActiviteDuLieu'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import { contentId } from '@app/web/utils/skipLinks'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import Button from '@codegouvfr/react-dsfr/Button'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Modifier une structure'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  const params = await props.params
  const consultee = await consulterLaFicheDuLieu(LieuId(params.structureId))

  if (consultee == null) {
    return notFound()
  }

  const fiche = ficheAffichee(consultee)
  const mediateurs = await mediateursEnActiviteDuLieu(params.structureId)

  return (
    <>
      <SkipLinksPortal />

      <div className="fr-flex fr-flex-gap-lg-4v fr-direction-column fr-direction-lg-row fr-justify-content-space-between">
        <AdministrationBreadcrumbs
          parents={[
            {
              label: 'Structures',
              linkProps: { href: `/administration/lieux-activite` },
            },
          ]}
          currentPage={toTitleCase(fiche.nom, { noUpper: true })}
        />
        <div>
          <Button
            iconId="fr-icon-git-merge-line"
            priority="tertiary"
            size="small"
            linkProps={{
              href: `/administration/lieux-activite/${params.structureId}/merge`,
            }}
          >
            Fusionner avec un autre lieu d’activité
          </Button>
        </div>
      </div>

      <main
        id={contentId}
        className="fr-mt-12v fr-pb-20v fr-flex fr-justify-content-center"
      >
        <FicheDuLieuPage
          fiche={fiche}
          enregistrer={modifierLaFicheDuLieuAction}
          mediateurs={
            <>
              <LieuMediateursEnActivite
                mediateurs={mediateurs}
                departementCode={fiche.departementCode}
                canRemoveMediateurFromLieuId={fiche.id}
                structureNom={fiche.nom}
              />
              <RemoveMediateurFromLieuModal />
            </>
          }
        />
      </main>
    </>
  )
}

export default Page
