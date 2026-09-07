import { modifierLaFicheDuLieuAction } from '@app/web/app/_actions/lieux-activite/modifier-la-fiche-du-lieu.action'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { consulterLaFicheDuLieu } from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import {
  FicheDuLieuPage,
  ficheAffichee,
} from '@app/web/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui'
import {
  BoutonDeRetrait,
  ModaleDeRetrait,
} from '@app/web/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui'
import { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'
import { getDepartementFromCodeOrThrowNotFound } from '@app/web/features/mon-reseau/getDepartementFromCodeOrThrowNotFound'
import { getMonReseauBreadcrumbParents } from '@app/web/features/mon-reseau/getMonReseauBreadcrumbParents'
import { getActeurDisplayName } from '@app/web/features/mon-reseau/use-cases/acteurs/getActeurDisplayName'
import LieuMediateursEnActivite from '@app/web/features/mon-reseau/use-cases/lieux/components/LieuMediateursEnActivite'
import { mediateursEnActiviteDuLieu } from '@app/web/features/mon-reseau/use-cases/lieux/db/mediateursEnActiviteDuLieu'
import { contentId } from '@app/web/utils/skipLinks'
import { redirect } from 'next/navigation'

const LieuActiviteDetailPage = async (props: {
  params: Promise<{ id: string; departement: string }>
}) => {
  const { id, departement: departementCode } = await props.params
  const user = await authenticateUser(
    `/connexion?suivant=/mon-reseau/${departementCode}/lieux/${id}`,
  )

  getDepartementFromCodeOrThrowNotFound(departementCode)

  const consultee = await consulterLaFicheDuLieu(LieuId(id))

  if (consultee == null) redirect('/coop/lieux-activite')

  const fiche = ficheAffichee(consultee)
  const mediateurs = await mediateursEnActiviteDuLieu(id)
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
          entete={
            <>
              <CoopBreadcrumbs
                parents={[
                  ...getMonReseauBreadcrumbParents({ code: departementCode }),
                  {
                    label: "Annuaire des lieux d'activités",
                    linkProps: {
                      href: `/coop/mon-reseau/${departementCode}/lieux`,
                    },
                  },
                ]}
                currentPage={fiche.nom}
              />
              <BackButton className="fr-mt-8v" />
            </>
          }
          mediateurs={
            <>
              <LieuMediateursEnActivite
                mediateurs={mediateurs}
                departementCode={departementCode}
                retraits={
                  peutRetirerUnMediateur
                    ? Object.fromEntries(
                        mediateurs.map((rattachement) => [
                          rattachement.id,
                          <BoutonDeRetrait
                            key={rattachement.id}
                            structureId={fiche.id}
                            mediateurId={rattachement.mediateur.user.id}
                            mediateurDisplayName={getActeurDisplayName(
                              rattachement.mediateur.user,
                            )}
                            structureNom={fiche.nom}
                            derniereActiviteDate={
                              rattachement.mediateur.derniereActivite.date
                            }
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
