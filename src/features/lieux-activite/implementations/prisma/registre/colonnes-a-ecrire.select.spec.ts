import {
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Horaires,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  Presentation,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Fiche } from '../../../domain/fiche'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import type { Lieu } from '../../../domain/lieu'
import { ModificationInconnue } from '../../../domain/registre/tracabilite'
import {
  colonnesRapporteesParLaCartographie,
  identiteDuLieu,
  toutesLesColonnes,
} from './colonnes-a-ecrire.select'
import { lieuVersRegistre } from './lieu.transfer'

const fiche: Fiche = {
  nom: Nom('Espace numérique'),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: Typologies([]),
  contact: Contact({}),
  horaires: Horaires('Mo-Fr 09:00-12:00'),
  presentation: Presentation({ resume: 'Un résumé' }),
  services: Services([Service.AideAuxDemarchesAdministratives]),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([]),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques([]),
  modalitesAcces: ModalitesAcces([]),
  fraisACharge: FraisACharge([]),
  itinerance: Itinerances([]),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
  formationsLabels: FormationsLabels([]),
  autresFormationsLabels: [],
  modalitesAccompagnement: ModalitesAccompagnement([]),
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
