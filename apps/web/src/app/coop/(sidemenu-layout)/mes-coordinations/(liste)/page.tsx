import { supprimerUneActiviteDeCoordinationAction } from '@app/web/app/_actions/activites/supprimer-une-activite-de-coordination.action'
import { creerActiviteDepuisRdvAction } from '@app/web/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@app/web/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { isMediateur } from '@app/web/auth/userTypeGuards'
import { BoutonExporter } from '@app/web/features/activites/abilities/exporter-les-activites-de-coordination/ui'
import {
  listerLesActivitesDeCoordination,
  optionsDeFiltre,
} from '@app/web/features/activites/abilities/lister-les-activites-de-coordination'
import {
  listeDesCoordinations,
  MesCoordinationsPage,
  optionsDeFiltrePresentees,
} from '@app/web/features/activites/abilities/lister-les-activites-de-coordination/ui'
import { SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY } from '@app/web/features/activites/abilities/supprimer-une-activite-de-coordination/action/supprimer-une-activite-de-coordination.key'
import {
  CoordinateurId,
  criteresDesCoordinations,
  estFiltre,
} from '@app/web/features/activites/domain'
import { filtresActifsDesCoordinations } from '@app/web/features/activites/ui/filtres-actifs-des-coordinations'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.key'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  toNumberOr,
} from '@app/web/libs/data-table/toNumberOr'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités de coordination'),
}

type Parametres = {
  page?: string
  lignes?: string
  du?: string
  au?: string
  types?: string
  tags?: string
}

const requeteDeLExport = ({ du, au, types, tags }: Parametres): string =>
  new URLSearchParams(
    Object.entries({ du, au, types, tags }).flatMap(([cle, valeur]) =>
      valeur === undefined ? [] : [[cle, valeur]],
    ),
  ).toString()

const MesCoordinationsRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateCoordinateur()
  const parametres = await searchParams
  const coordinateurId = CoordinateurId(user.coordinateur.id)
  const criteres = criteresDesCoordinations(parametres)

  const [listees, options] = await Promise.all([
    listerLesActivitesDeCoordination({
      coordinateurId,
      criteres,
      page: toNumberOr(parametres.page)(DEFAULT_PAGE),
      lignesParPage: toNumberOr(parametres.lignes)(DEFAULT_PAGE_SIZE),
    }),
    optionsDeFiltre({ coordinateurId }),
  ])

  const filtresActifs = filtresActifsDesCoordinations(criteres, options.tags)

  return (
    <ClientBinder
      bind={CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY}
      to={creerActiviteDepuisRdvAction}
    >
      <ClientBinder
        bind={METTRE_A_JOUR_STATUT_RDV_ACTION_KEY}
        to={mettreAJourStatutRdvAction}
      >
        <ClientBinder
          bind={SUPPRIMER_UNE_ACTIVITE_DE_COORDINATION_ACTION_KEY}
          to={supprimerUneActiviteDeCoordinationAction}
        >
          <MesCoordinationsPage
            sousTitre={isMediateur(user) ? 'Coordination' : undefined}
            options={optionsDeFiltrePresentees(options, new Date())}
            filtresActifs={filtresActifs}
            liste={listeDesCoordinations({
              listees,
              filtre: estFiltre(criteres),
              timezone: user.timezone,
            })}
            filtre={estFiltre(criteres)}
            pagination={{ page: parametres.page, lignes: parametres.lignes }}
            exporter={
              <BoutonExporter
                filters={filtresActifs}
                requete={requeteDeLExport(parametres)}
                activitesCount={listees.total}
              />
            }
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesCoordinationsRoute
