import { prismaClient } from '@app/web/prismaClient'

describe('enumArrayTypeParser', () => {
  test('rend un tableau d’enums lu en SQL brut sous forme de tableau', async () => {
    const [ligne] = await prismaClient.$queryRaw<
      { remplis: unknown; vide: unknown; scalaire: unknown }[]
    >`
      SELECT
        ARRAY['Conseillers numériques', 'France Services']::"coop"."dispositif_programme_national"[] AS remplis,
        '{}'::"coop"."dispositif_programme_national"[] AS vide,
        'Conseillers numériques'::"coop"."dispositif_programme_national" AS scalaire
    `

    expect(ligne).toEqual({
      remplis: ['Conseillers numériques', 'France Services'],
      vide: [],
      scalaire: 'Conseillers numériques',
    })
  })
})
