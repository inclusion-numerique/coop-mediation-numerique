import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { authenticateMediateur } from '@/auth/authenticateUser'
import { isCoordinateur, isMediateur } from '@/auth/userTypeGuards'
import { ExportDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui'
import { optionsDeLaBarre } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites'
import { listerMesActivites } from '@/features/activites/abilities/lister-mes-activites'
import {
  AucuneActivite,
  EnTeteDeLaListe,
  lignesDuTableau,
  MesActivitesPage,
  parametresDeNavigation,
  rendezVousFiltrablesDansLeTableau,
  TableauDeMesActivites,
  titreDuDecompte,
} from '@/features/activites/abilities/lister-mes-activites/ui'
import {
  criteresDesActivites,
  estFiltreDesActivites,
  MediateurId,
  ordreChronologiqueLu,
  paginationLue,
  parametresDesActivitesDe,
} from '@/features/activites/domain'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/ui/detail/supprimer-une-activite-de-mediation.key'
import { filtresDeLaListe } from '@/features/activites/ui/filtres/filtres-de-la-liste'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/ui/filtres/plus-de-filtres/rechercher-employeuses.key'
import { conseillerNumeriqueSql } from '@/features/employeuse/server'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@/features/lieux-activite'
import {
  periodeDesRendezVous,
  rendezVousLies,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

type Parametres = Record<string, string | string[] | undefined>

const MesActivitesTableauRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateMediateur()
  const parametres = await searchParams
  const mediateurId = MediateurId(user.mediateur.id)
  const criteres = criteresDesActivites(parametres)
  const filtree = estFiltreDesActivites(criteres)
  const voirLesRdvs = parametres['voir-rdvs'] === '1'
  const compteRdv = user.rdvAccount?.hasOauthTokens ? user.rdvAccount : null

  const options = await optionsDeLaBarre({
    mediateurId,
    lieuxDesActivites: () =>
      getLieuxDesActivitesOptions({
        mediateurIds: [mediateurId],
        mediateurId,
      }),
    communesEtDepartements: () =>
      getMediateurCommunesAndDepartementsOptions({
        mediateurIds: [mediateurId],
      }),
    periodeDesRendezVous: () =>
      periodeDesRendezVous({
        comptes: user.rdvAccount ? [user.rdvAccount.id] : [],
      }),
  })

  if (!options.aDesActivites)
    return (
      <MesActivitesPage vue="tableau" saisieDuStatutDesRendezVous={null}>
        <AucuneActivite />
      </MesActivitesPage>
    )

  const pagination = paginationLue(parametres)

  const chronologie = listerMesActivites({
    mediateurId,
    criteres,
    pagination,
    ordre: ordreChronologiqueLu(parametres.ordre),
    contenu: 'ActivitesSeules',
    rendezVous: null,
    rendezVousLies,
    conseillersNumeriques: conseillerNumeriqueSql,
  })

  return (
    <ClientBinder
      bind={SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY}
      to={supprimerUneActiviteDeMediationAction}
    >
      <ClientBinder
        bind={RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY}
        to={rechercherEmployeusesDesActivitesAction}
      >
        <MesActivitesPage
          vue="tableau"
          sousTitre={
            isCoordinateur(user) && isMediateur(user)
              ? 'Médiation numérique'
              : undefined
          }
          saisieDuStatutDesRendezVous={null}
        >
          <EnTeteDeLaListe
            filtres={filtresDeLaListe(criteres)}
            options={options}
            rendezVousFiltrables={rendezVousFiltrablesDansLeTableau({
              compte: compteRdv,
              voirLesRdvs,
            })}
            exportDesAccompagnements={
              <ExportDeMesAccompagnements
                filtres={filtresDeLaListe(criteres)}
                options={options}
                nombreDAccompagnements={chronologie.then(
                  ({ total }) => total.accompagnements,
                )}
              />
            }
          />
          <TableauDeMesActivites
            contenu={chronologie.then((lue) => ({
              decompte: titreDuDecompte(lue.total.activites, filtree),
              lignes: lignesDuTableau(lue, user.timezone),
              total: lue.total.activites + lue.total.rendezVous,
              lignesParPage: pagination.lignesParPage,
            }))}
            parametres={{
              ...parametresDesActivitesDe(criteres),
              ...parametresDeNavigation(parametres),
            }}
          />
        </MesActivitesPage>
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesActivitesTableauRoute
