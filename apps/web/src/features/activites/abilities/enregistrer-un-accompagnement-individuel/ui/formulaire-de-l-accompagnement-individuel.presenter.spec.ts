import {
  type AccompagnementIndividuel,
  ActiviteId,
  Autonomie,
  Commune,
  DateDActivite,
  DureeEnMinutes,
  Genre,
  Materiel,
  MediateurId,
  Notes,
  PrecisionDeDemarche,
  StatutSocial,
  StructureDeRedirection,
  ThematiqueAdministrative,
  ThematiqueDeMediation,
  TrancheDAge,
} from '../../../domain'
import { EnregistrerUnAccompagnementIndividuelValidation } from '../action/enregistrer-un-accompagnement-individuel.validation'
import { formulaireDeLAccompagnementIndividuel } from './formulaire-de-l-accompagnement-individuel.presenter'
import { saisieDeLAccompagnementIndividuel } from './saisie-du-formulaire.presenter'
import { CraIndividuelValidation } from './validation/CraIndividuelValidation'

const instant = new Date('2026-11-10T09:00:00.000Z')

const lyon = Commune({ nom: 'Lyon', codePostal: '69001', codeInsee: '69123' })

const accompagnement: AccompagnementIndividuel = {
  _tag: 'Individuel',
  id: ActiviteId('b0000000-0000-4000-8000-000000000001'),
  mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
  date: DateDActivite('2026-11-10'),
  duree: DureeEnMinutes(45),
  lieu: { _tag: 'Domicile', commune: lyon },
  thematiques: {
    mediation: [ThematiqueDeMediation('Email')],
    demarche: {
      thematiques: [ThematiqueAdministrative('Logement')],
      precision: PrecisionDeDemarche('Demande d’APL'),
    },
  },
  equipement: { _tag: 'Materiels', materiels: [Materiel('Telephone')] },
  tags: [],
  notes: Notes('<p>À revoir</p>'),
  origine: { _tag: 'Saisie' },
  employeuse: null,
  creation: instant,
  modification: instant,
  beneficiaire: {
    _tag: 'Anonyme',
    dejaAccompagne: true,
    profil: {
      genre: Genre('Feminin'),
      trancheDAge: TrancheDAge('SoixanteDixPlus'),
      statutSocial: StatutSocial('Retraite'),
      residence: lyon,
    },
  },
  autonomie: Autonomie('PartiellementAutonome'),
  orientation: {
    _tag: 'Oriente',
    vers: StructureDeRedirection('Administration'),
  },
}

const affichage = { lieu: null, suivis: [], tags: [] }

describe('formulaire d’un accompagnement individuel', () => {
  it('rouvre un accompagnement et le réenregistre à l’identique', () => {
    const saisie = EnregistrerUnAccompagnementIndividuelValidation.parse(
      saisieDeLAccompagnementIndividuel(
        CraIndividuelValidation.parse(
          formulaireDeLAccompagnementIndividuel(accompagnement, affichage),
        ),
      ),
    )
    expect(saisie).toEqual({
      id: accompagnement.id,
      date: accompagnement.date,
      duree: accompagnement.duree,
      lieu: accompagnement.lieu,
      thematiques: accompagnement.thematiques,
      equipement: accompagnement.equipement,
      tags: [],
      notes: accompagnement.notes,
      rdvId: null,
      beneficiaire: {
        id: null,
        dejaAccompagne: true,
        profil:
          accompagnement.beneficiaire._tag === 'Anonyme'
            ? accompagnement.beneficiaire.profil
            : null,
      },
      autonomie: accompagnement.autonomie,
      orientation: accompagnement.orientation,
    })
  })
})
