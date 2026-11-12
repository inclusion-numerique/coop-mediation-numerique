import {
  ActiviteId,
  AdresseDuLieu,
  type AffichageDeLActivite,
  type AtelierCollectif,
  aucuneParticipationAnonyme,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  LieuActiviteId,
  MediateurId,
  NiveauDAtelier,
  NomDeFamille,
  NomDeStructure,
  Prenom,
  participantsAnonymesDe,
  ThematiqueDeMediation,
  TitreDAtelier,
} from '../../../domain'
import { EnregistrerUnAtelierCollectifValidation } from '../action/enregistrer-un-atelier-collectif.validation'
import { formulaireDeLAtelierCollectif } from './formulaire-de-l-atelier-collectif.presenter'
import { saisieDeLAtelierCollectif } from './saisie-du-formulaire.presenter'
import { CraCollectifValidation } from './validation/CraCollectifValidation'

const instant = new Date('2026-11-10T09:00:00.000Z')

const anonymes = participantsAnonymesDe({
  ...aucuneParticipationAnonyme,
  total: Effectif(4),
  dejaAccompagnes: Effectif(1),
  genres: { masculin: Effectif(1), feminin: Effectif(2) },
})

const camille = BeneficiaireId('e0000000-0000-4000-8000-000000000001')

const atelier = (): AtelierCollectif => {
  if (!anonymes.success) throw new Error(anonymes.error._tag)
  return {
    _tag: 'Collectif',
    id: ActiviteId('b0000000-0000-4000-8000-000000000001'),
    mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
    date: DateDActivite('2026-11-10'),
    duree: DureeEnMinutes(120),
    lieu: {
      _tag: 'LieuActivite',
      lieuActiviteId: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
    },
    thematiques: {
      mediation: [ThematiqueDeMediation('Email')],
      demarche: null,
    },
    equipement: { _tag: 'AucunMateriel' },
    tags: [],
    notes: null,
    origine: { _tag: 'Saisie' },
    employeuse: null,
    creation: instant,
    modification: instant,
    titre: TitreDAtelier('Découvrir sa messagerie'),
    niveau: NiveauDAtelier('Debutant'),
    participants: { suivis: [camille], anonymes: anonymes.data },
  }
}

const affichage: AffichageDeLActivite = {
  lieu: {
    id: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
    nom: NomDeStructure('Médiathèque'),
    adresse: AdresseDuLieu('3 rue de la République, 69001 Lyon'),
  },
  suivis: [
    {
      id: camille,
      prenom: Prenom('Camille'),
      nom: NomDeFamille('Martin'),
      residence: Commune({
        nom: 'Lyon',
        codePostal: '69001',
        codeInsee: '69123',
      }),
    },
  ],
  tags: [],
}

describe('formulaire d’un atelier collectif', () => {
  it('rouvre un atelier et le réenregistre à l’identique', () => {
    const rouvert = atelier()
    const saisie = EnregistrerUnAtelierCollectifValidation.parse(
      saisieDeLAtelierCollectif(
        CraCollectifValidation.parse(
          formulaireDeLAtelierCollectif(rouvert, affichage),
        ),
      ),
    )
    expect(saisie).toEqual({
      id: rouvert.id,
      date: rouvert.date,
      duree: rouvert.duree,
      lieu: rouvert.lieu,
      thematiques: rouvert.thematiques,
      equipement: rouvert.equipement,
      tags: [],
      notes: null,
      rdvId: null,
      titre: rouvert.titre,
      niveau: rouvert.niveau,
      suivis: [camille],
      anonymes: rouvert.participants.anonymes,
    })
  })
})
