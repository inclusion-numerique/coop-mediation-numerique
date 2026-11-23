import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import { appliquerLesDifferencesAction } from '@/app/_actions/lieux-activite/appliquer-les-differences.action'
import { modifierLaFicheDuLieuAction } from '@/app/_actions/lieux-activite/modifier-la-fiche-du-lieu.action'
import { retirerUnMediateurDuLieuAction } from '@/app/_actions/lieux-activite/retirer-un-mediateur-du-lieu.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user'
import { listerLesMediateursDuLieu } from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu'
import { MediateursDuLieu } from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu/ui'
import { consulterLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import { APPLIQUER_LES_DIFFERENCES_ACTION_KEY } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/action/appliquer-les-differences.key'
import {
  FicheDuLieuEnAdministrationPage,
  ficheAffichee,
} from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui'
import { RECHERCHER_UN_ETABLISSEMENT_KEY } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui/rechercher-un-etablissement.key'
import { RETIRER_UN_MEDIATEUR_DU_LIEU_ACTION_KEY } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/action/retirer-un-mediateur-du-lieu.key'
import {
  ModaleDeRetrait,
  retraitsDesMediateurs,
} from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Modifier une structure'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  await authenticateAdmin()
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
          to={rechercherStructureEmployeuseAction}
        >
          <FicheDuLieuEnAdministrationPage
            lieuId={lieuId}
            fiche={fiche}
            enregistrer={modifierLaFicheDuLieuAction}
            mediateurs={
              <>
                <MediateursDuLieu
                  mediateurs={mediateurs}
                  departement={fiche.departementCode}
                  retraits={retraitsDesMediateurs(
                    { id: lieuId, nom: fiche.nom },
                    mediateurs,
                  )}
                />
                <ModaleDeRetrait />
              </>
            }
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
