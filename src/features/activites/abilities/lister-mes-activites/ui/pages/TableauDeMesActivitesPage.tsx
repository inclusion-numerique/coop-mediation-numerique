import type { ReactNode } from 'react'
import { AucuneActivite } from '../components/AucuneActivite'
import { MesActivitesPage } from '../components/MesActivitesPage'
import {
  type ContenuDuTableau,
  TableauDeMesActivites,
} from '../components/TableauDeMesActivites'
import { sousTitreDeMesActivites } from '../presenters/lecture-de-la-liste.presenter'

export const TableauDeMesActivitesPage = ({
  tableau,
  barreDeFiltres,
  aussiCoordinateur,
}: {
  tableau: {
    readonly contenu: Promise<ContenuDuTableau>
    readonly parametres: Record<string, string>
  } | null
  barreDeFiltres: ReactNode
  aussiCoordinateur: boolean
}) =>
  tableau === null ? (
    <MesActivitesPage vue="tableau" saisieDuStatutDesRendezVous={null}>
      <AucuneActivite />
    </MesActivitesPage>
  ) : (
    <MesActivitesPage
      vue="tableau"
      sousTitre={sousTitreDeMesActivites(aussiCoordinateur)}
      saisieDuStatutDesRendezVous={null}
    >
      {barreDeFiltres}
      <TableauDeMesActivites
        contenu={tableau.contenu}
        parametres={tableau.parametres}
      />
    </MesActivitesPage>
  )
