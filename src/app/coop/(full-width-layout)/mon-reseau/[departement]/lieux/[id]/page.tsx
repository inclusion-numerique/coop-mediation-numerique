import { notFound } from 'next/navigation'
import { modifierLaFicheDuLieuAction } from '@/app/_actions/lieux-activite/modifier-la-fiche-du-lieu.action'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementation/session/authenticateUser'
import { listerLesMediateursDuLieu } from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu'
import { MediateursDuLieu } from '@/features/lieux-activite/abilities/lister-les-mediateurs-du-lieu/ui'
import { consulterLaFicheDuLieu } from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu'
import {
  FicheDuLieuPage,
  ficheAffichee,
} from '@/features/lieux-activite/abilities/modifier-la-fiche-du-lieu/ui'
import {
  ModaleDeRetrait,
  retraitsDesMediateurs,
} from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/ui'
import { LieuId } from '@/features/lieux-activite/domain/lieu-id'
import { MediateurId } from '@/features/lieux-activite/domain/mediateur-id'
import {
  EnteteDuLieuDuReseau,
  LieuDuReseauPage,
} from '@/features/mon-reseau/ui/LieuDuReseauPage'
import { departementDuCode } from '@/libraries/departement'

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
    <LieuDuReseauPage>
      <FicheDuLieuPage
        fiche={fiche}
        enregistrer={modifierLaFicheDuLieuAction}
        creerUnLieuHref={
          user.mediateur == null ? undefined : '/coop/lieux-activite/creer'
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
  )
}

export default LieuActiviteDetailPage
