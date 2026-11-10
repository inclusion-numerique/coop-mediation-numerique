import { Commune } from './commune'
import { EmployeuseId } from './employeuse-id'
import { IdentifiantCraV1 } from './identifiant-cra-v1'
import { LieuActiviteId } from './lieu-activite-id'
import { RdvId } from './rdv-id'
import { lieuDeLaSaisie, origineDeLaSaisie } from './saisie-de-mediation'

const lyon = Commune({ nom: 'Lyon', codePostal: '69001', codeInsee: '69123' })

describe('saisie d’une activité de médiation', () => {
  it('rattache une activité à distance à la commune de l’employeuse', () => {
    expect(
      lieuDeLaSaisie(
        { _tag: 'ADistance' },
        { id: EmployeuseId(17), commune: lyon },
      ),
    ).toEqual({ _tag: 'ADistance', communeDeRattachement: lyon })
  })

  it('laisse sans commune une activité à distance sans employeuse', () => {
    expect(lieuDeLaSaisie({ _tag: 'ADistance' }, null)).toEqual({
      _tag: 'ADistance',
      communeDeRattachement: null,
    })
  })

  it('garde le lieu d’activité choisi', () => {
    const lieu = {
      _tag: 'LieuActivite' as const,
      lieuActiviteId: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
    }
    expect(lieuDeLaSaisie(lieu, null)).toBe(lieu)
  })

  it('garde l’origine d’une activité importée de la V1', () => {
    expect(
      origineDeLaSaisie({
        rdvId: RdvId(4),
        identifiantV1: IdentifiantCraV1('cra-v1'),
      }),
    ).toEqual({ _tag: 'ImportV1', identifiant: 'cra-v1' })
  })

  it('rattache la saisie à son rendez-vous', () => {
    expect(origineDeLaSaisie({ rdvId: RdvId(4), identifiantV1: null })).toEqual(
      { _tag: 'RendezVous', rdvId: 4 },
    )
  })

  it('saisit directement sans rendez-vous', () => {
    expect(origineDeLaSaisie({ rdvId: null, identifiantV1: null })).toEqual({
      _tag: 'Saisie',
    })
  })
})
