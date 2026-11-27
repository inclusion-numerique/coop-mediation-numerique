import { describe, expect, it } from 'vitest'
import { CoordinateurId } from '../../../domain/identifiants/coordinateur-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { Courriel } from '../../../domain/identite/courriel'
import { Nom } from '../../../domain/identite/nom'
import { NomAffiche } from '../../../domain/identite/nom-affiche'
import { Prenom } from '../../../domain/identite/prenom'
import { listerLesMembresAFiltrer } from './lister-les-membres-a-filtrer'
import type {
  EquipeAFiltrer,
  IdentiteDuMembre,
  MembreLu,
} from './membre-a-filtrer'

const equipe: EquipeAFiltrer = {
  coordinateurId: CoordinateurId('550e8400-e29b-41d4-a716-446655440001'),
  membres: [],
}

const demandeur: IdentiteDuMembre = {
  mediateurId: MediateurId('9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d'),
  nom: NomAffiche('Alan Turing'),
  email: Courriel('alan@example.com'),
}

const membreLu = ({
  mediateurId,
  prenom,
  nom,
  email,
  departs,
}: {
  mediateurId: string
  prenom: string
  nom: string
  email: string
  departs: readonly (Date | null)[]
}): MembreLu => ({
  membre: {
    mediateurId: MediateurId(mediateurId),
    nom: NomAffiche(`${prenom} ${nom}`),
    email: Courriel(email),
  },
  prenom: Prenom(prenom),
  nomDeFamille: Nom(nom),
  departs,
})

const grace = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01',
  prenom: 'Grace',
  nom: 'hopper',
  email: 'grace@example.com',
  departs: [new Date('2026-03-06')],
})

const ada = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e02',
  prenom: 'Ada',
  nom: 'Lovelace',
  email: 'ada@example.com',
  departs: [null],
})

const katherine = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e03',
  prenom: 'Katherine',
  nom: 'Johnson',
  email: 'katherine@example.com',
  departs: [new Date('2026-01-01'), null],
})

const helene = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e04',
  prenom: 'Hélène',
  nom: 'Dupré',
  email: 'helene@example.com',
  departs: [],
})

const dupreGrace = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e08',
  prenom: 'Grace',
  nom: 'Martin',
  email: 'dupre.grace@example.com',
  departs: [],
})

const anonyme: MembreLu = {
  ...membreLu({
    mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e05',
    prenom: 'Inconnu',
    nom: 'Anonyme',
    email: 'anonyme@example.com',
    departs: [],
  }),
  prenom: null,
  nomDeFamille: null,
}

const graceHopper = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e06',
  prenom: 'Grace',
  nom: 'Hopper',
  email: 'grace.hopper@example.com',
  departs: [],
})

const adaHopper = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e07',
  prenom: 'Ada',
  nom: 'hopper',
  email: 'ada.hopper@example.com',
  departs: [],
})

const mediateurUn = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e10',
  prenom: 'Mediateur',
  nom: 'Un',
  email: 'mediateur1@example.com',
  departs: [],
})

const mediateurDeux = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e11',
  prenom: 'Mediateur',
  nom: 'Deux',
  email: 'mediateur2@example.com',
  departs: [],
})

const mediateurTrois = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e12',
  prenom: 'Mediateur',
  nom: 'Trois',
  email: 'mediateur3@example.com',
  departs: [],
})

const mediateurQuatre = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e13',
  prenom: 'Mediateur',
  nom: 'Quatre',
  email: 'mediateur4@example.com',
  departs: [],
})

const mediateurCinq = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e14',
  prenom: 'Mediateur',
  nom: 'Cinq',
  email: 'mediateur5@example.com',
  departs: [],
})

const mediateurSix = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e15',
  prenom: 'Mediateur',
  nom: 'Six',
  email: 'mediateur6@example.com',
  departs: [],
})

const mediateurSept = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e16',
  prenom: 'Mediateur',
  nom: 'Sept',
  email: 'mediateur7@example.com',
  departs: [],
})

const mediateurHuit = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e17',
  prenom: 'Mediateur',
  nom: 'Huit',
  email: 'mediateur8@example.com',
  departs: [],
})

const mediateurNeuf = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e18',
  prenom: 'Mediateur',
  nom: 'Neuf',
  email: 'mediateur9@example.com',
  departs: [],
})

const mediateurDix = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e19',
  prenom: 'Mediateur',
  nom: 'Dix',
  email: 'mediateur10@example.com',
  departs: [],
})

const mediateurOnze = membreLu({
  mediateurId: '0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e20',
  prenom: 'Mediateur',
  nom: 'Onze',
  email: 'mediateur11@example.com',
  departs: [],
})

const onze: readonly MembreLu[] = [
  mediateurUn,
  mediateurDeux,
  mediateurTrois,
  mediateurQuatre,
  mediateurCinq,
  mediateurSix,
  mediateurSept,
  mediateurHuit,
  mediateurNeuf,
  mediateurDix,
  mediateurOnze,
]

const listerParmi = (membres: readonly MembreLu[]) =>
  listerLesMembresAFiltrer({
    lireLeDemandeur: async () => demandeur,
    lireLesMembresAFiltrer: async () => membres,
  })

describe('lister les membres à filtrer', () => {
  it('place le demandeur, puis les membres par nom, puis les anciens', async () => {
    expect(
      await listerParmi([grace, ada, katherine])({
        equipe,
        demandeur: demandeur.mediateurId,
        recherche: null,
      }),
    ).toEqual({
      success: true,
      data: [
        { ...demandeur, situation: 'Demandeur' },
        { ...katherine.membre, situation: 'Membre' },
        { ...ada.membre, situation: 'Membre' },
        { ...grace.membre, situation: 'AncienMembre' },
      ],
    })
  })

  it('sans demandeur, range d’abord les noms inconnus parmi ceux qui n’ont jamais quitté l’équipe', async () => {
    expect(
      await listerParmi([helene, anonyme])({
        equipe,
        demandeur: null,
        recherche: null,
      }),
    ).toEqual({
      success: true,
      data: [
        { ...anonyme.membre, situation: 'Membre' },
        { ...helene.membre, situation: 'Membre' },
      ],
    })
  })

  it('départage par le prénom les membres qui portent le même nom', async () => {
    expect(
      await listerParmi([graceHopper, adaHopper])({
        equipe,
        demandeur: null,
        recherche: null,
      }),
    ).toEqual({
      success: true,
      data: [
        { ...adaHopper.membre, situation: 'Membre' },
        { ...graceHopper.membre, situation: 'Membre' },
      ],
    })
  })

  it('ne liste personne hors d’une équipe', async () => {
    expect(
      await listerParmi([ada])({
        equipe: null,
        demandeur: demandeur.mediateurId,
        recherche: null,
      }),
    ).toEqual({ success: true, data: [] })
  })

  it('trouve un membre par son nom, sans tenir compte des accents', async () => {
    expect(
      await listerParmi([helene, ada])({
        equipe,
        demandeur: null,
        recherche: 'helene',
      }),
    ).toEqual({
      success: true,
      data: [{ ...helene.membre, situation: 'Membre' }],
    })
  })

  it('trouve un membre par son adresse électronique', async () => {
    expect(
      await listerParmi([helene, ada, dupreGrace])({
        equipe,
        demandeur: null,
        recherche: 'dupre',
      }),
    ).toEqual({
      success: true,
      data: [
        { ...helene.membre, situation: 'Membre' },
        { ...dupreGrace.membre, situation: 'Membre' },
      ],
    })
  })

  it('ne rend que les dix premiers membres trouvés', async () => {
    expect(
      await listerParmi(onze)({
        equipe,
        demandeur: null,
        recherche: 'mediateur',
      }),
    ).toEqual({
      success: true,
      data: [
        { ...mediateurCinq.membre, situation: 'Membre' },
        { ...mediateurDeux.membre, situation: 'Membre' },
        { ...mediateurDix.membre, situation: 'Membre' },
        { ...mediateurHuit.membre, situation: 'Membre' },
        { ...mediateurNeuf.membre, situation: 'Membre' },
        { ...mediateurOnze.membre, situation: 'Membre' },
        { ...mediateurQuatre.membre, situation: 'Membre' },
        { ...mediateurSept.membre, situation: 'Membre' },
        { ...mediateurSix.membre, situation: 'Membre' },
        { ...mediateurTrois.membre, situation: 'Membre' },
      ],
    })
  })
})
