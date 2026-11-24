import { composerLesFiltres } from '@/libraries/filtres/definition/composition'
import { filtreDeChoixUnique } from '@/libraries/filtres/definition/filtre-de-choix'
import { filtreDuStatutDeRendezVous } from '../../../../ui/filtres/activites.filtre'

const filtreDeLAffichageDesRendezVous = filtreDeChoixUnique({
  titre: 'Rendez-vous',
  cle: 'voir-rdvs',
  choix: { Affiches: 'Rendez-vous affichés' },
  dansLURL: { Affiches: '1' },
})

export const filtresDesRendezVousDeLaListe = composerLesFiltres(
  filtreDuStatutDeRendezVous,
  filtreDeLAffichageDesRendezVous,
)
