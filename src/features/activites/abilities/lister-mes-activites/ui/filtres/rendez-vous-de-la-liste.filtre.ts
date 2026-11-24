import { composerLEtat } from '@/libraries/etat-d-url/definition/composition'
import { filtreDeChoixUnique } from '@/libraries/etat-d-url/definition/filtre-de-choix'
import { filtreDuStatutDeRendezVous } from '../../../../ui/filtres/activites.filtre'

const filtreDeLAffichageDesRendezVous = filtreDeChoixUnique({
  titre: 'Rendez-vous',
  cle: 'voir-rdvs',
  choix: { Affiches: 'Rendez-vous affichés' },
  dansLURL: { Affiches: '1' },
})

export const filtresDesRendezVousDeLaListe = composerLEtat(
  filtreDuStatutDeRendezVous,
  filtreDeLAffichageDesRendezVous,
)
