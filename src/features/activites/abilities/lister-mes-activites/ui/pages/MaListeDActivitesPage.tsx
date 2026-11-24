import type { ReactNode } from 'react'
import type { RenseignerLeStatut } from '../components/CarteDeRendezVous'
import {
  type ContenuDeLaListe,
  ListeDeMesActivites,
} from '../components/ListeDeMesActivites'
import { MesActivitesPage } from '../components/MesActivitesPage'
import { sousTitreDeMesActivites } from '../presenters/lecture-de-la-liste.presenter'

export const MaListeDActivitesPage = ({
  liste,
  barreDeFiltres,
  aussiCoordinateur,
  saisieDuStatutDesRendezVous,
  basculeDesRendezVous,
  renseignerLeStatut,
}: {
  liste: {
    readonly contenu: Promise<ContenuDeLaListe>
    readonly parametres: Record<string, string>
  }
  barreDeFiltres: ReactNode
  aussiCoordinateur: boolean
  saisieDuStatutDesRendezVous: ReactNode
  basculeDesRendezVous: ReactNode
  renseignerLeStatut: RenseignerLeStatut
}) => (
  <MesActivitesPage
    vue="liste"
    sousTitre={sousTitreDeMesActivites(aussiCoordinateur)}
    saisieDuStatutDesRendezVous={saisieDuStatutDesRendezVous}
  >
    {barreDeFiltres}
    <ListeDeMesActivites
      contenu={liste.contenu}
      basculeDesRendezVous={basculeDesRendezVous}
      parametres={liste.parametres}
      renseignerLeStatut={renseignerLeStatut}
    />
  </MesActivitesPage>
)
