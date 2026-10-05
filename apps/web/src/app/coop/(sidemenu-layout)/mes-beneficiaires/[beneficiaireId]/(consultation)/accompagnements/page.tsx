import { creerActiviteDepuisRdvAction } from '@app/web/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@app/web/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { searchActiviteAndRdvs } from '@app/web/features/activites/use-cases/list/db/searchActiviteAndRdvs'
import { consulterBeneficiaire } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import ViewBeneficiaireAccompagnementsPage from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireAccompagnementsPage'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.key'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

// Route hub : lit les données propres du bénéficiaire via l'ability
// consulter-beneficiaire, compose l'agrégat transverse activités + RDV, puis
// délègue le rendu au composant de page.
const BeneficiaireAccompagnementsPage = async (props: {
  params: Promise<{ beneficiaireId: string }>
}) => {
  // 1. Contrôle d'accès
  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id

  // 2. Préparation des entrées
  const { beneficiaireId } = await props.params

  // 3. Récupération via l'ability + not-found
  const beneficiaire = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId: MediateurId(mediateurId),
  })

  if (!beneficiaire) {
    notFound()
  }

  // Agrégat transverse (activités + RDV) composé par le hub, pas par l'ability.
  const searchResult = await searchActiviteAndRdvs({
    mediateurIds: [mediateurId],
    beneficiaireIds: [beneficiaireId],
    rdvUserIds: beneficiaire.rdvUserId ? [beneficiaire.rdvUserId] : [],
    rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
    shouldFetchRdvs: !!user.rdvAccount?.hasOauthTokens,
    shouldFetchActivites: true,
    searchParams: { lignes: '10000' },
  })

  // 4. Rendu de la vue
  return (
    <ClientBinder
      bind={CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY}
      to={creerActiviteDepuisRdvAction}
    >
      <ClientBinder
        bind={METTRE_A_JOUR_STATUT_RDV_ACTION_KEY}
        to={mettreAJourStatutRdvAction}
      >
        <ViewBeneficiaireAccompagnementsPage
          data={{ beneficiaire, searchResult, user }}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default BeneficiaireAccompagnementsPage
