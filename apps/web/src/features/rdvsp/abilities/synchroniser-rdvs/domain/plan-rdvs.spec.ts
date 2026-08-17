import { NomLieu } from '../../../domain/lieu'
import { MotifId } from '../../../domain/motif-id'
import { RdvId } from '../../../domain/rdv-id'
import { StatutPresence } from '../../../domain/statut-presence'
import { UsagerId } from '../../../domain/usager-id'
import {
  lieuFixture,
  motifFixture,
  participationFixture,
  rdvFixture,
  usagerFixture,
} from './fixtures'
import {
  type EtatConnu,
  lieuxDe,
  motifsDe,
  planifierLot,
  rdvsASupprimer,
  usagersDe,
} from './plan-rdvs'

const etatVide: EtatConnu = {
  rdvs: new Map(),
  motifs: new Map(),
  lieux: new Map(),
  usagers: new Map(),
}

const rienDeTraite = {
  motifs: new Set<never>(),
  lieux: new Set<never>(),
  usagers: new Set<never>(),
}

describe('extraction depuis les rendez-vous', () => {
  it('remonte les motifs, en écartant les rendez-vous qui n’en ont pas', () => {
    const rdvs = [rdvFixture(1), rdvFixture(2, { motif: null })]

    expect(motifsDe(rdvs).map(({ id }) => id)).toEqual([3])
  })

  it('remonte les lieux, en écartant les rendez-vous sans lieu', () => {
    const rdvs = [rdvFixture(1), rdvFixture(2, { lieu: null })]

    expect(lieuxDe(rdvs).map(({ id }) => id)).toEqual([11])
  })

  it('remonte les usagers de toutes les participations', () => {
    const rdv = rdvFixture(1, {
      participations: [
        participationFixture(100, usagerFixture(200)),
        participationFixture(101, usagerFixture(201)),
      ],
    })

    expect(usagersDe([rdv]).map(({ id }) => id)).toEqual([200, 201])
  })
})

describe('planifierLot', () => {
  it('crée tout ce que La Coop ne connaît pas', () => {
    const plan = planifierLot({
      recus: [rdvFixture(1)],
      connu: etatVide,
      dejaTraites: rienDeTraite,
    })

    expect(plan.rdvs.aCreer.map(({ id }) => id)).toEqual([1])
    expect(plan.motifs.aCreer.map(({ id }) => id)).toEqual([3])
    expect(plan.lieux.aCreer.map(({ id }) => id)).toEqual([11])
    expect(plan.usagers.aCreer.map(({ id }) => id)).toEqual([200])
  })

  it('dédoublonne un motif porté par plusieurs rendez-vous', () => {
    const plan = planifierLot({
      recus: [rdvFixture(1), rdvFixture(2)],
      connu: etatVide,
      dejaTraites: rienDeTraite,
    })

    expect(plan.motifs.aCreer).toHaveLength(1)
    expect(plan.lieux.aCreer).toHaveLength(1)
    expect(plan.usagers.aCreer).toHaveLength(1)
    expect(plan.rdvs.aCreer).toHaveLength(2)
  })

  it('écarte ce qu’un lot précédent a déjà traité', () => {
    const plan = planifierLot({
      recus: [rdvFixture(1)],
      connu: etatVide,
      dejaTraites: {
        motifs: new Set([MotifId(3)]),
        lieux: new Set(),
        usagers: new Set([UsagerId(200)]),
      },
    })

    expect(plan.motifs.aCreer).toEqual([])
    expect(plan.usagers.aCreer).toEqual([])
    expect(plan.lieux.aCreer).toHaveLength(1)
  })

  it('laisse tranquille un rendez-vous identique à ce qui est connu', () => {
    const connu: EtatConnu = {
      rdvs: new Map([[RdvId(1), rdvFixture(1)]]),
      motifs: new Map([[MotifId(3), motifFixture(3)]]),
      lieux: new Map(),
      usagers: new Map(),
    }

    const plan = planifierLot({
      recus: [rdvFixture(1)],
      connu,
      dejaTraites: rienDeTraite,
    })

    expect(plan.rdvs.inchanges.map(({ id }) => id)).toEqual([1])
    expect(plan.rdvs.aMettreAJour).toEqual([])
    expect(plan.motifs.inchanges).toHaveLength(1)
  })

  it('met à jour un rendez-vous dont le statut a changé', () => {
    const connu: EtatConnu = {
      ...etatVide,
      rdvs: new Map([[RdvId(1), rdvFixture(1)]]),
    }

    const plan = planifierLot({
      recus: [rdvFixture(1, { statutPresence: StatutPresence('seen') })],
      connu,
      dejaTraites: rienDeTraite,
    })

    expect(plan.rdvs.aMettreAJour.map(({ id }) => id)).toEqual([1])
  })

  it('met à jour un lieu retouché sans toucher aux autres modèles', () => {
    const connu: EtatConnu = {
      ...etatVide,
      lieux: new Map([[lieuFixture(11).id, lieuFixture(11)]]),
    }

    const plan = planifierLot({
      recus: [
        rdvFixture(1, {
          lieu: lieuFixture(11, { nom: NomLieu('Médiathèque rénovée') }),
        }),
      ],
      connu,
      dejaTraites: rienDeTraite,
    })

    expect(plan.lieux.aMettreAJour).toHaveLength(1)
    expect(plan.lieux.aCreer).toEqual([])
  })
})

describe('rdvsASupprimer', () => {
  it('retient ce que La Coop détient et que l’API ne renvoie plus', () => {
    const aSupprimer = rdvsASupprimer({
      enBase: [RdvId(1), RdvId(2), RdvId(3)],
      recus: [rdvFixture(1), rdvFixture(3)],
    })

    expect(aSupprimer).toEqual([2])
  })

  it('ne supprime rien quand tout est confirmé', () => {
    expect(
      rdvsASupprimer({ enBase: [RdvId(1)], recus: [rdvFixture(1)] }),
    ).toEqual([])
  })

  it('supprime tout si l’API ne renvoie plus rien', () => {
    expect(rdvsASupprimer({ enBase: [RdvId(1)], recus: [] })).toEqual([1])
  })
})
