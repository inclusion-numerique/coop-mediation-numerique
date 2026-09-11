import {
  Contact,
  Courriel,
  Nom,
  Pivot,
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
  typologies: [],
  contact: Contact({}),
  horaires: null,
  presentation: null,
  services: [],
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
  it('joint les courriels et les sites web par le séparateur du standard', () => {
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
      courriels: { email: 'contact@example.fr|accueil@example.fr' },
      site_web: 'https://example.fr|https://autre.example.fr',
    })
  })

  it("n'y pose pas les clés absentes", () => {
    expect(lieuVersRegistre(lieu()).contact).toEqual({})
  })
})

describe("le SIRET déclaré à l'enrichissement", () => {
  it('est le pivot quand celui-ci est un SIRET', () => {
    expect(
      lieuVersRegistre(lieu({ pivot: Pivot('55217862900132') }))
        .siretALEnrichissement,
    ).toBe('55217862900132')
  })

  // Le registre ne porte pas de RNA : un pivot associatif n'a pas de colonne où
  // aller, et la coop reste seule à le savoir.
  it('est absent quand le pivot est un RNA', () => {
    expect(
      lieuVersRegistre(lieu({ pivot: Pivot('W751234567') }))
        .siretALEnrichissement,
    ).toBeNull()
  })
})
