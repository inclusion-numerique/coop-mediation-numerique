import { CodeDepartement } from '@app/web/libraries/departement'
import type { Acteur } from './acteur'
import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import { NomDuCoordinateur } from './nom-du-coordinateur'
import { NomDuTag } from './nom-du-tag'
import type { Portee } from './portee'
import { peutFusionnerVers, peutGerer, peutVoir } from './regles'
import type { Tag } from './tag'
import { TagId } from './tag-id'

const moi = MediateurId('00000000-0000-4000-8000-000000000001')
const autreMediateur = MediateurId('00000000-0000-4000-8000-000000000002')
const monCoordinateur = CoordinateurId('00000000-0000-4000-8000-000000000003')
const autreCoordinateur = CoordinateurId('00000000-0000-4000-8000-000000000004')

const mediateur: Acteur = {
  mediateurId: moi,
  coordinateurId: null,
  equipes: [
    {
      coordinateurId: monCoordinateur,
      coordonneePar: NomDuCoordinateur('Ada'),
    },
  ],
  departement: CodeDepartement('69'),
}

const coordinateur: Acteur = {
  mediateurId: null,
  coordinateurId: monCoordinateur,
  equipes: [
    {
      coordinateurId: monCoordinateur,
      coordonneePar: NomDuCoordinateur('Ada'),
    },
  ],
  departement: CodeDepartement('69'),
}

const personnel = (mediateurId: MediateurId): Portee => ({
  _tag: 'Personnel',
  proprietaire: { _tag: 'Mediateur', mediateurId },
})

const equipe = (coordinateurId: CoordinateurId): Portee => ({
  _tag: 'Equipe',
  coordinateurId,
})

const departemental = (code: string): Portee => ({
  _tag: 'Departemental',
  departement: CodeDepartement(code),
})

const national: Portee = { _tag: 'National' }

const tag = (id: string, portee: Portee): Tag => ({
  id: TagId(`00000000-0000-4000-8000-0000000000${id}`),
  nom: NomDuTag(`Tag ${id}`),
  description: null,
  portee,
})

describe('peutGerer', () => {
  it.each([
    ['son tag personnel', mediateur, personnel(moi), true],
    [
      'le tag personnel d’un autre',
      mediateur,
      personnel(autreMediateur),
      false,
    ],
    ['un tag de son équipe', mediateur, equipe(monCoordinateur), true],
    ['un tag d’une autre équipe', mediateur, equipe(autreCoordinateur), false],
    [
      'un tag départemental en médiateur',
      mediateur,
      departemental('69'),
      false,
    ],
    [
      'un tag de son département en coordinateur',
      coordinateur,
      departemental('69'),
      true,
    ],
    ['un tag d’un autre département', coordinateur, departemental('01'), false],
    ['un tag national', coordinateur, national, false],
  ])('%s', (_, acteur, portee, attendu) => {
    expect(peutGerer(acteur)(portee)).toBe(attendu)
  })
})

describe('peutVoir', () => {
  it.each([
    [
      'un tag départemental de son département',
      mediateur,
      departemental('69'),
      true,
    ],
    ['un tag d’un autre département', mediateur, departemental('01'), false],
    ['un tag national', mediateur, national, true],
    [
      'le tag personnel d’un autre',
      mediateur,
      personnel(autreMediateur),
      false,
    ],
  ])('%s', (_, acteur, portee, attendu) => {
    expect(peutVoir(acteur)(portee)).toBe(attendu)
  })
})

describe('peutFusionnerVers', () => {
  it('fusionne un tag personnel vers un tag d’équipe', () => {
    expect(
      peutFusionnerVers(mediateur)(
        tag('11', personnel(moi)),
        tag('12', equipe(monCoordinateur)),
      ),
    ).toBe(true)
  })

  it('ne fusionne pas un tag d’équipe vers un tag personnel', () => {
    expect(
      peutFusionnerVers(mediateur)(
        tag('11', equipe(monCoordinateur)),
        tag('12', personnel(moi)),
      ),
    ).toBe(false)
  })

  it('ne fusionne pas un tag vers lui-même', () => {
    const source = tag('11', personnel(moi))
    expect(peutFusionnerVers(mediateur)(source, source)).toBe(false)
  })

  it('ne fusionne pas un tag qu’il ne gère pas', () => {
    expect(
      peutFusionnerVers(mediateur)(
        tag('11', personnel(autreMediateur)),
        tag('12', national),
      ),
    ).toBe(false)
  })

  it('ne fusionne pas vers un tag qu’il ne voit pas', () => {
    expect(
      peutFusionnerVers(coordinateur)(
        tag('11', departemental('69')),
        tag('12', departemental('01')),
      ),
    ).toBe(false)
  })
})
