import { notFound } from 'next/navigation'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { creerActiviteDepuisRdvAction } from '@/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { listerLHistoriqueDUnBeneficiaire } from '@/features/activites/abilities/lister-mes-activites/implementations/prisma/historique-d-un-beneficiaire.query'
import { cartesDeLaChronologie } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/mes-activites.presenter'
import { parametresDePagination } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/navigation.presenter'
import { HistoriqueDesAccompagnements } from '@/features/activites/abilities/lister-mes-activites/ui/slots/HistoriqueDesAccompagnements.slot'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/action/supprimer-une-activite-de-mediation.key'
import {
  BeneficiaireId as BeneficiaireDesActivites,
  MediateurId as MediateurDesActivites,
} from '@/features/activites/domain'
import { lectureDeLaPagination } from '@/features/activites/ui/filtres/liste-des-activites.filtre'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterBeneficiaire } from '@/features/beneficiaire/abilities/consulter-beneficiaire/implementations/prisma/consulter-beneficiaire.query'
import ViewBeneficiaireAccompagnementsPage from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireAccompagnementsPage'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import {
  rendezVousDesUsagersAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/creer-activite-depuis-rdv.key'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { RenseignerLeStatut } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/slots/RenseignerLeStatut.slot'
import SaisieDuStatutDuRdv from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/slots/SaisieDuStatutDuRdv.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

type Parametres = Record<string, string | string[] | undefined>

const BeneficiaireAccompagnementsPage = async (props: {
  params: Promise<{ beneficiaireId: string }>
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateMediateur()
  const { beneficiaireId } = await props.params
  const parametres = await props.searchParams

  const beneficiaire = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId: MediateurId(user.mediateur.id),
    maintenant: new Date(),
  })

  if (!beneficiaire) {
    notFound()
  }

  const { pagination } = lectureDeLaPagination(parametres)

  const chronologie = await listerLHistoriqueDUnBeneficiaire({
    mediateurId: MediateurDesActivites(user.mediateur.id),
    beneficiaireId: BeneficiaireDesActivites(beneficiaire.id),
    pagination,
    compte: user.rdvAccount?.hasOauthTokens
      ? { _tag: 'Connecte', affichesDansLaListe: true }
      : { _tag: 'NonConnecte' },
    rendezVous:
      user.rdvAccount === null
        ? null
        : {
            comptes: [user.rdvAccount.id],
            selection: rendezVousDesUsagersAListerSql(
              beneficiaire.rdvUserId === null ? [] : [beneficiaire.rdvUserId],
            ),
            parIds: rendezVousParIds,
          },
    rendezVousLies,
  })

  return (
    <ClientBinder
      bind={SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY}
      to={supprimerUneActiviteDeMediationAction}
    >
      <ClientBinder
        bind={CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY}
        to={creerActiviteDepuisRdvAction}
      >
        <ClientBinder
          bind={METTRE_A_JOUR_STATUT_RDV_ACTION_KEY}
          to={mettreAJourStatutRdvAction}
        >
          <ViewBeneficiaireAccompagnementsPage
            beneficiaireId={beneficiaire.id}
            nombreDAccompagnements={
              chronologie.total.activites + chronologie.total.rendezVous
            }
            accompagnements={
              <HistoriqueDesAccompagnements
                cartes={cartesDeLaChronologie(
                  chronologie.elements,
                  user.timezone,
                )}
                total={
                  chronologie.total.activites + chronologie.total.rendezVous
                }
                lignesParPage={pagination.pageSize}
                adresse={`/coop/mes-beneficiaires/${beneficiaire.id}/accompagnements`}
                parametres={parametresDePagination(parametres)}
                saisieDuStatutDesRendezVous={<SaisieDuStatutDuRdv />}
                renseignerLeStatut={(rdv) => <RenseignerLeStatut rdv={rdv} />}
              />
            }
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default BeneficiaireAccompagnementsPage
