import { describe, expect, it } from 'vitest'
import { AuteurId, MediateurId } from '@/features/mediateurs/domain'
import {
  choisirLaVisibiliteApresRupture,
  type MediateurEtContrats,
} from './choisir-la-visibilite-apres-rupture'
import { ReponseApresRupture } from './reponse-apres-rupture'
import { etatContrat } from './rupture-en-attente'

const mediateurId = MediateurId('a1b2c3d4-0000-4000-8000-000000000001')

const mediateurRompu: MediateurEtContrats = {
  id: mediateurId,
  visibiliteChoisieLe: null,
  contrats: [
    {
      debut: new Date('2025-01-01T00:00:00.000Z'),
      etat: etatContrat(new Date('2026-09-01T00:00:00.000Z')),
    },
  ],
}

const mediateurEnContrat: MediateurEtContrats = {
  id: mediateurId,
  visibiliteChoisieLe: null,
  contrats: [
    { debut: new Date('2025-01-01T00:00:00.000Z'), etat: etatContrat(null) },
  ],
}

const choisir = (mediateur: MediateurEtContrats | null, enregistre: boolean) =>
  choisirLaVisibiliteApresRupture({
    lireMediateurEtContrats: async () => mediateur,
    enregistrer: async () => ({ enregistre }),
  })({
    mediateurId,
    reponse: ReponseApresRupture('SouhaiteApparaitre'),
    auteurId: AuteurId('a1b2c3d4-0000-4000-8000-000000000002'),
    maintenant: new Date('2026-10-20T09:00:00.000Z'),
  })

describe('choisir la visibilité après une rupture', () => {
  it('enregistre la réponse à une rupture en attente', async () => {
    expect(await choisir(mediateurRompu, true)).toEqual({
      success: true,
      data: undefined,
    })
  })

  it('signale un médiateur introuvable', async () => {
    expect(await choisir(null, true)).toEqual({
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
    expect(await choisir(mediateur, enregistre)).toEqual({
      success: false,
      error: { _tag: 'AucuneRuptureEnAttente', mediateurId },
    })
  })
})
