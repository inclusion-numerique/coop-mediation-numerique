import { supprimerUneActiviteDeCoordinationAction } from '@app/web/app/_actions/activites/supprimer-une-activite-de-coordination.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateCoordinateur } from '@app/web/auth/authenticateUser'
import { isMediateur } from '@app/web/auth/userTypeGuards'
import {
  BoutonExporter,
  requeteDeLExport,
} from '@app/web/features/activites/abilities/exporter-les-activites-de-coordination/ui'
import {
  listerLesActivitesDeCoordination,
  optionsDeFiltre,
} from '@app/web/features/activites/abilities/lister-les-activites-de-coordination'
import {
  listeDesCoordinations,
  MesCoordinationsPage,
  optionsDeFiltrePresentees,
  parametresDeLaPagination,
} from '@app/web/features/activites/abilities/lister-les-activites-de-coordination/ui'
import { SUPPRIMER_LA_COORDINATION_KEY } from '@app/web/features/activites/abilities/lister-les-activites-de-coordination/ui/supprimer-la-coordination.key'
import {
  CoordinateurId,
  criteresDesCoordinations,
  estFiltre,
  paginationLue,
} from '@app/web/features/activites/domain'
import { filtresActifsDesCoordinations } from '@app/web/features/activites/ui/filtres-actifs-des-coordinations'
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
      pagination: paginationLue(parametres),
    }),
    optionsDeFiltre({ coordinateurId }),
  ])

  const filtresActifs = filtresActifsDesCoordinations(criteres, options.tags)

  return (
    <ClientBinder
      bind={SUPPRIMER_LA_COORDINATION_KEY}
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
        pagination={parametresDeLaPagination(parametres)}
        exporter={
          <BoutonExporter
            filters={filtresActifs}
            requete={requeteDeLExport(parametres)}
            activitesCount={listees.total}
          />
        }
      />
    </ClientBinder>
  )
}

export default MesCoordinationsRoute
