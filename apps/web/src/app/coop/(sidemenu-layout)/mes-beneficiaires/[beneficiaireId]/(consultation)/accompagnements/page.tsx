import { supprimerUneActiviteDeMediationAction } from '@app/web/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { creerActiviteDepuisRdvAction } from '@app/web/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@app/web/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { listerLHistoriqueDUnBeneficiaire } from '@app/web/features/activites/abilities/lister-mes-activites'
import {
  cartesDeLaChronologie,
  HistoriqueDesAccompagnements,
} from '@app/web/features/activites/abilities/lister-mes-activites/ui'
import {
  BeneficiaireId as BeneficiaireDesActivites,
  MediateurId as MediateurDesActivites,
  paginationLue,
} from '@app/web/features/activites/domain'
import { OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY } from '@app/web/features/activites/ui/carte/ouvrir-la-saisie-du-statut.key'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@app/web/features/activites/ui/detail/supprimer-une-activite-de-mediation.key'
import { consulterBeneficiaire } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import ViewBeneficiaireAccompagnementsPage from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireAccompagnementsPage'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import {
  rendezVousDesUsagersAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/creer-activite-depuis-rdv.key'
import SaisieDuStatutDuRdv, {
  useOuvrirLaSaisieDuStatut,
} from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/SaisieDuStatutDuRdv'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

type Parametres = Record<string, string | string[] | undefined>

const PARAMETRES_DE_PAGINATION = ['page', 'lignes']

const parametresDePagination = (parametres: Parametres) =>
  Object.fromEntries(
    PARAMETRES_DE_PAGINATION.flatMap((cle) => {
      const valeur = parametres[cle]
      return typeof valeur === 'string' ? [[cle, valeur]] : []
    }),
  )

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
  })

  if (!beneficiaire) {
    notFound()
  }

  const chronologie = await listerLHistoriqueDUnBeneficiaire({
    mediateurId: MediateurDesActivites(user.mediateur.id),
    beneficiaireId: BeneficiaireDesActivites(beneficiaire.id),
    pagination: paginationLue(parametres),
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
    conseillersNumeriques: conseillerNumeriqueSql,
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
          <ClientBinder
            bind={OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY}
            to={useOuvrirLaSaisieDuStatut}
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
                  pages={chronologie.pages}
                  adresse={`/coop/mes-beneficiaires/${beneficiaire.id}/accompagnements`}
                  parametres={parametresDePagination(parametres)}
                  saisieDuStatutDesRendezVous={<SaisieDuStatutDuRdv />}
                />
              }
            />
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default BeneficiaireAccompagnementsPage
