import { AdresseRdv } from '../../../domain/adresse-rdv'
import { DureeEnMinutes } from '../../../domain/duree-en-minutes'
import { EmailExterne, NomExterne } from '../../../domain/identite'
import { NomAtelier, NomMotif } from '../../../domain/libelle'
import { NomLieu } from '../../../domain/lieu'
import { OrganisationId } from '../../../domain/organisation-id'
import { StatutPresence } from '../../../domain/statut-presence'
import {
  lieuModifie,
  motifModifie,
  rdvModifie,
  usagerModifie,
} from './changements'
import {
  lieuFixture,
  motifFixture,
  participationFixture,
  rdvFixture,
  usagerFixture,
} from './fixtures'

describe('motifModifie', () => {
  it('ne voit rien changer entre deux copies', () => {
    expect(motifModifie(motifFixture(3), motifFixture(3))).toBe(false)
  })

  it.each([
    ['le libellé', { nom: NomMotif('Autre motif') }],
    ['le caractère collectif', { collectif: true }],
    ['le suivi', { suivi: true }],
    ['l’instruction', { instruction: 'Munissez-vous de votre pièce' }],
    ['le type de lieu', { typeDeLieu: 'phone' }],
  ])('détecte un changement sur %s', (_, changement) => {
    expect(motifModifie(motifFixture(3), motifFixture(3, changement))).toBe(
      true,
    )
  })
})

describe('lieuModifie', () => {
  it('ne voit rien changer entre deux copies', () => {
    expect(lieuModifie(lieuFixture(11), lieuFixture(11))).toBe(false)
  })

  it.each([
    ['le nom', { nom: NomLieu('Autre lieu') }],
    ['l’adresse', { adresse: AdresseRdv('2 rue Neuve, 44000 Nantes') }],
    ['l’usage unique', { usageUnique: true }],
  ])('détecte un changement sur %s', (_, changement) => {
    expect(lieuModifie(lieuFixture(11), lieuFixture(11, changement))).toBe(true)
  })
})

describe('usagerModifie', () => {
  it('ne compare que l’identité', () => {
    const connu = usagerFixture(200)
    const recu = usagerFixture(200, { notifierParSms: true })

    expect(usagerModifie(connu, recu)).toBe(false)
  })

  it.each([
    ['le nom', { nom: NomExterne('Durand') }],
    ['l’e-mail', { email: EmailExterne('autre@example.com') }],
  ])('détecte un changement sur %s', (_, changement) => {
    expect(
      usagerModifie(usagerFixture(200), usagerFixture(200, changement)),
    ).toBe(true)
  })
})

describe('rdvModifie', () => {
  it('ne voit rien changer entre deux copies', () => {
    expect(rdvModifie(rdvFixture(1), rdvFixture(1))).toBe(false)
  })

  it.each([
    ['le statut', { statutPresence: StatutPresence('seen') }],
    ['la durée', { duree: DureeEnMinutes(30) }],
    ['le début', { debut: new Date('2026-08-18T14:00:00.000Z') }],
    ['la fin', { fin: new Date('2026-08-18T11:00:00.000Z') }],
    ['l’organisation', { organisationId: OrganisationId(9) }],
    ['le motif', { motif: motifFixture(4) }],
    ['le lieu', { lieu: lieuFixture(12) }],
  ])('détecte un changement sur %s', (_, changement) => {
    expect(rdvModifie(rdvFixture(1), rdvFixture(1, changement))).toBe(true)
  })

  it('détecte un lieu retouché derrière un rendez-vous par ailleurs identique', () => {
    const recu = rdvFixture(1, {
      lieu: lieuFixture(11, { nom: NomLieu('Médiathèque rénovée') }),
    })

    expect(rdvModifie(rdvFixture(1), recu)).toBe(true)
  })

  it('détecte la disparition du lieu', () => {
    expect(rdvModifie(rdvFixture(1), rdvFixture(1, { lieu: null }))).toBe(true)
  })

  it('détecte un participant en plus', () => {
    const recu = rdvFixture(1, {
      participations: [
        participationFixture(100, usagerFixture(200)),
        participationFixture(101, usagerFixture(201)),
      ],
    })

    expect(rdvModifie(rdvFixture(1), recu)).toBe(true)
  })

  it('détecte un participant remplacé à identifiant de participation égal', () => {
    const recu = rdvFixture(1, {
      participations: [participationFixture(100, usagerFixture(999))],
    })

    expect(rdvModifie(rdvFixture(1), recu)).toBe(true)
  })

  it('détecte un changement de présence d’un participant', () => {
    const recu = rdvFixture(1, {
      participations: [
        participationFixture(100, usagerFixture(200), {
          statutPresence: StatutPresence('seen'),
        }),
      ],
    })

    expect(rdvModifie(rdvFixture(1), recu)).toBe(true)
  })

  it('ignore les préférences de notification d’une participation', () => {
    const recu = rdvFixture(1, {
      participations: [
        participationFixture(100, usagerFixture(200), {
          notificationRappel: true,
        }),
      ],
    })

    expect(rdvModifie(rdvFixture(1), recu)).toBe(false)
  })

  it('ignore l’identité d’un usager, réconciliée par ailleurs', () => {
    // L'usager a son propre plan : le voir changer ici ferait réécrire le
    // rendez-vous sans raison.
    const recu = rdvFixture(1, {
      participations: [
        participationFixture(
          100,
          usagerFixture(200, { nom: NomExterne('Durand') }),
        ),
      ],
    })

    expect(rdvModifie(rdvFixture(1), recu)).toBe(false)
  })

  it('compare le nom d’atelier des rendez-vous collectifs', () => {
    const collectif = {
      ...rdvFixture(1),
      collectif: true as const,
      nom: NomAtelier('Atelier CV'),
      participantsMax: null,
    }
    const renomme = { ...collectif, nom: NomAtelier('Atelier emploi') }

    expect(rdvModifie(collectif, renomme)).toBe(true)
  })

  it('voit un rendez-vous devenir collectif', () => {
    const collectif = {
      ...rdvFixture(1),
      collectif: true as const,
      nom: NomAtelier('Atelier CV'),
      participantsMax: null,
    }

    expect(rdvModifie(rdvFixture(1), collectif)).toBe(true)
  })
})
