import { filtresDesRendezVousDeLaListe } from '../filtres/rendez-vous-de-la-liste.filtre'

export const CHEMIN_DE_MES_ACTIVITES = '/coop/mes-activites'

const MES_ACTIVITES = { chemin: CHEMIN_DE_MES_ACTIVITES, parametres: {} }

export const liensVersMesRendezVous = () => ({
  tous: filtresDesRendezVousDeLaListe.adresse(MES_ACTIVITES, {
    rdvs: [
      'AVenir',
      'Passe',
      'Honore',
      'Annule',
      'AnnuleParLeBeneficiaire',
      'Absent',
    ],
    'voir-rdvs': 'Affiches',
  }),
  aVenir: filtresDesRendezVousDeLaListe.adresse(MES_ACTIVITES, {
    rdvs: ['AVenir'],
    'voir-rdvs': 'Affiches',
  }),
  passes: filtresDesRendezVousDeLaListe.adresse(MES_ACTIVITES, {
    rdvs: ['Passe', 'Honore'],
  }),
})
