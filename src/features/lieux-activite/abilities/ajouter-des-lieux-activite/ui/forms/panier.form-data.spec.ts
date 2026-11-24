import { describe, expect, it } from 'vitest'
import type { SuggestionAffichee } from '@/features/lieux-activite/abilities/ajouter-des-lieux-activite/ui/presenters/suggestion-de-lieu.presenter'
import {
  AdresseIndisponible,
  SERVICE_ADRESSE_INDISPONIBLE,
} from '@/libraries/ban/api-adresse'
import {
  auPanier,
  type LieuAuPanier,
  lieuCree,
  memeLieu,
  selectionner,
} from './panier.form-data'

const adresseBan = {
  id: '17299_0123_00012',
  label: '12 quai du Port, 17300 Rochefort',
  nom: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  contexte: '17, Charente-Maritime',
  latitude: 45.94,
  longitude: -0.96,
}

const reconnue = async () => adresseBan

const introuvable = async () => null

const indisponible = async () => {
  throw new AdresseIndisponible('HTTP 503')
}

const resultat = (
  champs: Partial<SuggestionAffichee> = {},
): SuggestionAffichee => ({
  id: 'carto-1',
  nom: 'Tiers-lieu du Port',
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  complementAdresse: null,
  pivot: '13002603200016',
  typologie: null,
  structures: [],
  source: 'cartographie_nationale',
  ...champs,
})

const auxPanier = (champs: Partial<LieuAuPanier> = {}): LieuAuPanier => ({
  id: null,
  structureCartographieNationaleId: null,
  nom: 'Tiers-lieu du Port',
  siret: null,
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  ...champs,
})

describe('deux entrées désignent le même lieu', () => {
  it('si leur identité interne coïncide', () => {
    expect(memeLieu(auxPanier({ id: 'a' }), auxPanier({ id: 'a' }))).toBe(true)
  })

  it('si leur identité de cartographie coïncide', () => {
    expect(
      memeLieu(
        auxPanier({ structureCartographieNationaleId: 'c-1' }),
        auxPanier({ structureCartographieNationaleId: 'c-1' }),
      ),
    ).toBe(true)
  })

  it('mais pas si les identités diffèrent', () => {
    expect(memeLieu(auxPanier({ id: 'a' }), auxPanier({ id: 'b' }))).toBe(false)
  })

  it('sans identité, si leur nom et leur adresse coïncident', () => {
    expect(memeLieu(auxPanier(), auxPanier())).toBe(true)
  })

  it('mais pas, sans identité, si leurs adresses diffèrent', () => {
    expect(memeLieu(auxPanier(), auxPanier({ adresse: '3 rue Haute' }))).toBe(
      false,
    )
  })

  it('ni si leur SIRET seul coïncide', () => {
    expect(
      memeLieu(
        auxPanier({ siret: '13002603200016' }),
        auxPanier({ siret: '13002603200016', adresse: '3 rue Haute' }),
      ),
    ).toBe(false)
  })
})

describe('un résultat de recherche devient une entrée du panier', () => {
  it('par son id quand la coop connaît déjà le lieu', async () => {
    const lieu = await auPanier(reconnue)(
      resultat({ structures: [{ id: 'lieu-coop' }] }),
    )

    expect(lieu).toEqual({
      id: 'lieu-coop',
      structureCartographieNationaleId: null,
      nom: 'Tiers-lieu du Port',
      siret: null,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
    })
  })

  it('sans interroger la Base Adresse Nationale pour un lieu déjà connu', async () => {
    const lieu = await auPanier(indisponible)(
      resultat({ structures: [{ id: 'lieu-coop' }] }),
    )

    expect(lieu?.id).toBe('lieu-coop')
  })

  it('avec l’adresse reconnue par la BAN pour un lieu à créer', async () => {
    const lieu = await auPanier(reconnue)(resultat())

    expect(lieu).toMatchObject({
      id: null,
      banId: '17299_0123_00012',
      latitude: 45.94,
      longitude: -0.96,
      adresse: '12 quai du Port',
    })
  })

  it('en retenant l’identité de cartographie d’un résultat qui en vient', async () => {
    const lieu = await auPanier(reconnue)(
      resultat({ source: 'cartographie_nationale' }),
    )

    expect(lieu?.structureCartographieNationaleId).toBe('carto-1')
  })

  it.each([['api'], ['structure_locale']] as const)(
    'en l’ignorant pour un résultat venu de %s',
    async (source) => {
      const lieu = await auPanier(reconnue)(resultat({ source }))

      expect(lieu?.structureCartographieNationaleId).toBeNull()
    },
  )

  it('en retenant comme SIRET le pivot d’un résultat de l’annuaire', async () => {
    const lieu = await auPanier(reconnue)(resultat({ source: 'api' }))

    expect(lieu?.siret).toBe('13002603200016')
  })

  it('sans prendre pour SIRET le pivot de la cartographie, qui peut être un RNA', async () => {
    const lieu = await auPanier(reconnue)(
      resultat({ source: 'cartographie_nationale', pivot: 'W751234567' }),
    )

    expect(lieu?.siret).toBeNull()
  })

  it('rend null quand la BAN ne reconnaît pas l’adresse', async () => {
    expect(await auPanier(introuvable)(resultat())).toBeNull()
  })
})

describe('le lieu choisi rejoint la sélection', () => {
  it('quand rien ne s’y oppose', async () => {
    const issue = await selectionner(reconnue)([], resultat())

    expect(issue.success).toBe(true)
  })

  it('sauf si son adresse est introuvable dans la BAN', async () => {
    const issue = await selectionner(introuvable)([], resultat())

    expect(!issue.success && issue.error).toContain(
      'introuvable dans la Base Adresse Nationale',
    )
  })

  it('sauf si le service d’adresse est indisponible', async () => {
    const issue = await selectionner(indisponible)([], resultat())

    expect(!issue.success && issue.error).toBe(SERVICE_ADRESSE_INDISPONIBLE)
  })

  it('sauf s’il fait déjà partie de la sélection', async () => {
    const issue = await selectionner(reconnue)(
      [auxPanier({ structureCartographieNationaleId: 'carto-1' })],
      resultat(),
    )

    expect(!issue.success && issue.error).toBe(
      'Tiers-lieu du Port fait déjà partie de votre sélection.',
    )
  })
})

describe('le lieu qu’on vient de créer', () => {
  it('rejoint la sélection avec son id et son adresse validée', () => {
    expect(
      lieuCree({ id: 'lieu-cree', nom: 'Tiers-lieu du Port', adresseBan }),
    ).toEqual({
      id: 'lieu-cree',
      structureCartographieNationaleId: null,
      nom: 'Tiers-lieu du Port',
      siret: null,
      adresse: '12 quai du Port',
      commune: 'Rochefort',
      codePostal: '17300',
      codeInsee: '17299',
      banId: '17299_0123_00012',
      latitude: 45.94,
      longitude: -0.96,
    })
  })
})
