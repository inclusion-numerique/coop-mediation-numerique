import { describe, expect, it } from 'vitest'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import { choisirLaVisibiliteApresRupture } from './choisir-la-visibilite-apres-rupture'
import type { MediateurEtContrats } from './ports'
import { ReponseApresRupture } from './reponse-apres-rupture'
import { etatContrat } from './rupture-en-attente'

const mediateurId = MediateurId('a1b2c3d4-0000-4000-8000-000000000001')
const auteurId = AuteurId('a1b2c3d4-0000-4000-8000-000000000002')
const maintenant = new Date('2026-10-20T09:00:00.000Z')
const rupture = new Date('2026-09-01T00:00:00.000Z')
const reglageAvantLaRupture = new Date('2026-08-15T10:00:00.000Z')

const mediateurRompu: MediateurEtContrats = {
  id: mediateurId,
  visibiliteChoisieLe: reglageAvantLaRupture,
  contrats: [
    { debut: new Date('2025-01-01T00:00:00.000Z'), etat: etatContrat(rupture) },
  ],
}

const mediateurEnContrat: MediateurEtContrats = {
  id: mediateurId,
  visibiliteChoisieLe: null,
  contrats: [
    { debut: new Date('2025-01-01T00:00:00.000Z'), etat: etatContrat(null) },
  ],
}

const choisir = ({
  mediateur,
  enregistre,
  reponse,
}: {
  readonly mediateur: MediateurEtContrats | null
  readonly enregistre: boolean
  readonly reponse: ReponseApresRupture
}) =>
  choisirLaVisibiliteApresRupture({
    lireMediateurEtContrats: async () => mediateur,
    enregistrer: async () => ({ enregistre }),
  })({ mediateurId, reponse, auteurId, maintenant })

describe('choisir la visibilité après une rupture', () => {
  it.each<{ reponse: ReponseApresRupture; visible: boolean }>([
    { reponse: ReponseApresRupture('SouhaiteApparaitre'), visible: true },
    { reponse: ReponseApresRupture('PrefereResterMasque'), visible: false },
  ])(
    'enregistre la réponse $reponse à une rupture en attente, visible : $visible',
    async ({ reponse, visible }) => {
      expect(
        await choisir({ mediateur: mediateurRompu, enregistre: true, reponse }),
      ).toEqual({
        success: true,
        data: {
          mediateurId,
          choixPrecedentLe: reglageAvantLaRupture,
          reponse,
          visible,
          rupture: { dateRupture: rupture },
          auteurId,
          choisiLe: maintenant,
        },
      })
    },
  )

  it('signale un médiateur introuvable', async () => {
    expect(
      await choisir({
        mediateur: null,
        enregistre: true,
        reponse: ReponseApresRupture('SouhaiteApparaitre'),
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'MediateurIntrouvable', mediateurId },
    })
  })

  it.each<{ cas: string; mediateur: MediateurEtContrats; enregistre: boolean }>(
    [
      {
        cas: 'aucune rupture n’attend de réponse',
        mediateur: mediateurEnContrat,
        enregistre: true,
      },
      {
        cas: 'une autre réponse a été enregistrée entre-temps',
        mediateur: mediateurRompu,
        enregistre: false,
      },
    ],
  )('refuse la réponse quand $cas', async ({ mediateur, enregistre }) => {
    expect(
      await choisir({
        mediateur,
        enregistre,
        reponse: ReponseApresRupture('SouhaiteApparaitre'),
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'AucuneRuptureEnAttente', mediateurId },
    })
  })
})
