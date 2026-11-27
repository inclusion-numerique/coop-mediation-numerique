const cartographieNationaleSourcesLabels = {
  fredo: 'Fredo',
  'Conseil Départemental de la Charente-Maritime':
    'Conseil Départemental de la Charente-Maritime',
  SIILAB: 'SIILAB',
  Paca: 'Paca',
  Hinaura: 'Hinaura',
  'Conseil départemental des Vosges': 'Conseil départemental des Vosges',
  Numi: 'Numi',
  Mulhouse: 'Mulhouse',
  'Loire Atlantique': 'Loire Atlantique',
  RhinOcc: 'RhinOcc',
  'France Services': 'France Services',
  'Francil-in': 'Francil-in',
  Vendée: 'Vendée',
  'Mednum BFC': 'Mednum BFC',
  'Coop numérique': 'Coop numérique',
  Hérault: 'Hérault',
  'Les Landes': 'Les Landes',
  'Res-in': 'Res-in',
  dora: 'dora',
  'Grand Paris Sud': 'Grand Paris Sud',
}

export type CartographieNationaleKnownSource =
  keyof typeof cartographieNationaleSourcesLabels

export const coopCartographieNationaleSource: CartographieNationaleKnownSource =
  'Coop numérique'

const libellesDesSources: ReadonlyMap<string, string> = new Map(
  Object.entries(cartographieNationaleSourcesLabels),
)

export const libelleDeLaSource = (source: string): string =>
  libellesDesSources.get(source) ?? source
