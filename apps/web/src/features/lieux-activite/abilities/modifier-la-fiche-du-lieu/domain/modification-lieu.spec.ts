import {
  Adresse,
  Contact,
  Courriel,
  Frais,
  Itinerance,
  ModaliteAcces,
  Nom,
  Service,
  Typologie,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import { ModificationInconnue } from '../../../domain/tracabilite'
import { UserId } from '../../../domain/user-id'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import { appliquerModification } from './modification-lieu'

const maintenant = new Date('2026-09-02T11:00:00Z')
const auteur = UserId('550e8400-e29b-41d4-a716-446655440001')

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
    typologies: [Typologie.BIB],
    contact: Contact({
      telephone: '+33180059880',
      courriels: [Courriel('contact@example.fr')],
      site_web: [Url('https://www.example.fr')],
    }),
    horaires: 'Mo-Fr 09:00-12:00',
    presentation: { resume: 'Un résumé' },
    services: [Service.AideAuxDemarchesAdministratives],
    publicsSpecifiquementAdresses: [],
    priseEnChargeSpecifique: [],
    modalitesAcces: [ModaliteAcces.SePresenter],
    fraisACharge: [Frais.Gratuit],
    itinerance: [Itinerance.Fixe],
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
      new Date('2026-01-01T00:00:00Z'),
    ),
    suppression: { _tag: 'Actif' },
  },
}

describe('appliquer une modification à la fiche du lieu', () => {
  it('date la modification et en nomme l’auteur', () => {
    const modifie = appliquerModification(
      lieu,
      {
        section: 'VisibiliteCartographie',
        visibilite: VisibiliteCartographie('Publie'),
      },
      auteur,
      maintenant,
    )

    expect(modifie.tracabilite.derniereModification).toEqual({
      _tag: 'ParUtilisateur',
      date: maintenant,
      par: auteur,
    })
  })

  it('ne touche à rien d’autre que la visibilité', () => {
    const modifie = appliquerModification(
      lieu,
      {
        section: 'VisibiliteCartographie',
        visibilite: VisibiliteCartographie('Publie'),
      },
      auteur,
      maintenant,
    )

    expect(modifie.visibilite).toBe(VisibiliteCartographie('Publie'))
    expect(modifie.fiche).toEqual(lieu.fiche)
  })

  /**
   * Le contact est partagé entre deux sections : c'est le seul endroit où une
   * section peut effacer le travail d'une autre sans qu'on s'en aperçoive.
   */
  it('préserve téléphone et courriels quand on édite les informations pratiques', () => {
    const modifie = appliquerModification(
      lieu,
      {
        section: 'InformationsPratiques',
        sitesWeb: [Url('https://nouveau.example.fr')],
        ficheAccesLibre: null,
        priseRdv: null,
        horaires: null,
      },
      auteur,
      maintenant,
    )

    expect(modifie.fiche.contact.telephone).toBe('+33180059880')
    expect(modifie.fiche.contact.courriels).toEqual(['contact@example.fr'])
    expect(modifie.fiche.contact.site_web).toEqual([
      'https://nouveau.example.fr',
    ])
  })

  it('préserve les sites web quand on édite les modalités d’accès', () => {
    const modifie = appliquerModification(
      lieu,
      {
        section: 'ModalitesAccesAuService',
        modalitesAcces: [ModaliteAcces.Telephoner],
        telephone: '+33180059881',
        courriels: [],
        fraisACharge: [Frais.Payant],
      },
      auteur,
      maintenant,
    )

    expect(modifie.fiche.contact.site_web).toEqual(['https://www.example.fr'])
    expect(modifie.fiche.contact.telephone).toBe('+33180059881')
    expect(modifie.fiche.contact.courriels).toBeUndefined()
  })

  it('laisse vider un site web, ce que la projection legacy ne permettait pas', () => {
    const modifie = appliquerModification(
      lieu,
      {
        section: 'InformationsPratiques',
        sitesWeb: [],
        ficheAccesLibre: null,
        priseRdv: null,
        horaires: null,
      },
      auteur,
      maintenant,
    )

    expect(modifie.fiche.contact.site_web).toBeUndefined()
    expect(modifie.fiche.horaires).toBeNull()
  })

  it('ne déborde pas d’une section sur les autres', () => {
    const modifie = appliquerModification(
      lieu,
      {
        section: 'ServicesEtAccompagnement',
        services: [Service.LoisirsEtCreationsNumeriques],
        modalitesAccompagnement: [],
      },
      auteur,
      maintenant,
    )

    expect(modifie.fiche.services).toEqual([
      Service.LoisirsEtCreationsNumeriques,
    ])
    expect(modifie.fiche.modalitesAcces).toEqual(lieu.fiche.modalitesAcces)
    expect(modifie.fiche.presentation).toEqual(lieu.fiche.presentation)
    expect(modifie.fiche.typologies).toEqual(lieu.fiche.typologies)
  })
})

describe('modalités d’accès que le formulaire n’exprime pas', () => {
  const avecPriseDeRdv: Lieu = {
    ...lieu,
    fiche: {
      ...lieu.fiche,
      modalitesAcces: [
        ModaliteAcces.SePresenter,
        ModaliteAcces.PrendreRdvEnLigne,
      ],
    },
  }

  it('les conserve quand la section est réenregistrée', () => {
    const modifie = appliquerModification(
      avecPriseDeRdv,
      {
        section: 'ModalitesAccesAuService',
        modalitesAcces: [ModaliteAcces.Telephoner],
        telephone: '+33180059880',
        courriels: [],
        fraisACharge: [],
      },
      auteur,
      maintenant,
    )

    expect(modifie.fiche.modalitesAcces).toEqual([
      ModaliteAcces.Telephoner,
      ModaliteAcces.PrendreRdvEnLigne,
    ])
  })

  it('laisse tout de même retirer celles que le formulaire gouverne', () => {
    const modifie = appliquerModification(
      avecPriseDeRdv,
      {
        section: 'ModalitesAccesAuService',
        modalitesAcces: [],
        telephone: null,
        courriels: [],
        fraisACharge: [],
      },
      auteur,
      maintenant,
    )

    expect(modifie.fiche.modalitesAcces).toEqual([
      ModaliteAcces.PrendreRdvEnLigne,
    ])
  })
})
