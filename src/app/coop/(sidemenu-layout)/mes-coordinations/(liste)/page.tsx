import type { Metadata } from 'next'
import { supprimerUneActiviteDeCoordinationAction } from '@/app/_actions/activites/supprimer-une-activite-de-coordination.action'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateCoordinateur } from '@/auth/authenticateUser'
import { isMediateur } from '@/auth/userTypeGuards'
import {
  BoutonExporter,
  requeteDeLExport,
} from '@/features/activites/abilities/exporter-les-activites-de-coordination/ui'
import {
  listerLesActivitesDeCoordination,
  optionsDeFiltre,
} from '@/features/activites/abilities/lister-les-activites-de-coordination'
import {
  listeDesCoordinations,
  MesCoordinationsPage,
  optionsDeFiltrePresentees,
  parametresDeLaPagination,
} from '@/features/activites/abilities/lister-les-activites-de-coordination/ui'
import { SUPPRIMER_LA_COORDINATION_KEY } from '@/features/activites/abilities/lister-les-activites-de-coordination/ui/supprimer-la-coordination.key'
import {
  CoordinateurId,
  criteresDesCoordinations,
  estFiltre,
  paginationLue,
} from '@/features/activites/domain'
import { filtresActifsDesCoordinations } from '@/features/activites/ui/filtres-actifs-des-coordinations'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
  const pagination = paginationLue(parametres)

  const [listees, options] = await Promise.all([
    listerLesActivitesDeCoordination({
      coordinateurId,
      criteres,
      pagination,
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
        lignesParPage={pagination.lignesParPage}
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
