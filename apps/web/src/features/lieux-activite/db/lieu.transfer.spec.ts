import {
  Adresse,
  Contact,
  Courriel,
  DispositifProgrammeNational,
  FormationLabel,
  Frais,
  Itinerance,
  Localisation,
  ModaliteAcces,
  ModaliteAccompagnement,
  Nom,
  Pivot,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuInclusion } from '@prisma/client'
import { BanId } from '../domain/ban-id'
import { NomUsage } from '../domain/identite-sirene'
import { IdsCartographieNationale } from '../domain/ids-cartographie-nationale'
import type { Lieu } from '../domain/lieu'
import { LieuId } from '../domain/lieu-id'
import {
  ModificationInconnue,
  ModifieParSource,
  ModifieParUtilisateur,
  SourceCartographie,
} from '../domain/tracabilite'
import { UserId } from '../domain/user-id'
import { VisibiliteCartographie } from '../domain/visibilite-cartographie'
import { lieuFromDomain, lieuToDomain } from './lieu.transfer'

const creation = new Date('2026-01-15T09:00:00Z')
const modification = new Date('2026-08-20T14:30:00Z')

const id = LieuId('550e8400-e29b-41d4-a716-446655440000')
const auteur = UserId('550e8400-e29b-41d4-a716-446655440001')

/** Les colonnes que le domaine ne porte pas : lignage v1, compteur, référent. */
const horsDomaine = {
  nomReferent: null,
  courrielReferent: null,
  telephoneReferent: null,
  v1Imported: null,
  v1StructureId: null,
  v1StructureIdPg: null,
  v1PermanenceId: null,
  activitesCount: 0,
}

const ligne = (lieu: Lieu): LieuInclusion => ({
  ...lieuFromDomain(lieu),
  ...horsDomaine,
})

const minimal: Lieu = {
  id,
  fiche: {
    nom: Nom('Espace numérique'),
    pivot: null,
    adresse: null,
    localisation: null,
    typologies: [],
    contact: Contact({}),
    horaires: null,
    presentation: null,
    structureParente: null,
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
    creation: { date: creation, par: null },
    derniereModification: ModificationInconnue(modification),
    suppression: { _tag: 'Actif' },
  },
}

const maximal: Lieu = {
  id,
  fiche: {
    nom: Nom('La Quincaillerie numérique'),
    pivot: Pivot('55217862900132'),
    adresse: Adresse({
      voie: '12 BIS RUE DE LECLERCQ',
      commune: 'Reims',
      code_postal: '51100',
      code_insee: '51454',
      complement_adresse: 'Le patio du bois de l’Aulne',
    }),
    localisation: Localisation({ latitude: 43.52609, longitude: 5.41423 }),
    typologies: [Typologie.BIB, Typologie.CCAS],
    contact: Contact({
      telephone: '+33180059880',
      courriels: [Courriel('contact@example.fr')],
      site_web: [
        Url('https://www.example.fr'),
        Url('https://autre.example.fr'),
      ],
    }),
    horaires: 'Mo-Fr 09:00-12:00,14:00-18:30; Sa 08:30-12:00',
    presentation: { resume: 'Un résumé', detail: 'Un détail plus long' },
    structureParente: 'Ville de Reims',
    services: [
      Service.AideAuxDemarchesAdministratives,
      Service.MaterielInformatiqueAPrixSolidaire,
    ],
    publicsSpecifiquementAdresses: [
      PublicSpecifiquementAdresse.Jeunes,
      PublicSpecifiquementAdresse.Femmes,
    ],
    priseEnChargeSpecifique: [PriseEnChargeSpecifique.Surdite],
    modalitesAcces: [
      ModaliteAcces.SePresenter,
      ModaliteAcces.PrescriptionParMail,
    ],
    fraisACharge: [Frais.GratuitSousCondition],
    itinerance: [Itinerance.Itinerant],
    dispositifProgrammesNationaux: [
      DispositifProgrammeNational.CertificationPIX,
      DispositifProgrammeNational.PointNumeriqueCAF,
    ],
    formationsLabels: [FormationLabel.FormeAMonEspaceSante],
    autresFormationsLabels: ['Label et la bête'],
    modalitesAccompagnement: [ModaliteAccompagnement.DansUnAtelier],
    ficheAccesLibre: Url('https://acceslibre.beta.gouv.fr/app/erp/mediatheque'),
    priseRdv: Url('https://rdv.anct.gouv.fr/'),
  },
  visibilite: VisibiliteCartographie('Publie'),
  idsCartographieNationale: IdsCartographieNationale(
    'Coop-numérique_42e98a9e-d1a0-49ec-882a-8676af182a47__Numi_7a063bb1',
  ),
  banId: BanId('80144_0018_00090'),
  identiteSirene: {
    nomUsage: NomUsage('LA QUINCAILLERIE'),
    synchronisation: modification,
  },
  tracabilite: {
    creation: { date: creation, par: auteur },
    derniereModification: ModifieParSource(
      modification,
      SourceCartographie('dora'),
    ),
    suppression: { _tag: 'Actif' },
  },
}

describe('transfer du lieu', () => {
  it('conserve un lieu minimal', () => {
    expect(lieuToDomain(ligne(minimal))).toEqual(minimal)
  })

  it('conserve un lieu complet', () => {
    expect(lieuToDomain(ligne(maximal))).toEqual(maximal)
  })

  it('conserve un pivot RNA', () => {
    const parRna: Lieu = {
      ...minimal,
      fiche: { ...minimal.fiche, pivot: Pivot('W123456789') },
    }

    expect(lieuToDomain(ligne(parRna))).toEqual(parRna)
  })

  it('conserve une modification par un utilisateur', () => {
    const parUtilisateur: Lieu = {
      ...minimal,
      tracabilite: {
        ...minimal.tracabilite,
        derniereModification: ModifieParUtilisateur(modification, auteur),
      },
    }

    expect(lieuToDomain(ligne(parUtilisateur))).toEqual(parUtilisateur)
  })

  it('conserve un lieu supprimé', () => {
    const supprime: Lieu = {
      ...minimal,
      tracabilite: {
        ...minimal.tracabilite,
        suppression: { _tag: 'Supprime', date: modification, par: auteur },
      },
    }

    expect(lieuToDomain(ligne(supprime))).toEqual(supprime)
  })

  it('conserve les tokens multiples de la cartographie nationale', () => {
    expect(lieuToDomain(ligne(maximal)).idsCartographieNationale).toHaveLength(
      2,
    )
  })

  describe('pertes assumées à la relecture de la base', () => {
    it('écarte une adresse que le schéma national refuse', () => {
      const nonDiffusible: LieuInclusion = {
        ...ligne(maximal),
        adresse: '[Non-Diffusible]',
      }

      expect(lieuToDomain(nonDiffusible).fiche.adresse).toBeNull()
    })

    it('écarte une adresse dont le code postal est vide', () => {
      const sansCodePostal: LieuInclusion = {
        ...ligne(maximal),
        codePostal: '',
      }

      expect(lieuToDomain(sansCodePostal).fiche.adresse).toBeNull()
    })

    it('ne retient que les sites web que le standard reconnaît', () => {
      const siteWebMixte: LieuInclusion = {
        ...ligne(maximal),
        siteWeb: 'https://www.example.fr|pas une url du tout',
      }

      expect(lieuToDomain(siteWebMixte).fiche.contact.site_web).toEqual([
        'https://www.example.fr',
      ])
    })

    it('écarte un téléphone que le standard refuse', () => {
      const telephoneEtranger: LieuInclusion = {
        ...ligne(maximal),
        telephone: '+49 30 901820',
      }

      expect(
        lieuToDomain(telephoneEtranger).fiche.contact.telephone,
      ).toBeUndefined()
    })
  })
})
