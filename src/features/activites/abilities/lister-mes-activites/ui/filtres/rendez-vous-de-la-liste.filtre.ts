import { composerLEtat, filtreDeChoixUnique } from '@/libraries/etat-d-url'
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
