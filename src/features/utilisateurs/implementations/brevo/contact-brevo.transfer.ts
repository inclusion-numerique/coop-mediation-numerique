import { type ContactAImporter, RoleBrevo } from '../../domain'

const libellesDesRoles: readonly {
  readonly role: RoleBrevo
  readonly libelle: string
}[] = [
  { role: RoleBrevo('Mediateur'), libelle: 'Médiateur' },
  { role: RoleBrevo('ConseillerNumerique'), libelle: 'Conseiller numérique' },
  { role: RoleBrevo('Coordinateur'), libelle: 'Coordinateur' },
]

const libelleDuRole = (role: RoleBrevo): string =>
  libellesDesRoles.find((entree) => entree.role === role)?.libelle ?? role

export type ContactBrevoJson = {
  readonly email: string
  readonly attributes: {
    readonly EXT_ID: string
    readonly FIRSTNAME: string
    readonly LASTNAME: string
    readonly SMS: string
    readonly ROLES: readonly string[]
    readonly COOP_DATE_FIN_CONTRAT: string
    readonly COOP_DATE_RUPTURE: string
  }
}

const dateBrevo = (date: Date | null): string =>
  date?.toISOString().slice(0, 10) ?? ''

export const versContactBrevo = (
  contact: ContactAImporter,
): ContactBrevoJson => ({
  email: contact.courriel,
  attributes: {
    EXT_ID: contact.utilisateurId,
    FIRSTNAME: contact.prenom ?? '',
    LASTNAME: contact.nom ?? '',
    SMS: contact.telephone ?? '',
    ROLES: contact.roles.map(libelleDuRole),
    COOP_DATE_FIN_CONTRAT: dateBrevo(contact.contrat.fin),
    COOP_DATE_RUPTURE: dateBrevo(contact.contrat.rupture),
  },
})
