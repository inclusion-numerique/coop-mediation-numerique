import {
  Adresse,
  Contact,
  Courriel,
  Itinerance,
  ModaliteAcces,
  Nom,
  Pivot,
  PublicSpecifiquementAdresse,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import { ModificationInconnue } from '../../../domain/tracabilite'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import type { FicheDuLieu } from '../implementation'
import { ficheAffichee } from './fiche-du-lieu.presenter'

const lieu: Lieu = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  fiche: {
    nom: Nom('Espace numérique'),
    pivot: null,
    adresse: Adresse({
      voie: '12 rue de la Paix',
      commune: 'Reims',
      code_postal: '51100',
    }),
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
  },
  visibilite: VisibiliteCartographie('NonPublie'),
  idsCartographieNationale: null,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    creation: { date: new Date('2026-01-01T00:00:00Z'), par: null },
    derniereModification: ModificationInconnue(
      new Date('2026-08-01T00:00:00Z'),
    ),
    suppression: { _tag: 'Actif' },
  },
}

const afficher = (fiche: Lieu['fiche']) => {
  const consultee: FicheDuLieu = {
    lieu: { ...lieu, fiche },
    auteurDerniereModification: null,
  }

  return ficheAffichee(consultee)
}

describe('mise en forme de la fiche pour l’écran', () => {
  it('déduit « tout public » de l’absence de public visé', () => {
    expect(afficher(lieu.fiche).typesDePublicsAccueillis.toutPublic).toBe(true)
  })

  it('ne dit plus « tout public » dès qu’un public est visé', () => {
    const affichee = afficher({
      ...lieu.fiche,
      publicsSpecifiquementAdresses: [PublicSpecifiquementAdresse.Jeunes],
    })

    expect(affichee.typesDePublicsAccueillis.toutPublic).toBe(false)
    expect(
      affichee.typesDePublicsAccueillis.publicsSpecifiquementAdresses,
    ).toEqual(['Jeunes'])
  })

  it('range le pivot du bon côté selon qu’il est SIRET ou RNA', () => {
    const parSiret = afficher({ ...lieu.fiche, pivot: Pivot('55217862900132') })
    const parRna = afficher({ ...lieu.fiche, pivot: Pivot('W123456789') })

    expect(parSiret.informationsGenerales.siret).toBe('55217862900132')
    expect(parSiret.informationsGenerales.rna).toBeNull()
    expect(parRna.informationsGenerales.rna).toBe('W123456789')
    expect(parRna.informationsGenerales.siret).toBeNull()
  })

  it('rejoint les sites web comme la colonne les stocke', () => {
    const affichee = afficher({
      ...lieu.fiche,
      contact: Contact({
        site_web: [
          Url('https://un.example.fr'),
          Url('https://deux.example.fr'),
        ],
      }),
    })

    expect(affichee.informationsPratiques.siteWeb).toBe(
      'https://un.example.fr|https://deux.example.fr',
    )
  })

  it('rend l’itinérance en tri-état pour la case à cocher', () => {
    expect(afficher(lieu.fiche).informationsGenerales.lieuItinerant).toBeNull()
    expect(
      afficher({ ...lieu.fiche, itinerance: [Itinerance.Itinerant] })
        .informationsGenerales.lieuItinerant,
    ).toBe(true)
    expect(
      afficher({ ...lieu.fiche, itinerance: [Itinerance.Fixe] })
        .informationsGenerales.lieuItinerant,
    ).toBe(false)
  })

  it('recompose les cases des modalités d’accès et leurs moyens', () => {
    const affichee = afficher({
      ...lieu.fiche,
      modalitesAcces: [
        ModaliteAcces.Telephoner,
        ModaliteAcces.ContacterParMail,
      ],
      contact: Contact({
        telephone: '+33180059880',
        courriels: [Courriel('contact@example.fr')],
      }),
    })

    expect(affichee.modalitesAccesAuService).toMatchObject({
      surPlace: false,
      parTelephone: true,
      numeroTelephone: '+33180059880',
      parMail: true,
      adresseMail: 'contact@example.fr',
    })
  })
})
