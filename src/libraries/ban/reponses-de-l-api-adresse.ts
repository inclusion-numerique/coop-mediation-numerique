export const reponseAdresseTrouvee = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [2.38603, 48.888467],
      },
      properties: {
        label: '21 Rue des Ardennes 75019 Paris',
        score: 0.9762681818181818,
        housenumber: '21',
        id: '75119_0427_00021',
        banId: 'dc034231-bc6b-4504-8ab8-c7f73880240b',
        name: '21 Rue des Ardennes',
        postcode: '75019',
        citycode: '75119',
        x: 654978.73,
        y: 6865558.82,
        city: 'Paris',
        district: 'Paris 19e Arrondissement',
        context: '75, Paris, Île-de-France',
        type: 'housenumber',
        importance: 0.73895,
        depcode: '75',
        street: 'Rue des Ardennes',
        _type: 'address',
      },
    },
  ],
  query: '21 rue des ardennes, Paris',
}

export const reponseSansAdresse = {
  type: 'FeatureCollection',
  features: [],
  query: 'zzzz qqqq wwww xxxx',
}
