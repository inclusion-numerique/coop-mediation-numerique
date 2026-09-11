import { contactDuRegistre } from './contact-du-registre'

describe('le contact que le registre rend, relu depuis son jsonb', () => {
  it('lit le téléphone, les courriels et les sites web', () => {
    const contact = contactDuRegistre({
      telephone: '+33180059880',
      courriels: { email: 'contact@example.fr' },
      site_web: 'https://www.example.fr',
    })

    expect(contact.telephone).toBe('+33180059880')
    expect(contact.courriels).toEqual(['contact@example.fr'])
    expect(contact.site_web).toEqual(['https://www.example.fr'])
  })

  it('sépare les listes au séparateur du standard', () => {
    const contact = contactDuRegistre({
      courriels: { email: 'premier@example.fr|second@example.fr' },
      site_web: 'https://premier.fr|https://second.fr',
    })

    expect(contact.courriels).toEqual([
      'premier@example.fr',
      'second@example.fr',
    ])
    expect(contact.site_web).toEqual([
      'https://premier.fr',
      'https://second.fr',
    ])
  })

  it('garde les valeurs reconnues et laisse tomber les autres', () => {
    const contact = contactDuRegistre({
      telephone: 'appelez-nous',
      courriels: { email: 'pas-une-adresse|valide@example.fr' },
      site_web: 'https://valide.fr|pas-une-url',
    })

    expect(contact.telephone).toBeUndefined()
    expect(contact.courriels).toEqual(['valide@example.fr'])
    expect(contact.site_web).toEqual(['https://valide.fr'])
  })

  it('rend un contact vide quand le registre ne dit rien', () => {
    expect(contactDuRegistre(null)).toEqual({})
    expect(contactDuRegistre({})).toEqual({})
    expect(contactDuRegistre({ telephone: '', site_web: '   ' })).toEqual({})
  })

  it('rend un contact vide de ce qui n’est pas un objet', () => {
    expect(contactDuRegistre('contact@example.fr')).toEqual({})
    expect(contactDuRegistre(['contact@example.fr'])).toEqual({})
    expect(contactDuRegistre(42)).toEqual({})
  })

  it('ne se fie pas à la forme de ce que d’autres producteurs y ont mis', () => {
    expect(
      contactDuRegistre({ courriels: 'contact@example.fr' }).courriels,
    ).toBeUndefined()
    expect(
      contactDuRegistre({ courriels: { email: null } }).courriels,
    ).toBeUndefined()
    expect(contactDuRegistre({ telephone: 42 }).telephone).toBeUndefined()
    expect(
      contactDuRegistre({ site_web: ['https://x.fr'] }).site_web,
    ).toBeUndefined()
  })
})
