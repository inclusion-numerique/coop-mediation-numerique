import {
  Contact,
  Nom,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import { ModificationInconnue } from '../../../domain/tracabilite'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import {
  colonnesRapporteesParLaCartographie,
  identiteDuLieu,
  toutesLesColonnes,
} from './colonnes-a-ecrire'
import { lieuVersRegistre } from './lieu.registre.transfer'

const fiche: Fiche = {
  nom: Nom('Espace numérique'),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: [],
  contact: Contact({}),
  horaires: 'Mo-Fr 09:00-12:00',
  presentation: { resume: 'Un résumé' },
  services: [Service.AideAuxDemarchesAdministratives],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  modalitesAcces: [],
  fraisACharge: [],
  itinerance: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  modalitesAccompagnement: [],
  ficheAccesLibre: null,
  priseRdv: null,
}

const lieu: Lieu = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  fiche,
  visibilite: VisibiliteCartographie('Publie'),
  idsCartographieNationale: null,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    creation: { date: new Date('2026-01-01T00:00:00Z'), par: null },
    derniereModification: ModificationInconnue(
      new Date('2026-01-01T00:00:00Z'),
    ),
    suppression: { _tag: 'Actif' },
  },
}

const toutes = lieuVersRegistre(lieu)

describe('ce que chaque situation sait écrire au registre', () => {
  it('tout ce que la coop sait dire, quand elle tient la fiche entière', () => {
    expect(toutesLesColonnes(toutes)).toBe(toutes)
  })

  it('l’identité seule, et rien de ce qu’une employeuse ne peut pas dire', () => {
    const colonnes = identiteDuLieu(toutes)

    expect(Object.keys(colonnes).sort()).toEqual([
      'complementAdresse',
      'itinerance',
      'nom',
      'nomUsage',
      'siretALEnrichissement',
      'typologies',
      'visiblePourCartographieNationale',
    ])
    expect(colonnes).not.toHaveProperty('services')
    expect(colonnes).not.toHaveProperty('horaires')
    expect(colonnes).not.toHaveProperty('presentationResume')
  })

  it('ce que la cartographie rapporte, sans ce qu’elle ne lit pas', () => {
    const colonnes = colonnesRapporteesParLaCartographie(toutes)

    expect(colonnes.nom).toBe(toutes.nom)
    expect(colonnes.services).toEqual(toutes.services)
    expect(colonnes).not.toHaveProperty('nomUsage')
    expect(colonnes).not.toHaveProperty('siretALEnrichissement')
  })
})
