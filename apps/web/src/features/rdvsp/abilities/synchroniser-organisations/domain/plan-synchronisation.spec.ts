import { EmailExterne, TelephoneExterne } from '../../../domain/identite'
import { NomOrganisation } from '../../../domain/libelle'
import type { Organisation } from '../../../domain/organisation'
import { OrganisationId } from '../../../domain/organisation-id'
import { planifierSynchronisation } from './plan-synchronisation'

const organisation = (id: number, nom = 'Médiathèque'): Organisation => ({
  id: OrganisationId(id),
  nom: NomOrganisation(nom),
  email: null,
  telephone: null,
  verticale: null,
})

describe('planifierSynchronisation', () => {
  it('crée les organisations inconnues', () => {
    const plan = planifierSynchronisation({
      recues: [organisation(1)],
      connues: [],
      rattachements: [],
    })

    expect(plan.aCreer.map(({ id }) => id)).toEqual([1])
    expect(plan.aMettreAJour).toEqual([])
  })

  it.each([
    ['le nom', { nom: NomOrganisation('Autre nom') }],
    ['l’e-mail', { email: EmailExterne('contact@example.com') }],
    ['le téléphone', { telephone: TelephoneExterne('+33100000000') }],
    ['la verticale', { verticale: 'rdv-aide-numerique' }],
  ])('met à jour celles dont %s a changé', (_, changement) => {
    const plan = planifierSynchronisation({
      recues: [{ ...organisation(1), ...changement }],
      connues: [organisation(1)],
      rattachements: [OrganisationId(1)],
    })

    expect(plan.aMettreAJour.map(({ id }) => id)).toEqual([1])
    expect(plan.aCreer).toEqual([])
    expect(plan.inchangees).toEqual([])
  })

  it('laisse tranquilles celles qui n’ont pas bougé', () => {
    const plan = planifierSynchronisation({
      recues: [organisation(1)],
      connues: [organisation(1)],
      rattachements: [OrganisationId(1)],
    })

    expect(plan.inchangees.map(({ id }) => id)).toEqual([1])
    expect(plan.aMettreAJour).toEqual([])
    expect(plan.aRattacher).toEqual([])
    expect(plan.aDetacher).toEqual([])
  })

  it('rattache le compte aux organisations qu’il n’avait pas encore', () => {
    const plan = planifierSynchronisation({
      recues: [organisation(1), organisation(2)],
      connues: [organisation(1)],
      rattachements: [OrganisationId(1)],
    })

    expect(plan.aRattacher).toEqual([2])
  })

  it('détache le compte d’une organisation que l’API ne renvoie plus', () => {
    // Le cas que l'ancienne implémentation ne pouvait pas atteindre : elle ne
    // cherchait les liens à retirer que parmi les organisations reçues.
    const plan = planifierSynchronisation({
      recues: [organisation(1)],
      connues: [organisation(1), organisation(2)],
      rattachements: [OrganisationId(1), OrganisationId(2)],
    })

    expect(plan.aDetacher).toEqual([2])
  })

  it('détache même une organisation que La Coop ne connaît plus en propre', () => {
    const plan = planifierSynchronisation({
      recues: [],
      connues: [],
      rattachements: [OrganisationId(9)],
    })

    expect(plan.aDetacher).toEqual([9])
  })

  it('ne détache rien quand tous les rattachements sont confirmés', () => {
    const plan = planifierSynchronisation({
      recues: [organisation(1), organisation(2)],
      connues: [organisation(1), organisation(2)],
      rattachements: [OrganisationId(1), OrganisationId(2)],
    })

    expect(plan.aDetacher).toEqual([])
  })
})
