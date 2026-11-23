import type { ReactNode } from 'react'
import type { OptionsDeLaBarre } from '../../../../ui/components/filtres/BarreDeFiltres'
import type { FiltresDeLaListe } from '../../../../ui/presenters/filtres/filtres-de-la-liste.search-params'
import type { RenseignerLeStatut } from '../components/CarteDeRendezVous'
import { EnTeteDeLaListe } from '../components/EnTeteDeLaListe'
import {
  type ContenuDeLaListe,
  ListeDeMesActivites,
} from '../components/ListeDeMesActivites'
import { MesActivitesPage } from '../components/MesActivitesPage'
import { sousTitreDeMesActivites } from '../presenters/lecture-de-la-liste.presenter'

export const PageDeMaListeDActivites = ({
  liste,
  options,
  aussiCoordinateur,
  saisieDuStatutDesRendezVous,
  exportDesAccompagnements,
  basculeDesRendezVous,
  renseignerLeStatut,
}: {
  liste: {
    readonly filtres: FiltresDeLaListe
    readonly rendezVousFiltrables: boolean
    readonly contenu: Promise<ContenuDeLaListe>
    readonly parametres: Record<string, string>
  }
  options: OptionsDeLaBarre
  aussiCoordinateur: boolean
  saisieDuStatutDesRendezVous: ReactNode
  exportDesAccompagnements: ReactNode
  basculeDesRendezVous: ReactNode
  renseignerLeStatut: RenseignerLeStatut
}) => (
  <MesActivitesPage
    vue="liste"
    sousTitre={sousTitreDeMesActivites(aussiCoordinateur)}
    saisieDuStatutDesRendezVous={saisieDuStatutDesRendezVous}
  >
    <EnTeteDeLaListe
      filtres={liste.filtres}
      options={options}
      rendezVousFiltrables={liste.rendezVousFiltrables}
      exportDesAccompagnements={exportDesAccompagnements}
    />
    <ListeDeMesActivites
      contenu={liste.contenu}
      basculeDesRendezVous={basculeDesRendezVous}
      parametres={liste.parametres}
      renseignerLeStatut={renseignerLeStatut}
    />
  </MesActivitesPage>
)
