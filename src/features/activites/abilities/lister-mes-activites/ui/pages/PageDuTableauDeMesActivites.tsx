import type { ReactNode } from 'react'
import type { OptionsDeLaBarre } from '../../../../ui/components/filtres/BarreDeFiltres'
import type { FiltresDeLaListe } from '../../../../ui/presenters/filtres/filtres-de-la-liste'
import { AucuneActivite } from '../components/AucuneActivite'
import { EnTeteDeLaListe } from '../components/EnTeteDeLaListe'
import { MesActivitesPage } from '../components/MesActivitesPage'
import {
  type ContenuDuTableau,
  TableauDeMesActivites,
} from '../components/TableauDeMesActivites'
import { sousTitreDeMesActivites } from '../presenters/lecture-de-la-liste.presenter'

export const PageDuTableauDeMesActivites = ({
  tableau,
  options,
  aussiCoordinateur,
  exportDesAccompagnements,
}: {
  tableau: {
    readonly filtres: FiltresDeLaListe
    readonly rendezVousFiltrables: boolean
    readonly contenu: Promise<ContenuDuTableau>
    readonly parametres: Record<string, string>
  } | null
  options: OptionsDeLaBarre
  aussiCoordinateur: boolean
  exportDesAccompagnements: ReactNode
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
      <EnTeteDeLaListe
        filtres={tableau.filtres}
        options={options}
        rendezVousFiltrables={tableau.rendezVousFiltrables}
        exportDesAccompagnements={exportDesAccompagnements}
      />
      <TableauDeMesActivites
        contenu={tableau.contenu}
        parametres={tableau.parametres}
      />
    </MesActivitesPage>
  )
