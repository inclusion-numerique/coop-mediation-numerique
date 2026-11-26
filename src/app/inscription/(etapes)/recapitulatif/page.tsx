import { redirect } from 'next/navigation'
import { validerAction } from '@/app/_actions/inscription/valider.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/implementations/prisma/consulter-employeuse-actuelle.query'
import { employeuseActuelleAffichage } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/ui/presenters/employeuse-actuelle.presenter'
import StructureAdministrativeCard from '@/features/employeuse/ui/slots/StructureAdministrativeCard.slot'
import { consulterLeRecapitulatif } from '@/features/inscription/abilities/consulter-le-recapitulatif/domain/consulter-le-recapitulatif'
import { lireLInscritARecapituler } from '@/features/inscription/abilities/consulter-le-recapitulatif/implementations/prisma/inscrit-a-recapituler.query'
import { compterLesMediateursCoordonnes } from '@/features/inscription/abilities/consulter-le-recapitulatif/implementations/prisma/mediateurs-coordonnes.query'
import { VALIDER_ACTION_KEY } from '@/features/inscription/abilities/valider/action/valider.key'
import RecapitulatifPage from '@/features/inscription/abilities/valider/ui/pages/RecapitulatifPage'
import { recapitulatifPresente } from '@/features/inscription/abilities/valider/ui/presenters/recapitulatif.presenter'
import { UtilisateurId } from '@/features/inscription/domain'
import { employeuseAffichee } from '@/features/inscription/ui/presenters/employeuse-affichee.presenter'
import { listerLesLieuxPourLInscription } from '@/features/lieux-activite/abilities/lister-les-lieux-pour-l-inscription/implementations/prisma/lister-les-lieux-pour-l-inscription.query'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { CarteDuLieuSaisi } from '@/features/lieux-activite/ui/slots/CarteDuLieuSaisi.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Récapitulatif de votre inscription'),
}

const RecapitulatifPageRoute = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  const employeuseActuelle = await consulterEmployeuseActuelle({
    userId: user.id,
  })

  const recapitulatif = await consulterLeRecapitulatif({
    lireLInscritARecapituler,
    listerLesLieux: listerLesLieuxPourLInscription,
    compterLesMediateursCoordonnes,
  })({ utilisateurId: UtilisateurId(user.id) })

  const data = recapitulatifPresente({
    user,
    employeuse:
      employeuseActuelle &&
      employeuseAffichee(employeuseActuelleAffichage(employeuseActuelle)),
    recapitulatif: recapitulatif.data,
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
            <CarteDuLieuSaisi key={lieu.id} lieu={lieu} />
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
