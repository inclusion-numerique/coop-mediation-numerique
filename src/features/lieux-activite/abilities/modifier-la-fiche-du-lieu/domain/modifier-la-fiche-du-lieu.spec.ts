import {
  Adresse,
  Contact,
  Courriel,
  DispositifProgrammesNationaux,
  FormationLabel,
  FormationsLabels,
  Frais,
  FraisACharge,
  Horaires,
  Itinerance,
  Itinerances,
  ModaliteAcces,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  Pivot,
  Presentation,
  PriseEnChargeSpecifique,
  PrisesEnChargeSpecifiques,
  PublicSpecifiquementAdresse,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Telephone,
  Typologie,
  Typologies,
  Url,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import type { Result } from '@/libraries/result'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import { NomUsage } from '../../../domain/identite-sirene'
import type { Lieu } from '../../../domain/lieu'
import { NombreDActivites, NombreDeMediateurs } from '../../../domain/nombres'
import { SERVICES_PAR_DEFAUT } from '../../../domain/registre/publication'
import {
  ModificationInconnue,
  ModifieParUtilisateur,
} from '../../../domain/registre/tracabilite'
import type { SectionsEnregistrees } from '../../../domain/sections-enregistrees'
import type { EchecDeModifierLaFicheDuLieu } from './errors'
import type { FicheDuLieu } from './fiche-du-lieu'
import type { Modification, ModificationLieu } from './modification-lieu'
import { modifierLaFicheDuLieu } from './modifier-la-fiche-du-lieu'

const id = LieuId('550e8400-e29b-41d4-a716-446655440000')
const maintenant = new Date('2026-09-11T11:00:00Z')
const auteur = UtilisateurId('550e8400-e29b-41d4-a716-446655440001')

const sansAdresseChoisie: Lieu = {
  id,
  fiche: {
    nom: Nom('Espace numérique'),
    pivot: null,
    adresse: Adresse({
      voie: '12 rue de la Paix',
      commune: 'Reims',
      code_postal: '51100',
    }),
    localisation: null,
    typologies: Typologies([]),
    contact: Contact({}),
    horaires: null,
    presentation: null,
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

const avecAdresseChoisie: Lieu = {
  ...sansAdresseChoisie,
  banId: BanId('51454_1234_00012'),
}

const publieAvecAdresse: Lieu = {
  ...avecAdresseChoisie,
  visibilite: VisibiliteCartographie('Publie'),
}

const publieSansAdresseNiService: Lieu = {
  ...sansAdresseChoisie,
  fiche: { ...sansAdresseChoisie.fiche, services: Services([]) },
  visibilite: VisibiliteCartographie('Publie'),
}

const modifiee: Lieu['tracabilite'] = {
  ...sansAdresseChoisie.tracabilite,
  derniereModification: ModifieParUtilisateur(maintenant, auteur),
}

const fiche: FicheDuLieu = {
  lieu: sansAdresseChoisie,
  auteurDerniereModification: null,
  derniereModificationCoop: new Date('2026-06-01T00:00:00Z'),
  ficheCoop: sansAdresseChoisie.fiche,
  partage: {
    autresMediateurs: NombreDeMediateurs(0),
    activites: NombreDActivites(0),
  },
}

const publication: ModificationLieu = {
  section: 'VisibiliteCartographie',
  visibilite: VisibiliteCartographie('Publie'),
}

const retrait: ModificationLieu = {
  section: 'VisibiliteCartographie',
  visibilite: VisibiliteCartographie('NonPublie'),
}

const description: ModificationLieu = {
  section: 'Description',
  presentation: null,
  formationsLabels: FormationsLabels([]),
}

const servicesRetires: ModificationLieu = {
  section: 'ServicesEtAccompagnement',
  services: Services([]),
  modalitesAccompagnement: ModalitesAccompagnement([]),
}

const servicesConserves: ModificationLieu = {
  section: 'ServicesEtAccompagnement',
  services: Services([Service.AideAuxDemarchesAdministratives]),
  modalitesAccompagnement: ModalitesAccompagnement([]),
}

const enregistrer = async () => undefined

describe('modifier la fiche d’un lieu', () => {
  it('refuse de modifier une fiche introuvable', async () => {
    expect(
      await modifierLaFicheDuLieu({
        consulter: async () => null,
        enregistrer,
      })({ id, modification: description, par: auteur, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'FicheIntrouvable', id } })
  })

  it.each<{
    cas: string
    lieu: Lieu
    modification: ModificationLieu
    attendu: Result<SectionsEnregistrees, EchecDeModifierLaFicheDuLieu>
  }>([
    {
      cas: 'refuse de publier un lieu dont l’adresse n’a pas été choisie',
      lieu: sansAdresseChoisie,
      modification: publication,
      attendu: {
        success: false,
        error: { _tag: 'PublicationSansAdresse', id },
      },
    },
    {
      cas: 'publie un lieu dont l’adresse a été choisie',
      lieu: avecAdresseChoisie,
      modification: publication,
      attendu: {
        success: true,
        data: {
          _tag: 'Enregistree',
          lieu: { ...publieAvecAdresse, tracabilite: modifiee },
          sections: ['VisibiliteCartographie'],
        },
      },
    },
    {
      cas: 'laisse retirer de la carte un lieu sans adresse choisie',
      lieu: {
        ...sansAdresseChoisie,
        visibilite: VisibiliteCartographie('Publie'),
      },
      modification: retrait,
      attendu: {
        success: true,
        data: {
          _tag: 'Enregistree',
          lieu: { ...sansAdresseChoisie, tracabilite: modifiee },
          sections: ['VisibiliteCartographie'],
        },
      },
    },
    {
      cas: 'refuse de retirer tous les services d’un lieu publié',
      lieu: publieAvecAdresse,
      modification: servicesRetires,
      attendu: {
        success: false,
        error: { _tag: 'PublicationSansService', id },
      },
    },
    {
      cas: 'accepte un lieu publié qui garde un service',
      lieu: publieAvecAdresse,
      modification: servicesConserves,
      attendu: {
        success: true,
        data: {
          _tag: 'Enregistree',
          lieu: { ...publieAvecAdresse, tracabilite: modifiee },
          sections: ['ServicesEtAccompagnement'],
        },
      },
    },
    {
      cas: 'laisse sans service un lieu qui n’est pas publié',
      lieu: sansAdresseChoisie,
      modification: servicesRetires,
      attendu: {
        success: true,
        data: {
          _tag: 'Enregistree',
          lieu: {
            ...sansAdresseChoisie,
            fiche: { ...sansAdresseChoisie.fiche, services: Services([]) },
            tracabilite: modifiee,
          },
          sections: ['ServicesEtAccompagnement'],
        },
      },
    },
    {
      cas: 'ne vérifie ni l’adresse ni les services quand une autre section est modifiée',
      lieu: publieSansAdresseNiService,
      modification: description,
      attendu: {
        success: true,
        data: {
          _tag: 'Enregistree',
          lieu: { ...publieSansAdresseNiService, tracabilite: modifiee },
          sections: ['Description'],
        },
      },
    },
  ])('$cas', async ({ lieu, modification, attendu }) => {
    expect(
      await modifierLaFicheDuLieu({
        consulter: async () => ({ ...fiche, lieu }),
        enregistrer,
      })({ id, modification, par: auteur, maintenant }),
    ).toEqual(attendu)
  })
})

const renseigne: Lieu = {
  ...avecAdresseChoisie,
  fiche: {
    ...avecAdresseChoisie.fiche,
    typologies: Typologies([Typologie.BIB]),
    contact: Contact({
      telephone: '+33180059880',
      courriels: [Courriel('contact@example.fr')],
      site_web: [Url('https://www.example.fr')],
    }),
    horaires: Horaires('Mo-Fr 09:00-12:00'),
    presentation: Presentation({ resume: 'Un résumé' }),
    modalitesAcces: ModalitesAcces([
      ModaliteAcces.SePresenter,
      ModaliteAcces.PrendreRdvEnLigne,
    ]),
    fraisACharge: FraisACharge([Frais.Gratuit]),
    itinerance: Itinerances([Itinerance.Fixe]),
  },
}

const immatricule: Lieu = {
  ...renseigne,
  fiche: { ...renseigne.fiche, pivot: Pivot('13002603200016') },
  identiteSirene: {
    nomUsage: NomUsage('La Maison du Port'),
    synchronisation: new Date('2026-08-01T00:00:00Z'),
  },
}

const informationsGenerales: Omit<
  Modification<'InformationsGenerales'>,
  'pivot'
> = {
  section: 'InformationsGenerales',
  nom: Nom('La Maison du Port'),
  adresse: renseigne.fiche.adresse,
  localisation: null,
  banId: BanId('51454_1234_00012'),
  itinerance: Itinerances([Itinerance.Fixe]),
  typologies: Typologies([Typologie.BIB]),
  nomUsage: NomUsage('La Maison du Port'),
}

describe('ce que la modification d’une section change au lieu', () => {
  it.each<{
    cas: string
    lieu: Lieu
    modification: ModificationLieu
    attendu: Lieu
  }>([
    {
      cas: 'donne les services du socle à un lieu publié qui n’en annonçait aucun',
      lieu: {
        ...renseigne,
        fiche: { ...renseigne.fiche, services: Services([]) },
      },
      modification: publication,
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          services: Services([...SERVICES_PAR_DEFAUT]),
        },
        visibilite: VisibiliteCartographie('Publie'),
        tracabilite: modifiee,
      },
    },
    {
      cas: 'n’ajoute aucun service par défaut à un lieu retiré de la carte',
      lieu: {
        ...renseigne,
        fiche: { ...renseigne.fiche, services: Services([]) },
        visibilite: VisibiliteCartographie('Publie'),
      },
      modification: retrait,
      attendu: {
        ...renseigne,
        fiche: { ...renseigne.fiche, services: Services([]) },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'préserve téléphone et courriels quand on édite les informations pratiques',
      lieu: renseigne,
      modification: {
        section: 'InformationsPratiques',
        sitesWeb: [Url('https://nouveau.example.fr')],
        ficheAccesLibre: null,
        priseRdv: null,
        horaires: Horaires('Mo-Sa 10:00-18:00'),
      },
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          contact: Contact({
            telephone: '+33180059880',
            courriels: [Courriel('contact@example.fr')],
            site_web: [Url('https://nouveau.example.fr')],
          }),
          horaires: Horaires('Mo-Sa 10:00-18:00'),
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'laisse vider un site web, ce que la projection legacy ne permettait pas',
      lieu: renseigne,
      modification: {
        section: 'InformationsPratiques',
        sitesWeb: [],
        ficheAccesLibre: null,
        priseRdv: null,
        horaires: null,
      },
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          contact: Contact({
            telephone: '+33180059880',
            courriels: [Courriel('contact@example.fr')],
          }),
          horaires: null,
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'préserve les sites web et les modalités venues d’ailleurs quand on édite les modalités d’accès',
      lieu: renseigne,
      modification: {
        section: 'ModalitesAccesAuService',
        modalitesAcces: ModalitesAcces([ModaliteAcces.Telephoner]),
        telephone: Telephone('+33180059881'),
        courriels: [],
        fraisACharge: FraisACharge([Frais.Payant]),
      },
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          contact: Contact({
            telephone: '+33180059881',
            site_web: [Url('https://www.example.fr')],
          }),
          modalitesAcces: ModalitesAcces([
            ModaliteAcces.Telephoner,
            ModaliteAcces.PrendreRdvEnLigne,
          ]),
          fraisACharge: FraisACharge([Frais.Payant]),
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'enregistre les courriels saisis et laisse retirer les modalités que le formulaire gouverne',
      lieu: renseigne,
      modification: {
        section: 'ModalitesAccesAuService',
        modalitesAcces: ModalitesAcces([]),
        telephone: null,
        courriels: [Courriel('accueil@example.fr')],
        fraisACharge: FraisACharge([]),
      },
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          contact: Contact({
            courriels: [Courriel('accueil@example.fr')],
            site_web: [Url('https://www.example.fr')],
          }),
          modalitesAcces: ModalitesAcces([ModaliteAcces.PrendreRdvEnLigne]),
          fraisACharge: FraisACharge([]),
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'enregistre la description sans toucher au reste',
      lieu: renseigne,
      modification: {
        section: 'Description',
        presentation: Presentation({ resume: 'Un nouveau résumé' }),
        formationsLabels: FormationsLabels([
          FormationLabel.FabriquesDeTerritoire,
        ]),
      },
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          presentation: Presentation({ resume: 'Un nouveau résumé' }),
          formationsLabels: FormationsLabels([
            FormationLabel.FabriquesDeTerritoire,
          ]),
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'enregistre les publics accueillis sans toucher au reste',
      lieu: renseigne,
      modification: {
        section: 'TypesDePublicsAccueillis',
        publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([
          PublicSpecifiquementAdresse.Jeunes,
        ]),
        priseEnChargeSpecifique: PrisesEnChargeSpecifiques([
          PriseEnChargeSpecifique.Surdite,
        ]),
      },
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([
            PublicSpecifiquementAdresse.Jeunes,
          ]),
          priseEnChargeSpecifique: PrisesEnChargeSpecifiques([
            PriseEnChargeSpecifique.Surdite,
          ]),
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'ne déborde pas des services sur les autres sections',
      lieu: renseigne,
      modification: {
        section: 'ServicesEtAccompagnement',
        services: Services([Service.LoisirsEtCreationsNumeriques]),
        modalitesAccompagnement: ModalitesAccompagnement([]),
      },
      attendu: {
        ...renseigne,
        fiche: {
          ...renseigne.fiche,
          services: Services([Service.LoisirsEtCreationsNumeriques]),
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'garde la date de vérification SIRENE tant que le pivot ne bouge pas',
      lieu: immatricule,
      modification: {
        ...informationsGenerales,
        pivot: Pivot('13002603200016'),
      },
      attendu: {
        ...immatricule,
        fiche: { ...immatricule.fiche, nom: Nom('La Maison du Port') },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'efface la date de vérification SIRENE quand le pivot change',
      lieu: immatricule,
      modification: {
        ...informationsGenerales,
        pivot: Pivot('81031049400010'),
      },
      attendu: {
        ...immatricule,
        fiche: {
          ...immatricule.fiche,
          nom: Nom('La Maison du Port'),
          pivot: Pivot('81031049400010'),
        },
        identiteSirene: {
          nomUsage: NomUsage('La Maison du Port'),
          synchronisation: null,
        },
        tracabilite: modifiee,
      },
    },
    {
      cas: 'efface la date de vérification SIRENE quand le pivot disparaît',
      lieu: immatricule,
      modification: { ...informationsGenerales, pivot: null },
      attendu: {
        ...immatricule,
        fiche: {
          ...immatricule.fiche,
          nom: Nom('La Maison du Port'),
          pivot: null,
        },
        identiteSirene: {
          nomUsage: NomUsage('La Maison du Port'),
          synchronisation: null,
        },
        tracabilite: modifiee,
      },
    },
  ])('$cas', async ({ lieu, modification, attendu }) => {
    expect(
      await modifierLaFicheDuLieu({
        consulter: async () => ({ ...fiche, lieu }),
        enregistrer,
      })({ id, modification, par: auteur, maintenant }),
    ).toEqual({
      success: true,
      data: {
        _tag: 'Enregistree',
        lieu: attendu,
        sections: [modification.section],
      },
    })
  })
})
