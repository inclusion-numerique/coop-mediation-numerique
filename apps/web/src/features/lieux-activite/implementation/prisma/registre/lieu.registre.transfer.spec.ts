import {
  Contact,
  Courriel,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  Pivot,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Services,
  Typologies,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import { ModificationInconnue } from '../../../domain/tracabilite'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import { lieuVersRegistre } from './lieu.registre.transfer'

const modification = new Date('2026-09-08T10:00:00Z')

const fiche: Fiche = {
  nom: Nom('La Quincaillerie numérique'),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: Typologies([]),
  contact: Contact({}),
  horaires: null,
  presentation: null,
  services: Services([]),
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

const lieu = (surcharge: Partial<Fiche> = {}): Lieu => ({
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  fiche: { ...fiche, ...surcharge },
  visibilite: VisibiliteCartographie('NonPublie'),
  idsCartographieNationale: null,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    creation: { date: modification, par: null },
    derniereModification: ModificationInconnue(modification),
    suppression: { _tag: 'Actif' },
  },
})

describe('le contact, que le registre range en un seul jsonb', () => {
  it('joint les courriels et les sites web, ordonnés par le standard', () => {
    const { contact } = lieuVersRegistre(
      lieu({
        contact: Contact({
          telephone: '+33180059880',
          courriels: [
            Courriel('contact@example.fr'),
            Courriel('accueil@example.fr'),
          ],
          site_web: [
            Url('https://example.fr'),
            Url('https://autre.example.fr'),
          ],
        }),
      }),
    )

    expect(contact).toEqual({
      telephone: '+33180059880',
      courriels: { email: 'accueil@example.fr|contact@example.fr' },
      site_web: 'https://autre.example.fr|https://example.fr',
    })
  })

  it("n'y pose pas les clés absentes", () => {
    expect(lieuVersRegistre(lieu()).contact).toEqual({})
  })
})

describe("le SIRET déclaré à l'enrichissement", () => {
  it('est le pivot quand celui-ci est un SIRET', () => {
    expect(
      lieuVersRegistre(lieu({ pivot: Pivot('55217862900135') }))
        .siretALEnrichissement,
    ).toBe('55217862900135')
  })

  it('est absent quand le lieu n’a pas de pivot', () => {
    expect(lieuVersRegistre(lieu()).siretALEnrichissement).toBeNull()
  })
})
