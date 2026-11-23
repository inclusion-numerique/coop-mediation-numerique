import { redirect } from 'next/navigation'
import { validerAction } from '@/app/_actions/inscription/valider.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticateUser'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/implementations'
import { employeuseActuelleAffichage } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/ui/employeuse-actuelle.presenter'
import StructureAdministrativeCard from '@/features/employeuse/ui/StructureAdministrativeCard'
import { VALIDER_ACTION_KEY } from '@/features/inscription/abilities/valider/action/valider.key'
import { getRecapitulatifPageData } from '@/features/inscription/abilities/valider/queries/getRecapitulatifPageData'
import RecapitulatifPage from '@/features/inscription/abilities/valider/ui/pages/RecapitulatifPage'
import { employeuseAffichee } from '@/features/inscription/ui/employeuse-affichee.presenter'
import { listerLesLieuxPourLInscription } from '@/features/lieux-activite/abilities/lister-les-lieux-pour-l-inscription'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { MediateurId } from '@/features/lieux-activite/domain/mediateur-id'
import { SaisieDuLieuCard } from '@/features/lieux-activite/ui'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Récapitulatif de votre inscription'),
}

const RecapitulatifPageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  const employeuseActuelle = await consulterEmployeuseActuelle({
    userId: user.id,
  })

  const data = await getRecapitulatifPageData({
    user,
    employeuse:
      employeuseActuelle &&
      employeuseAffichee(employeuseActuelleAffichage(employeuseActuelle)),
    listerLesLieux: ({ mediateurId }) =>
      listerLesLieuxPourLInscription({ mediateurId: MediateurId(mediateurId) }),
  })

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder bind={VALIDER_ACTION_KEY} to={validerAction}>
        <RecapitulatifPage
          data={data}
          cartesDesLieux={data.lieuxActivite.map((lieu) => (
            <SaisieDuLieuCard key={lieu.id} lieu={lieu} className="fr-mt-4v" />
          ))}
          carteEmployeuse={
            data.structureEmployeuse && (
              <StructureAdministrativeCard
                structure={data.structureEmployeuse}
              />
            )
          }
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default RecapitulatifPageRoute
