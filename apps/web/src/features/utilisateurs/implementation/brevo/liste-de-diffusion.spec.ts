import {
  AdresseCourriel,
  Nom,
  Prenom,
  RoleBrevo,
  Telephone,
  UtilisateurId,
} from '../../domain'
import { versContactBrevo } from './liste-de-diffusion'

const utilisateurId = UtilisateurId('3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f')
const courriel = AdresseCourriel('jeanne@example.com')

describe('contact Brevo d’un inscrit', () => {
  it('envoie des attributs vides pour une identité absente', () => {
    expect(
      versContactBrevo({
        utilisateurId,
        courriel,
        prenom: null,
        nom: null,
        telephone: null,
        roles: [RoleBrevo('Mediateur')],
      }),
    ).toEqual({
      email: 'jeanne@example.com',
      attributes: {
        EXT_ID: utilisateurId,
        FIRSTNAME: '',
        LASTNAME: '',
        SMS: '',
        ROLES: ['Médiateur'],
      },
    })
  })

  it('traduit chaque rôle en libellé Brevo', () => {
    expect(
      versContactBrevo({
        utilisateurId,
        courriel,
        prenom: Prenom('Jeanne'),
        nom: Nom('Martin'),
        telephone: Telephone('06 12 34 56 78'),
        roles: [
          RoleBrevo('Mediateur'),
          RoleBrevo('ConseillerNumerique'),
          RoleBrevo('Coordinateur'),
        ],
      }).attributes,
    ).toEqual({
      EXT_ID: utilisateurId,
      FIRSTNAME: 'Jeanne',
      LASTNAME: 'Martin',
      SMS: '+33612345678',
      ROLES: ['Médiateur', 'Conseiller numérique', 'Coordinateur'],
    })
  })
})
