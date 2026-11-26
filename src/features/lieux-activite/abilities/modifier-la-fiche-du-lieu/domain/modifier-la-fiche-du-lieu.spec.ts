import {
  Adresse,
  Contact,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import type { Result } from '@/libraries/result'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'
import { NombreDActivites, NombreDeMediateurs } from '../../../domain/nombres'
import {
  ModificationInconnue,
  ModifieParUtilisateur,
} from '../../../domain/registre/tracabilite'
import type { EchecDeModifierLaFicheDuLieu } from './errors'
import type { FicheDuLieu } from './fiche-du-lieu'
import type { ModificationLieu } from './modification-lieu'
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
    attendu: Result<Lieu, EchecDeModifierLaFicheDuLieu>
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
        data: { ...publieAvecAdresse, tracabilite: modifiee },
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
        data: { ...sansAdresseChoisie, tracabilite: modifiee },
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
        data: { ...publieAvecAdresse, tracabilite: modifiee },
      },
    },
    {
      cas: 'laisse sans service un lieu qui n’est pas publié',
      lieu: sansAdresseChoisie,
      modification: servicesRetires,
      attendu: {
        success: true,
        data: {
          ...sansAdresseChoisie,
          fiche: { ...sansAdresseChoisie.fiche, services: Services([]) },
          tracabilite: modifiee,
        },
      },
    },
    {
      cas: 'ne vérifie ni l’adresse ni les services quand une autre section est modifiée',
      lieu: publieSansAdresseNiService,
      modification: description,
      attendu: {
        success: true,
        data: { ...publieSansAdresseNiService, tracabilite: modifiee },
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
