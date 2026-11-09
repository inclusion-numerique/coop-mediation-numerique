import { modifierLaFicheDuLieuAction } from '@app/web/app/_actions/lieux-activite/modifier-la-fiche-du-lieu.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { listerLesMediateursDuLieu } from '@app/web/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu'
import {
  dateDeDerniereActivite,
  MediateursDuLieu,
} from '@app/web/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu/ui'
import { consulterLaFicheDuLieu } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import {
  EnteteDeLaFicheEnAdministration,
  FicheDuLieuPage,
  ficheAffichee,
} from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui'
import {
  BoutonDeRetrait,
  ModaleDeRetrait,
} from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { contentId } from '@app/web/utils/skipLinks'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Modifier une structure'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  const params = await props.params
  const lieuId = LieuId.safe(params.structureId)
  const consultee =
    lieuId === null ? null : await consulterLaFicheDuLieu(lieuId)

  if (lieuId === null || consultee === null) {
    return notFound()
  }

  const fiche = ficheAffichee(consultee)
  const mediateurs = await listerLesMediateursDuLieu(lieuId)

  return (
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
          enregistrer={modifierLaFicheDuLieuAction}
          mediateurs={
            <>
              <MediateursDuLieu
                mediateurs={mediateurs}
                departement={fiche.departementCode}
                retraits={Object.fromEntries(
                  mediateurs.map((mediateur) => [
                    mediateur.rattachementId,
                    <BoutonDeRetrait
                      key={mediateur.rattachementId}
                      structureId={lieuId}
                      mediateurId={mediateur.mediateurId}
                      mediateurDisplayName={mediateur.nomAffiche}
                      structureNom={fiche.nom}
                      derniereActiviteDate={dateDeDerniereActivite(
                        mediateur.derniereActiviteIci,
                      )}
                      variant="mediateur"
                    />,
                  ]),
                )}
              />
              <ModaleDeRetrait />
            </>
          }
        />
      </main>
    </>
  )
}

export default Page
