import { Franchissement } from './franchissement'
import type {
  InscriptionEnCours,
  InscriptionNonDemarree,
  InscriptionValidee,
} from './inscription-etat'
import { InscriptionFlowType } from './inscription-flow-type'
import { peutValider, prochaineEtape } from './prochaine-etape'
import { Role } from './role'
import { UserId } from './user-id'

const userId = UserId('550e8400-e29b-41d4-a716-446655440000')
const cgu = new Date('2026-01-01T10:00:00.000Z')
const le = new Date('2026-02-02T09:00:00.000Z')

const sansDataspace = {
  flowType: InscriptionFlowType('withoutDataspace'),
  hasLieuxActivite: false,
}
const avecDataspace = {
  flowType: InscriptionFlowType('withDataspace'),
  hasLieuxActivite: false,
}

const nonDemarree: InscriptionNonDemarree = { _tag: 'NonDemarree', userId }

const enCours = (
  role: 'Mediateur' | 'Coordinateur',
  {
    conseillerNumerique = false,
    structure = null,
    lieux = null,
  }: {
    conseillerNumerique?: boolean
    structure?: Date | null
    lieux?: Date | null
  } = {},
): InscriptionEnCours => ({
  _tag: 'EnCours',
  userId,
  role: Role(role),
  conseillerNumerique,
  acceptationCgu: cgu,
  progression: {
    structureEmployeuse: Franchissement(structure),
    lieuxActivite: Franchissement(lieux),
  },
})

describe('prochaineEtape', () => {
  it('une inscription non démarrée reprend au choix du rôle', () => {
    expect(prochaineEtape(nonDemarree, sansDataspace)).toBe('choisir-role')
  })

  it('un coordinateur (aucune porte à franchir) est directement au récapitulatif', () => {
    expect(prochaineEtape(enCours('Coordinateur'), sansDataspace)).toBe(
      'recapitulatif',
    )
  })

  it('un médiateur sans structure reprend à la vérification des informations', () => {
    expect(prochaineEtape(enCours('Mediateur'), sansDataspace)).toBe(
      'verifier-informations',
    )
  })

  it('un médiateur avec structure mais sans lieux reprend aux lieux d’activité', () => {
    expect(
      prochaineEtape(enCours('Mediateur', { structure: le }), sansDataspace),
    ).toBe('lieux-activite')
  })

  it('un médiateur ayant tout franchi est au récapitulatif', () => {
    expect(
      prochaineEtape(
        enCours('Mediateur', { structure: le, lieux: le }),
        sansDataspace,
      ),
    ).toBe('recapitulatif')
  })

  it('un conseiller numérique Dataspace sans lieu reprend à la vérification', () => {
    expect(
      prochaineEtape(
        enCours('Mediateur', { conseillerNumerique: true }),
        avecDataspace,
      ),
    ).toBe('verifier-informations')
  })

  it('un conseiller numérique Dataspace, structure franchie, est au récapitulatif (branche sans successeur)', () => {
    expect(
      prochaineEtape(
        enCours('Mediateur', { conseillerNumerique: true, structure: le }),
        avecDataspace,
      ),
    ).toBe('recapitulatif')
  })

  it('un conseiller numérique Dataspace avec lieux connus est directement au récapitulatif', () => {
    expect(
      prochaineEtape(enCours('Mediateur', { conseillerNumerique: true }), {
        ...avecDataspace,
        hasLieuxActivite: true,
      }),
    ).toBe('recapitulatif')
  })

  it('un coordinateur conseiller numérique Dataspace est directement au récapitulatif', () => {
    expect(
      prochaineEtape(
        enCours('Coordinateur', { conseillerNumerique: true }),
        avecDataspace,
      ),
    ).toBe('recapitulatif')
  })
})

describe('peutValider', () => {
  it('refuse tant qu’une porte reste à franchir', () => {
    expect(peutValider(enCours('Mediateur'), sansDataspace)).toBe(false)
    expect(
      peutValider(enCours('Mediateur', { structure: le }), sansDataspace),
    ).toBe(false)
  })

  it('autorise dès que le parcours du profil est complet', () => {
    expect(peutValider(enCours('Coordinateur'), sansDataspace)).toBe(true)
    expect(
      peutValider(
        enCours('Mediateur', { structure: le, lieux: le }),
        sansDataspace,
      ),
    ).toBe(true)
  })

  it('reste vrai sur une inscription déjà validée', () => {
    const validee: InscriptionValidee = {
      ...enCours('Mediateur', { structure: le, lieux: le }),
      _tag: 'Validee',
      inscriptionValidee: le,
    }
    expect(peutValider(validee, sansDataspace)).toBe(true)
  })
})
