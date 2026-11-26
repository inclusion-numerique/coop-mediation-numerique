import {
  Adresse,
  Contact,
  Courriel,
  DispositifProgrammesNationaux,
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
  Presentation,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Typologie,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import type { Result } from '@/libraries/result'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Fiche } from '../../../domain/fiche'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'
import { NombreDActivites, NombreDeMediateurs } from '../../../domain/nombres'
import {
  ModificationInconnue,
  ModifieParUtilisateur,
} from '../../../domain/registre/tracabilite'
import { appliquerLesDifferences } from './appliquer-les-differences'
import type { ChoixDesDifferences } from './differences'
import type { EchecDeModification } from './errors'
import type { FicheDuLieu } from './fiche-du-lieu'

const id = LieuId('550e8400-e29b-41d4-a716-446655440000')
const maintenant = new Date('2026-09-11T11:00:00Z')
const auteur = UtilisateurId('550e8400-e29b-41d4-a716-446655440001')

const ficheDuRegistre: Fiche = {
  nom: Nom('Tiers-lieu de Reims'),
  pivot: null,
  adresse: Adresse({
    voie: '12 rue de la Paix',
    commune: 'Reims',
    code_postal: '51100',
  }),
  localisation: null,
  typologies: Typologies([Typologie.BIB]),
  contact: Contact({
    telephone: '+33180059880',
    courriels: [Courriel('contact@example.fr')],
  }),
  horaires: Horaires('Mo-Fr 09:00-12:00'),
  presentation: Presentation({ resume: 'Un résumé' }),
  services: Services([Service.AideAuxDemarchesAdministratives]),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([]),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques([]),
  modalitesAcces: ModalitesAcces([ModaliteAcces.SePresenter]),
  fraisACharge: FraisACharge([Frais.Gratuit]),
  itinerance: Itinerances([Itinerance.Fixe]),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
  formationsLabels: FormationsLabels([]),
  autresFormationsLabels: [],
  modalitesAccompagnement: ModalitesAccompagnement([]),
  ficheAccesLibre: null,
  priseRdv: null,
}

const ficheCoop: Fiche = {
  ...ficheDuRegistre,
  nom: Nom('Espace numérique de Reims'),
  horaires: Horaires('Mo-Fr 08:00-12:00'),
}

const lieu: Lieu = {
  id,
  fiche: ficheDuRegistre,
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

const fiche: FicheDuLieu = {
  lieu,
  auteurDerniereModification: null,
  derniereModificationCoop: new Date('2026-06-01T00:00:00Z'),
  ficheCoop,
  partage: {
    autresMediateurs: NombreDeMediateurs(0),
    activites: NombreDActivites(0),
  },
}

const resolu: Lieu['tracabilite'] = {
  ...lieu.tracabilite,
  derniereModification: ModifieParUtilisateur(maintenant, auteur),
}

const enregistrer = async () => undefined

describe('appliquer les différences entre la fiche coop et celle du registre', () => {
  it('refuse d’appliquer les différences d’une fiche introuvable', async () => {
    expect(
      await appliquerLesDifferences({
        consulter: async () => null,
        enregistrer,
      })({ id, choix: {}, par: auteur, maintenant }),
    ).toEqual({ success: false, error: { _tag: 'FicheIntrouvable', id } })
  })

  it.each<{
    cas: string
    consultee: FicheDuLieu
    choix: ChoixDesDifferences
    attendu: Result<Lieu, EchecDeModification>
  }>([
    {
      cas: 'rend le lieu tel quel quand les deux fiches disent pareil',
      consultee: { ...fiche, ficheCoop: ficheDuRegistre },
      choix: { nom: 'coop' },
      attendu: { success: true, data: lieu },
    },
    {
      cas: 'reprend la valeur de la coop pour le champ qu’on lui confie',
      consultee: fiche,
      choix: { nom: 'coop', horaires: 'coop' },
      attendu: {
        success: true,
        data: { ...lieu, fiche: ficheCoop, tracabilite: resolu },
      },
    },
    {
      cas: 'garde la valeur du registre pour le champ qu’on lui laisse',
      consultee: fiche,
      choix: { nom: 'registre', horaires: 'registre' },
      attendu: { success: true, data: { ...lieu, tracabilite: resolu } },
    },
    {
      cas: 'garde la valeur du registre pour le champ dont personne n’a tranché',
      consultee: fiche,
      choix: { nom: 'coop' },
      attendu: {
        success: true,
        data: {
          ...lieu,
          fiche: { ...ficheDuRegistre, nom: Nom('Espace numérique de Reims') },
          tracabilite: resolu,
        },
      },
    },
  ])('$cas', async ({ consultee, choix, attendu }) => {
    expect(
      await appliquerLesDifferences({
        consulter: async () => consultee,
        enregistrer,
      })({ id, choix, par: auteur, maintenant }),
    ).toEqual(attendu)
  })
})
