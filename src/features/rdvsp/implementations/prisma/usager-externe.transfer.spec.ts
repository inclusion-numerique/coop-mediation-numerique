import { describe, expect, it } from 'vitest'
import { UsagerId } from '../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../domain/identite'
import { usagerExterneToDomain } from './usager-externe.transfer'

const ligne = {
  id: 7,
  firstName: 'Jeanne',
  lastName: 'Martin',
  email: 'Jeanne@Exemple.fr',
  phoneNumber: '06 12 34 56 78',
  address: '1 rue de la Paix',
  birthDate: new Date('1980-02-03'),
}

describe('usager externe lu en base', () => {
  it('rend l’identité dans les types du domaine', () => {
    expect(usagerExterneToDomain(ligne)).toEqual({
      rdvUserId: UsagerId(7),
      prenom: PrenomExterne('Jeanne'),
      nom: NomExterne('Martin'),
      email: EmailExterne('jeanne@exemple.fr'),
      telephone: TelephoneExterne('06 12 34 56 78'),
      adresse: '1 rue de la Paix',
      birthDate: new Date('1980-02-03'),
    })
  })

  it('tient pour absentes les coordonnées vides ou illisibles', () => {
    expect(
      usagerExterneToDomain({
        ...ligne,
        firstName: ' ',
        lastName: '',
        email: 'pas un courriel',
        phoneNumber: null,
      }),
    ).toEqual({
      rdvUserId: UsagerId(7),
      prenom: null,
      nom: null,
      email: null,
      telephone: null,
      adresse: '1 rue de la Paix',
      birthDate: new Date('1980-02-03'),
    })
  })
})
