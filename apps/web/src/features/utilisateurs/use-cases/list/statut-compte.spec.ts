import { statutCompte } from './statut-compte'

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000
const now = new Date()

const createdDaysAgo = (days: number) =>
  new Date(Date.now() - days * MILLISECONDS_IN_A_DAY)

describe('Statut compte', () => {
  it('is "Inscription en cours" when user just started his inscription', () => {
    const statut: string = statutCompte(now)({
      created: new Date(),
      lastLogin: null,
      deleted: null,
      inscriptionValidee: null,
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Inscription en cours')
  })

  it('is "Inscription en cours J+7" when user started his inscription more than 7 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(8),
      lastLogin: null,
      deleted: null,
      inscriptionValidee: null,
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Inscription en cours J+7')
  })

  it('is "Inscription en cours J+30" when user started his inscription more than 30 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(31),
      lastLogin: null,
      deleted: null,
      inscriptionValidee: null,
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Inscription en cours J+30')
  })

  it('is "Inscription en cours J+60" when user started his inscription more than 60 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(61),
      lastLogin: null,
      deleted: null,
      inscriptionValidee: null,
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Inscription en cours J+60')
  })

  it('is "Inscription en cours J+90" when user started his inscription more than 90 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(91),
      lastLogin: null,
      deleted: null,
      inscriptionValidee: null,
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Inscription en cours J+90')
  })

  it('is "Nouveau" when user just finished his inscription', () => {
    const statut: string = statutCompte(now)({
      created: new Date(),
      deleted: null,
      inscriptionValidee: new Date(),
      lastLogin: new Date(),
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Nouveau')
  })

  it('is "Nouveau J+7" when user finished his inscription more than 7 days ago without any activity', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(8),
      deleted: null,
      inscriptionValidee: createdDaysAgo(8),
      lastLogin: createdDaysAgo(8),
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Nouveau J+7')
  })

  it('is "Nouveau J+30" when user finished his inscription more than 30 days ago without any activity', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(31),
      deleted: null,
      inscriptionValidee: createdDaysAgo(31),
      lastLogin: createdDaysAgo(31),
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Nouveau J+30')
  })

  it('is "Nouveau J+60" when user finished his inscription more than 60 days ago without any activity', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(61),
      deleted: null,
      inscriptionValidee: createdDaysAgo(61),
      lastLogin: createdDaysAgo(61),
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Nouveau J+60')
  })

  it('is "Nouveau J+90" when user finished his inscription more than 90 days ago without any activity', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(91),
      deleted: null,
      inscriptionValidee: createdDaysAgo(91),
      lastLogin: createdDaysAgo(91),
      role: 'user',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Nouveau J+90')
  })

  it('is "Actif" when mediateur has at least one recent mediation activity', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(20),
      deleted: null,
      inscriptionValidee: createdDaysAgo(20),
      lastLogin: createdDaysAgo(20),
      role: 'user',
      mediateur: {
        derniereCreationActivite: createdDaysAgo(5),
      },
      coordinateur: null,
    })

    expect(statut).toBe('Actif')
  })

  it('is "Inactif J+30" when mediateur last mediation activity was created more than 30 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(31),
      role: 'user',
      mediateur: {
        derniereCreationActivite: createdDaysAgo(31),
      },
      coordinateur: null,
    })

    expect(statut).toBe('Inactif J+30')
  })

  it('is "Inactif J+90" when mediateur last mediation activity was created more than 90 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(91),
      role: 'user',
      mediateur: {
        derniereCreationActivite: createdDaysAgo(91),
      },
      coordinateur: null,
    })

    expect(statut).toBe('Inactif J+90')
  })

  it('is "Inactif J+180" when mediateur last mediation activity was created more than 180 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(181),
      role: 'user',
      mediateur: {
        derniereCreationActivite: createdDaysAgo(181),
      },
      coordinateur: null,
    })

    expect(statut).toBe('Inactif J+180')
  })

  it('is "Nouveau" when coordinateur has no médiateurs coordonnés', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(1),
      deleted: null,
      inscriptionValidee: createdDaysAgo(1),
      lastLogin: createdDaysAgo(1),
      role: 'user',
      mediateur: null,
      coordinateur: {
        derniereCreationActivite: null,
        _count: { mediateursCoordonnes: 0 },
      },
    })

    expect(statut).toBe('Nouveau')
  })

  it('is "Actif" when coordinateur has at least one médiateur coordonné', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(1),
      deleted: null,
      inscriptionValidee: createdDaysAgo(1),
      lastLogin: createdDaysAgo(1),
      role: 'user',
      mediateur: null,
      coordinateur: {
        derniereCreationActivite: null,
        _count: { mediateursCoordonnes: 1 },
      },
    })

    expect(statut).toBe('Actif')
  })

  it('is "Inactif J+30" when coordinateur has at least one médiateur coordonné, but not logged in since more than 30 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(31),
      role: 'user',
      mediateur: null,
      coordinateur: {
        derniereCreationActivite: null,
        _count: { mediateursCoordonnes: 1 },
      },
    })

    expect(statut).toBe('Inactif J+30')
  })

  it('is "Inactif J+180" when coordinateur has at least one médiateur coordonné, but not logged in since more than 180 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(181),
      role: 'user',
      mediateur: null,
      coordinateur: {
        derniereCreationActivite: null,
        _count: { mediateursCoordonnes: 1 },
      },
    })

    expect(statut).toBe('Inactif J+180')
  })

  it('is "Actif" when coordinateur has at least one activité', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(1),
      deleted: null,
      inscriptionValidee: createdDaysAgo(1),
      lastLogin: createdDaysAgo(1),
      role: 'user',
      mediateur: null,
      coordinateur: {
        derniereCreationActivite: createdDaysAgo(1),
        _count: { mediateursCoordonnes: 0 },
      },
    })

    expect(statut).toBe('Actif')
  })

  it('is "Inactif J+180" when coordinateur has at least one activité, but not logged in since more than 180 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(181),
      role: 'user',
      mediateur: null,
      coordinateur: {
        derniereCreationActivite: createdDaysAgo(181),
        _count: { mediateursCoordonnes: 0 },
      },
    })

    expect(statut).toBe('Inactif J+180')
  })

  it('is "Nouveau" when is coordinateur and mediateur and has just created his account', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(1),
      deleted: null,
      inscriptionValidee: createdDaysAgo(1),
      lastLogin: createdDaysAgo(1),
      role: 'user',
      mediateur: {
        derniereCreationActivite: null,
      },
      coordinateur: {
        derniereCreationActivite: null,
        _count: { mediateursCoordonnes: 0 },
      },
    })

    expect(statut).toBe('Nouveau')
  })

  it('is "Actif" when coordinateur and mediateur has a coordination team but no mediation activity', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(1),
      role: 'user',
      mediateur: {
        derniereCreationActivite: null,
      },
      coordinateur: {
        derniereCreationActivite: null,
        _count: { mediateursCoordonnes: 1 },
      },
    })

    expect(statut).toBe('Actif')
  })

  it('is "Actif" when coordinateur and mediateur has a coordination activity but no mediation activity', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(1),
      role: 'user',
      mediateur: {
        derniereCreationActivite: null,
      },
      coordinateur: {
        derniereCreationActivite: createdDaysAgo(50),
        _count: { mediateursCoordonnes: 0 },
      },
    })

    expect(statut).toBe('Actif')
  })

  it('is "Inactif J+30" when coordinateur and mediateur has no activity as coordinateur but has done his last mediation activity 50 days ago', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(1),
      role: 'User',
      mediateur: {
        derniereCreationActivite: createdDaysAgo(50),
      },
      coordinateur: {
        derniereCreationActivite: null,
        _count: { mediateursCoordonnes: 0 },
      },
    })

    expect(statut).toBe('Inactif J+30')
  })

  it('is "Admin" when role is Admin', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: null,
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(1),
      role: 'Admin',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Admin')
  })

  it('is "Supprimé" when user account is deleted', () => {
    const statut: string = statutCompte(now)({
      created: createdDaysAgo(200),
      deleted: createdDaysAgo(1),
      inscriptionValidee: createdDaysAgo(200),
      lastLogin: createdDaysAgo(150),
      role: 'User',
      mediateur: null,
      coordinateur: null,
    })

    expect(statut).toBe('Supprimé')
  })
})
