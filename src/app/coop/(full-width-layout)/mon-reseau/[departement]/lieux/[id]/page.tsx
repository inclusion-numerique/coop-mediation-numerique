import { notFound } from 'next/navigation'
import { modifierLaFicheDuLieuAction } from '@/app/_actions/lieux-activite/modifier-la-fiche-du-lieu.action'
import CoopBreadcrumbs from '@/app/coop/CoopBreadcrumbs'
import { authenticateMediateurOrCoordinateur } from '@/auth/authenticateUser'
import { listerLesMediateursDuLieu } from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu'
import {
  dateDeDerniereActivite,
  MediateursDuLieu,
} from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu/ui'
import { consulterLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import {
  FicheDuLieuPage,
  ficheAffichee,
} from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui'
import {
  BoutonDeRetrait,
  ModaleDeRetrait,
} from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui'
import { LieuId } from '@/features/lieux-activite/domain/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/mediateur-id'
import { filDArianeDuReseau } from '@/features/mon-reseau/ui/fil-d-ariane'
import { hrefDesLieux } from '@/features/mon-reseau/ui/liens'
import { departementDuCode } from '@/libraries/departement'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import BackButton from '@/libraries/ui/components/BackButton'

const LieuActiviteDetailPage = async (props: {
  params: Promise<{ id: string; departement: string }>
}) => {
  const { id, departement: code } = await props.params
  const user = await authenticateMediateurOrCoordinateur(
    `/connexion?suivant=/coop/mon-reseau/${code}/lieux/${id}`,
  )

  const departement = departementDuCode(code)
  const lieuId = LieuId.safe(id)
  const consultee =
    lieuId === null
      ? null
      : await consulterLaFicheDuLieu(
          lieuId,
          user.mediateur == null ? null : MediateurId(user.mediateur.id),
        )

  if (!departement.success || lieuId === null || consultee === null) {
    return notFound()
  }

  const fiche = ficheAffichee(consultee)
  const mediateurs = await listerLesMediateursDuLieu(lieuId)
  const peutRetirerUnMediateur = user.coordinateur !== null

  return (
    <>
      <SkipLinksPortal />
      <main
        id={contentId}
        className="fr-container fr-flex fr-justify-content-center"
        style={{ maxWidth: 2500 }}
      >
        <FicheDuLieuPage
          fiche={fiche}
          enregistrer={modifierLaFicheDuLieuAction}
          creerUnLieuHref={
            user.mediateur == null ? undefined : '/coop/lieux-activite/creer'
          }
          entete={
            <>
              <CoopBreadcrumbs
                parents={[
                  ...filDArianeDuReseau(departement.data.code),
                  {
                    label: "Annuaire des lieux d'activités",
                    linkProps: { href: hrefDesLieux(departement.data.code) },
                  },
                ]}
                currentPage={fiche.nom}
              />
              <BackButton className="fr-mt-8v" />
            </>
          }
          mediateurs={
            <>
              <MediateursDuLieu
                mediateurs={mediateurs}
                departement={departement.data.code}
                retraits={
                  peutRetirerUnMediateur
                    ? Object.fromEntries(
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
                      )
                    : undefined
                }
              />
              {peutRetirerUnMediateur && <ModaleDeRetrait />}
            </>
          }
        />
      </main>
    </>
  )
}

export default LieuActiviteDetailPage
