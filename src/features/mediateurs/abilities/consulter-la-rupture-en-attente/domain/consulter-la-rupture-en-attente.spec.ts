import { describe, expect, it } from 'vitest'
import {
  type Contrat,
  etatContrat,
  type MediateurEtContrats,
  MediateurId,
} from '@/features/mediateurs/domain'
import { consulterLaRuptureEnAttente } from './consulter-la-rupture-en-attente'

const mediateurId = MediateurId('a1b2c3d4-0000-4000-8000-000000000001')
const maintenant = new Date('2026-10-20T09:00:00.000Z')

const enCours = (debut: string): Contrat => ({
  debut: new Date(debut),
  etat: etatContrat(null),
})

const rompu = (debut: string, rupture: string): Contrat => ({
  debut: new Date(debut),
  etat: etatContrat(new Date(rupture)),
})

const consulter = ({
  mediateur,
  instant,
}: {
  readonly mediateur: MediateurEtContrats | null
  readonly instant: Date
}) =>
  consulterLaRuptureEnAttente({
    lireMediateurEtContrats: async () => mediateur,
  })({ mediateurId, maintenant: instant })

type Cas = {
  readonly cas: string
  readonly contrats: readonly Contrat[]
  readonly visibiliteChoisieLe: Date | null
  readonly instant: Date
}

describe('consulter la rupture en attente', () => {
  it.each<Cas & { readonly rupture: Date }>([
    {
      cas: 'la rupture est passée et la visibilité réglée avant elle',
      contrats: [rompu('2025-01-01', '2026-09-01')],
      visibiliteChoisieLe: new Date('2026-08-15T10:00:00.000Z'),
      instant: maintenant,
      rupture: new Date('2026-09-01'),
    },
    {
      cas: 'la visibilité n’a jamais été réglée',
      contrats: [rompu('2025-01-01', '2026-09-01')],
      visibiliteChoisieLe: null,
      instant: maintenant,
      rupture: new Date('2026-09-01'),
    },
    {
      cas: 'le choix a été fait la veille de la rupture, heure de Paris',
      contrats: [rompu('2025-01-01', '2026-09-01')],
      visibiliteChoisieLe: new Date('2026-08-31T21:30:00.000Z'),
      instant: maintenant,
      rupture: new Date('2026-09-01'),
    },
    {
      cas: 'la rupture est passée depuis minuit, heure de Paris',
      contrats: [rompu('2025-01-01', '2026-10-21')],
      visibiliteChoisieLe: null,
      instant: new Date('2026-10-20T22:30:00.000Z'),
      rupture: new Date('2026-10-21'),
    },
    {
      cas: 'un nouveau contrat n’a pas encore commencé',
      contrats: [rompu('2024-01-01', '2026-09-01'), enCours('2026-12-01')],
      visibiliteChoisieLe: null,
      instant: maintenant,
      rupture: new Date('2026-09-01'),
    },
    {
      cas: 'la dernière rupture passée suit un choix plus ancien',
      contrats: [
        rompu('2024-01-01', '2025-06-01'),
        rompu('2025-07-01', '2026-09-01'),
      ],
      visibiliteChoisieLe: new Date('2025-08-01T10:00:00.000Z'),
      instant: maintenant,
      rupture: new Date('2026-09-01'),
    },
  ])(
    'attend une réponse quand $cas',
    async ({ contrats, visibiliteChoisieLe, instant, rupture }) => {
      expect(
        await consulter({
          mediateur: { id: mediateurId, visibiliteChoisieLe, contrats },
          instant,
        }),
      ).toEqual({ success: true, data: { dateRupture: rupture } })
    },
  )

  it.each<Cas>([
    {
      cas: 'il n’a aucun contrat',
      contrats: [],
      visibiliteChoisieLe: null,
      instant: maintenant,
    },
    {
      cas: 'son contrat est en cours',
      contrats: [enCours('2025-01-01')],
      visibiliteChoisieLe: null,
      instant: maintenant,
    },
    {
      cas: 'sa visibilité a été réglée après la rupture',
      contrats: [rompu('2025-01-01', '2026-09-01')],
      visibiliteChoisieLe: new Date('2026-09-15T10:00:00.000Z'),
      instant: maintenant,
    },
    {
      cas: 'son choix date du jour de la rupture, heure de Paris',
      contrats: [rompu('2025-01-01', '2026-09-01')],
      visibiliteChoisieLe: new Date('2026-08-31T22:30:00.000Z'),
      instant: maintenant,
    },
    {
      cas: 'la rupture est à venir',
      contrats: [rompu('2025-01-01', '2026-11-01')],
      visibiliteChoisieLe: null,
      instant: maintenant,
    },
    {
      cas: 'il a été réembauché après la rupture',
      contrats: [rompu('2024-01-01', '2026-09-01'), enCours('2026-09-10')],
      visibiliteChoisieLe: null,
      instant: maintenant,
    },
  ])(
    'n’attend aucune réponse quand $cas',
    async ({ contrats, visibiliteChoisieLe, instant }) => {
      expect(
        await consulter({
          mediateur: { id: mediateurId, visibiliteChoisieLe, contrats },
          instant,
        }),
      ).toEqual({
        success: false,
        error: { _tag: 'AucuneRuptureEnAttente', mediateurId },
      })
    },
  )

  it('signale un médiateur introuvable', async () => {
    expect(await consulter({ mediateur: null, instant: maintenant })).toEqual({
      success: false,
      error: { _tag: 'MediateurIntrouvable', mediateurId },
    })
  })
})
