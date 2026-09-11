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
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import type { Lieu } from '../../../domain/lieu'
import { LieuId } from '../../../domain/lieu-id'
import { ModificationInconnue } from '../../../domain/tracabilite'
import { UserId } from '../../../domain/user-id'
import { VisibiliteCartographie } from '../../../domain/visibilite-cartographie'
import { differences } from './differences'
import { resoudreLesDifferences } from './resoudre-les-differences'

const maintenant = new Date('2026-09-11T11:00:00Z')
const auteur = UserId('550e8400-e29b-41d4-a716-446655440001')

const fiche = (ajustements: Partial<Fiche>): Fiche => ({
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
  ...ajustements,
})

const lieuDuRegistre = (ficheDuRegistre: Fiche): Lieu => ({
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
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
})

const resoudre = (
  ficheCoop: Fiche,
  ficheDuRegistre: Fiche,
  choix: Parameters<typeof resoudreLesDifferences>[0]['choix'],
): Lieu => {
  const lieu = lieuDuRegistre(ficheDuRegistre)

  return resoudreLesDifferences({
    lieu,
    ficheCoop,
    ecarts: differences(ficheCoop, ficheDuRegistre),
    choix,
    par: auteur,
    maintenant,
  })
}

describe('résoudre les différences entre la fiche coop et celle du registre', () => {
  it('reprend la valeur de la coop pour le champ qu’on lui confie', () => {
    const resolu = resoudre(
      fiche({ nom: Nom('Espace numérique de Reims') }),
      fiche({ nom: Nom('Tiers-lieu de Reims') }),
      { nom: 'coop' },
    )

    expect(resolu.fiche.nom).toBe('Espace numérique de Reims')
  })

  it('garde la valeur du registre pour le champ qu’on lui laisse', () => {
    const resolu = resoudre(
      fiche({ nom: Nom('Espace numérique de Reims') }),
      fiche({ nom: Nom('Tiers-lieu de Reims') }),
      { nom: 'registre' },
    )

    expect(resolu.fiche.nom).toBe('Tiers-lieu de Reims')
  })

  it('garde la valeur du registre pour le champ dont personne n’a tranché', () => {
    const resolu = resoudre(
      fiche({ nom: Nom('Espace numérique de Reims'), horaires: 'Mo-Fr 08:00' }),
      fiche({ nom: Nom('Tiers-lieu de Reims'), horaires: 'Mo-Fr 09:00' }),
      { nom: 'coop' },
    )

    expect(resolu.fiche.horaires).toBe('Mo-Fr 09:00')
  })

  it('ne reprend rien d’un champ que les deux fiches disent pareil', () => {
    const resolu = resoudre(
      fiche({ services: [Service.AideAuxDemarchesAdministratives] }),
      fiche({ services: [Service.AideAuxDemarchesAdministratives] }),
      { services: 'coop' },
    )

    expect(resolu.fiche).toEqual(lieuDuRegistre(fiche({})).fiche)
  })

  it('date la résolution et en nomme l’auteur', () => {
    const resolu = resoudre(
      fiche({ nom: Nom('Espace numérique de Reims') }),
      fiche({ nom: Nom('Tiers-lieu de Reims') }),
      { nom: 'coop' },
    )

    expect(resolu.tracabilite.derniereModification).toEqual({
      _tag: 'ParUtilisateur',
      date: maintenant,
      par: auteur,
    })
  })
})
