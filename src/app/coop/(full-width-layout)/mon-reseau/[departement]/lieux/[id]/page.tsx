import { notFound } from 'next/navigation'
import { rechercherUneStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-une-structure-employeuse.action'
import { appliquerLesDifferencesAction } from '@/app/_actions/lieux-activite/appliquer-les-differences.action'
import { modifierLaFicheDuLieuAction } from '@/app/_actions/lieux-activite/modifier-la-fiche-du-lieu.action'
import { retirerUnMediateurDuLieuAction } from '@/app/_actions/lieux-activite/retirer-un-mediateur-du-lieu.action'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { listerLesMediateursDuLieu } from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu/implementations/prisma/mediateurs-du-lieu.query'
import { MediateursDuLieu } from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu/ui/slots/MediateursDuLieu.slot'
import { APPLIQUER_LES_DIFFERENCES_ACTION_KEY } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/appliquer-les-differences.key'
import { RECHERCHER_UN_ETABLISSEMENT_KEY } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/rechercher-un-etablissement.key'
import { consulterLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/implementations/prisma/consulter-la-fiche-du-lieu.query'
import { FicheDuLieuPage } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/pages/FicheDuLieuPage'
import { ficheAffichee } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/presenters/fiche-du-lieu.presenter'
import { RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.key'
import { default as ModaleDeRetrait } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui/slots/ModaleDeRetrait.slot'
import { retraitsDesMediateurs } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui/slots/RetraitsDesMediateurs.slot'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import {
  EnteteDuLieuDuReseau,
  LieuDuReseauPage,
} from '@/features/mon-reseau/ui/pages/LieuDuReseauPage'
import { departementDuCode } from '@/libraries/departement'
import { ClientBinder } from '@/libraries/nextjs/injection'

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
    <ClientBinder
      bind={APPLIQUER_LES_DIFFERENCES_ACTION_KEY}
      to={appliquerLesDifferencesAction}
    >
      <ClientBinder
        bind={RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY}
        to={retirerUnMediateurDuLieuAction}
      >
        <ClientBinder
          bind={RECHERCHER_UN_ETABLISSEMENT_KEY}
          to={rechercherUneStructureEmployeuseAction}
        >
          <LieuDuReseauPage>
            <FicheDuLieuPage
              fiche={fiche}
              enregistrer={modifierLaFicheDuLieuAction}
              creerUnLieuHref={
                user.mediateur == null
                  ? undefined
                  : '/coop/lieux-activite/creer'
              }
              entete={
                <EnteteDuLieuDuReseau
                  departement={departement.data.code}
                  nom={fiche.nom}
                />
              }
              mediateurs={
                <>
                  <MediateursDuLieu
                    mediateurs={mediateurs}
                    departement={departement.data.code}
                    retraits={
                      peutRetirerUnMediateur
                        ? retraitsDesMediateurs(
                            { id: lieuId, nom: fiche.nom },
                            mediateurs,
                          )
                        : undefined
                    }
                  />
                  {peutRetirerUnMediateur && <ModaleDeRetrait />}
                </>
              }
            />
          </LieuDuReseauPage>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default LieuActiviteDetailPage
