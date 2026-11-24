import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import {
  type IdentiteDuProfil,
  identiteDuProfil,
  type SectionsDuProfil,
  sectionsDuProfil,
} from '@/features/utilisateurs/ui/presenters/mon-profil.presenter'

type Profil = {
  readonly coordinateur: boolean
  readonly conseillerNumerique: boolean
  readonly phone: string | null
}

const roles: Readonly<
  Record<string, Pick<Profil, 'coordinateur' | 'conseillerNumerique'>>
> = {
  'médiateur hors dispositif': {
    coordinateur: false,
    conseillerNumerique: false,
  },
  'conseiller numérique': { coordinateur: false, conseillerNumerique: true },
  coordinateur: { coordinateur: true, conseillerNumerique: false },
  'coordinateur conseiller numérique': {
    coordinateur: true,
    conseillerNumerique: true,
  },
}

const visibilites: Readonly<Record<string, boolean>> = {
  affichée: true,
  masquée: false,
}

const visible = (visibilite: string): boolean => {
  const valeur = visibilites[visibilite]
  assert.ok(valeur !== undefined, `Visibilité inconnue : ${visibilite}`)
  return valeur
}

const sansRole = { coordinateur: false, conseillerNumerique: false }

const consultation: {
  profil?: Profil
  identite?: IdentiteDuProfil
  sections?: SectionsDuProfil
} = {}

const profilDecrit = (): Profil => {
  assert.ok(consultation.profil, "Aucune personne n'a été décrite")
  return consultation.profil
}

const sections = (): SectionsDuProfil => {
  assert.ok(consultation.sections, "Le profil n'a pas été présenté")
  return consultation.sections
}

const identite = (): IdentiteDuProfil => {
  assert.ok(consultation.identite, "Le profil n'a pas été présenté")
  return consultation.identite
}

Given(
  'une personne qui consulte son profil en tant que {string}',
  (role: string) => {
    const roleDecrit = roles[role]
    assert.ok(roleDecrit, `Rôle inconnu : ${role}`)
    consultation.profil = { ...roleDecrit, phone: null }
  },
)

Given(
  'une personne qui consulte son profil avec le téléphone {string}',
  (telephone: string) => {
    consultation.profil = { ...sansRole, phone: telephone }
  },
)

Given('une personne qui consulte son profil sans téléphone connu', () => {
  consultation.profil = { ...sansRole, phone: null }
})

When('son profil est présenté', () => {
  const { coordinateur, conseillerNumerique, phone } = profilDecrit()
  consultation.sections = sectionsDuProfil({
    coordinateur,
    conseillerNumerique,
  })
  consultation.identite = identiteDuProfil({
    name: 'Camille Martin',
    email: 'camille.martin@example.com',
    phone,
  })
})

Then('la carte du contrat est {string}', (visibilite: string) => {
  assert.strictEqual(sections().contrat, visible(visibilite))
})

Then(
  'la carte de la médiation numérique est {string}',
  (visibilite: string) => {
    assert.strictEqual(sections().mediation, visible(visibilite))
  },
)

Then('la carte de suppression du compte est {string}', (visibilite: string) => {
  assert.strictEqual(sections().suppression, visible(visibilite))
})

Then('le téléphone affiché est {string}', (telephone: string) => {
  assert.strictEqual(identite().telephone, telephone)
})

Then("aucun téléphone n'est affiché", () => {
  assert.strictEqual(identite().telephone, null)
})
