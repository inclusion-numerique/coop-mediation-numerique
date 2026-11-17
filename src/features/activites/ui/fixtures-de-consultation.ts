import {
  type ActiviteConsultee,
  ActiviteId,
  aucuneParticipationAnonyme,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Effectif,
  LienAgent,
  MediateurId,
  NomDeFamille,
  NomDeTag,
  Notes,
  Prenom,
  participantsAnonymesDe,
  RdvId,
  StatutDeRendezVous,
  TagId,
  ThematiqueAdministrative,
  ThematiqueDeMediation,
  TitreDAtelier,
} from '../domain'

const instant = new Date('2026-03-03T10:15:00.000Z')
const suivi = BeneficiaireId('b0000000-0000-4000-8000-000000000001')

const anonymes = participantsAnonymesDe({
  ...aucuneParticipationAnonyme,
  total: Effectif(3),
  dejaAccompagnes: Effectif(1),
  genres: { masculin: Effectif(1), feminin: Effectif(2) },
})

export const accompagnementSuivi = (): ActiviteConsultee => ({
  activite: {
    _tag: 'Individuel',
    id: ActiviteId('a0000000-0000-4000-8000-000000000001'),
    mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
    date: DateDActivite('2026-03-03'),
    duree: DureeEnMinutes(90),
    lieu: {
      _tag: 'Domicile',
      commune: Commune({
        nom: 'Bourges',
        codePostal: '18000',
        codeInsee: '18033',
      }),
    },
    thematiques: {
      mediation: [
        ThematiqueDeMediation('Email'),
        ThematiqueDeMediation('Sante'),
      ],
      demarche: {
        thematiques: [ThematiqueAdministrative('SocialSante')],
        precision: null,
      },
    },
    equipement: { _tag: 'AucunMateriel' },
    tags: [TagId('d0000000-0000-4000-8000-000000000001')],
    notes: Notes('<p>Notes</p>'),
    origine: { _tag: 'RendezVous', rdvId: RdvId(42) },
    employeuse: null,
    creation: instant,
    modification: instant,
    beneficiaire: { _tag: 'Suivi', id: suivi },
    autonomie: null,
    orientation: { _tag: 'NonRenseignee' },
  },
  affichage: {
    lieu: null,
    suivis: [
      {
        id: suivi,
        prenom: Prenom('Camille'),
        nom: NomDeFamille('Martin'),
        residence: null,
        nombreDActivites: Effectif(1),
      },
    ],
    tags: [
      {
        id: TagId('d0000000-0000-4000-8000-000000000001'),
        nom: NomDeTag('Réseau'),
      },
    ],
    rendezVous: {
      statut: StatutDeRendezVous('Honore'),
      lienAgent: LienAgent('https://rdv.anct.gouv.fr/admin/rdvs/42'),
    },
  },
})

export const atelierMixte = (): ActiviteConsultee => {
  if (!anonymes.success) throw new Error(anonymes.error._tag)
  return {
    activite: {
      _tag: 'Collectif',
      id: ActiviteId('a0000000-0000-4000-8000-000000000002'),
      mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
      date: DateDActivite('2026-03-05'),
      duree: DureeEnMinutes(120),
      lieu: { _tag: 'ADistance', communeDeRattachement: null },
      thematiques: {
        mediation: [ThematiqueDeMediation('Email')],
        demarche: null,
      },
      equipement: { _tag: 'NonRenseigne' },
      tags: [],
      notes: null,
      origine: { _tag: 'Saisie' },
      employeuse: null,
      creation: instant,
      modification: new Date('2026-03-04T08:00:00.000Z'),
      titre: TitreDAtelier('Découvrir sa messagerie'),
      niveau: null,
      participants: { suivis: [suivi], anonymes: anonymes.data },
    },
    affichage: {
      lieu: null,
      suivis: accompagnementSuivi().affichage.suivis,
      tags: [],
      rendezVous: null,
    },
  }
}
