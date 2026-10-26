import {
  AdresseCourriel,
  Nom,
  Prenom,
  RoleBrevo,
  SANS_CONTRAT,
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
        contrat: SANS_CONTRAT,
      }),
    ).toEqual({
      email: 'jeanne@example.com',
      attributes: {
        EXT_ID: utilisateurId,
        FIRSTNAME: '',
        LASTNAME: '',
        SMS: '',
        ROLES: ['Médiateur'],
        COOP_DATE_FIN_CONTRAT: '',
        COOP_DATE_RUPTURE: '',
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
        contrat: SANS_CONTRAT,
      }).attributes,
    ).toEqual({
      EXT_ID: utilisateurId,
      FIRSTNAME: 'Jeanne',
      LASTNAME: 'Martin',
      SMS: '+33612345678',
      ROLES: ['Médiateur', 'Conseiller numérique', 'Coordinateur'],
      COOP_DATE_FIN_CONTRAT: '',
      COOP_DATE_RUPTURE: '',
    })
  })

  it('envoie les dates de contrat au format AAAA-MM-JJ', () => {
    expect(
      versContactBrevo({
        utilisateurId,
        courriel,
        prenom: null,
        nom: null,
        telephone: null,
        roles: [RoleBrevo('ConseillerNumerique')],
        contrat: {
          fin: new Date('2026-12-15'),
          rupture: new Date('2026-07-10'),
        },
      }).attributes,
    ).toMatchObject({
      COOP_DATE_FIN_CONTRAT: '2026-12-15',
      COOP_DATE_RUPTURE: '2026-07-10',
    })
  })

  it('envoie la rupture d’un CDI sans date de fin', () => {
    expect(
      versContactBrevo({
        utilisateurId,
        courriel,
        prenom: null,
        nom: null,
        telephone: null,
        roles: [RoleBrevo('ConseillerNumerique')],
        contrat: { fin: null, rupture: new Date('2026-06-30') },
      }).attributes,
    ).toMatchObject({
      COOP_DATE_FIN_CONTRAT: '',
      COOP_DATE_RUPTURE: '2026-06-30',
    })
  })

  it('efface une date absente par une chaîne vide, Brevo ignorant null', () => {
    expect(
      versContactBrevo({
        utilisateurId,
        courriel,
        prenom: null,
        nom: null,
        telephone: null,
        roles: [RoleBrevo('ConseillerNumerique')],
        contrat: { fin: new Date('2026-12-15'), rupture: null },
      }).attributes,
    ).toMatchObject({
      COOP_DATE_FIN_CONTRAT: '2026-12-15',
      COOP_DATE_RUPTURE: '',
    })
  })
})
