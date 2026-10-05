import {
  AdresseIndisponible,
  lireLaReponse,
  requeteGeocodable,
  searchAdresses,
  siIndisponible,
  urlDeRecherche,
} from '@app/web/external-apis/apiAdresse'
import {
  reponseAdresseTrouvee,
  reponseSansAdresse,
} from '@app/web/external-apis/apiAdresse.reponses'

const reponse = (corps: unknown, status = 200) =>
  new Response(JSON.stringify(corps), { status })

describe('apiAdresse', () => {
  describe('requeteGeocodable', () => {
    it.each([
      '21 rue des ardennes, Paris',
      'Évry-Courcouronnes',
      '12bis rue de la Paix',
      'abc',
    ])('accepte « %s »', (requete) => {
      expect(requeteGeocodable(requete)).toBe(true)
    })

    it.each(['[Non diffusible]', '’rue de la Paix', 'ab', '', 'a'.repeat(201)])(
      'refuse « %s », que la Base Adresse Nationale rejetterait',
      (requete) => {
        expect(requeteGeocodable(requete)).toBe(false)
      },
    )
  })

  describe('urlDeRecherche', () => {
    it('demande un seul résultat, sans autocomplétion, par défaut', () => {
      const url = urlDeRecherche('21 rue des ardennes, Paris')

      expect(url.origin + url.pathname).toBe(
        'https://data.geopf.fr/geocodage/search',
      )
      expect(Object.fromEntries(url.searchParams)).toEqual({
        q: '21 rue des ardennes, Paris',
        limit: '1',
        autocomplete: '0',
      })
    })

    it('transmet la limite, l’autocomplétion, le type et le code INSEE', () => {
      const url = urlDeRecherche('ardennes', {
        limit: 5,
        autocomplete: true,
        type: 'street',
        citycode: '75119',
      })

      expect(Object.fromEntries(url.searchParams)).toEqual({
        q: 'ardennes',
        limit: '5',
        autocomplete: '1',
        type: 'street',
        citycode: '75119',
      })
    })
  })

  describe('lireLaReponse', () => {
    it('rend les adresses trouvées', async () => {
      const adresses = await lireLaReponse(reponse(reponseAdresseTrouvee))

      expect(adresses).toEqual([
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [2.386_03, 48.888_467] },
          properties: expect.objectContaining({
            id: '75119_0427_00021',
            label: '21 Rue des Ardennes 75019 Paris',
            name: '21 Rue des Ardennes',
            housenumber: '21',
            street: 'Rue des Ardennes',
            postcode: '75019',
            citycode: '75119',
            city: 'Paris',
            context: '75, Paris, Île-de-France',
            type: 'housenumber',
          }) as Record<string, unknown>,
        },
      ])
    })

    it('rend une liste vide quand rien ne correspond', async () => {
      expect(await lireLaReponse(reponse(reponseSansAdresse))).toEqual([])
    })

    it.each([429, 500, 503])(
      'signale un service indisponible sur un statut %i',
      async (status) => {
        await expect(
          lireLaReponse(reponse({ message: 'erreur' }, status)),
        ).rejects.toBeInstanceOf(AdresseIndisponible)
      },
    )
  })

  describe('searchAdresses', () => {
    it('ne soumet pas une requête que la Base Adresse Nationale rejetterait', async () => {
      expect(await searchAdresses('[Non diffusible]')).toEqual([])
    })
  })

  describe('siIndisponible', () => {
    it('rend le repli et signale une indisponibilité', () => {
      const signalees: AdresseIndisponible[] = []
      const erreur = new AdresseIndisponible('HTTP 503')

      expect(siIndisponible([], (e) => signalees.push(e))(erreur)).toEqual([])
      expect(signalees).toEqual([erreur])
    })

    it('laisse passer toute autre erreur', () => {
      expect(() => siIndisponible([])(new TypeError('bogue'))).toThrow(
        TypeError,
      )
    })
  })
})
