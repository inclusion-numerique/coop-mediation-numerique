import { NomAffiche } from '@app/web/libraries/nom-affiche'
import {
  Effectif,
  LienAgent,
  NomDuMotif,
  RdvId,
  type RendezVousDeLaChronologie,
  StatutDeRendezVous,
  TitreDuRendezVous,
} from '../../domain'
import { carteDeRendezVous } from './carte-de-rendez-vous.presenter'

const rendezVous = (
  modification: Partial<RendezVousDeLaChronologie>,
): RendezVousDeLaChronologie => ({
  id: RdvId(7),
  debut: new Date('2026-03-03T09:00:00.000Z'),
  fin: new Date('2026-03-03T10:00:00.000Z'),
  statut: StatutDeRendezVous('Passe'),
  motif: { nom: NomDuMotif('Aide numérique'), collectif: false },
  titre: null,
  places: null,
  participants: [NomAffiche('Camille Martin'), NomAffiche('Alex Dupont')],
  lienAgent: LienAgent('https://rdv.anct.gouv.fr/admin/rdvs/7'),
  ...modification,
})

describe('carte d’un rendez-vous', () => {
  it('liste les participants d’un rendez-vous individuel passé, à renseigner', () => {
    expect(carteDeRendezVous(rendezVous({}), 'Europe/Paris')).toEqual({
      id: 7,
      collectif: false,
      horaires: '10h00 à 11h00',
      description: 'Aide numérique avec Camille Martin, Alex Dupont',
      statut: { libelle: 'Passé', severite: 'info' },
      aRenseigner: true,
      lien: 'https://rdv.anct.gouv.fr/admin/rdvs/7',
    })
  })

  it('décrit un rendez-vous collectif à venir par son titre et ses places', () => {
    const carte = carteDeRendezVous(
      rendezVous({
        statut: StatutDeRendezVous('AVenir'),
        motif: { nom: NomDuMotif('Atelier'), collectif: true },
        titre: TitreDuRendezVous('Smartphone'),
        places: Effectif(12),
      }),
      'Europe/Paris',
    )
    expect([carte.description, carte.aRenseigner]).toEqual([
      'Atelier Smartphone (12 places)',
      false,
    ])
  })
})
