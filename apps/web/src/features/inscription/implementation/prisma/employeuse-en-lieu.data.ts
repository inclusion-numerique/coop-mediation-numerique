import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import {
  ContactReferent,
  referentAffichage,
} from '@app/web/features/employeuse/server'
import type { Prisma } from '@prisma/client'

// Matérialisation d'une employeuse en lieu d'activité : quand une personne déclare que son
// employeur est aussi l'un de ses lieux, on recopie ses données `main` dans une ligne
// `coop.lieu_inclusion`. C'est une écriture de LIEU, faite à partir d'une employeuse — d'où sa
// place ici, du côté de l'inscription qui la déclenche, et non dans la feature employeuse.
export const employeuseMainSelect = {
  id: true,
  denominationSirene: true,
  denominationAntenne: true,
  siret: true,
  rna: true,
  contact: true,
  structureCoopId: true,
  adresse: {
    select: {
      numeroVoie: true,
      repetition: true,
      nomVoie: true,
      codePostal: true,
      codeInsee: true,
      nomCommune: true,
    },
  },
} satisfies Prisma.StructureAdministrativeMainSelect

export type EmployeuseMainPayload =
  Prisma.StructureAdministrativeMainGetPayload<{
    select: typeof employeuseMainSelect
  }>

// Adresse "à la ligne" reconstruite depuis les composantes structurées de `main.adresse`
// (ex. `12`, `bis`, `rue de la Réconciliation` -> "12 bis rue de la Réconciliation").
const adresseMainToString = (
  adresse: EmployeuseMainPayload['adresse'],
): string => {
  if (!adresse) return ''
  return [adresse.numeroVoie, adresse.repetition, adresse.nomVoie]
    .filter((part) => part !== null && part !== undefined && `${part}` !== '')
    .join(' ')
}

// Nom employeuse : denomination_antenne sinon denomination_sirene (même règle que le domaine de
// la feature employeuse, que ce module rejoindra avec l'ability de matérialisation du lieu).
export const employeuseMainNom = (structure: EmployeuseMainPayload): string =>
  structure.denominationAntenne ?? structure.denominationSirene ?? ''

// Données de l'employeuse (source de vérité main) sous la forme attendue par `lieu_inclusion`.
// `nom`/`adresse`/`commune`/`codePostal` sont non-null (colonnes requises du lieu ; défaut `''`
// quand l'adresse main manque). `complementAdresse` est abandonné (absent de main -> null,
// décision 6 révisée), les référents sont lus depuis `contact`.
/**
 * L'adresse retenue pour la ligne à créer.
 *
 * Sans adresse de la Base Adresse Nationale, on recompose celle de `main` — le
 * détachement s'en sert pour retrouver le lieu, et il n'a rien à géocoder. Le
 * rattachement, lui, en fournit toujours une : c'est elle qui fait foi, et elle
 * apporte l'identifiant et les coordonnées que SIRENE ne connaît pas.
 */
const adresseRetenue = (
  structure: EmployeuseMainPayload,
  adresseBan?: AdresseBanData,
) =>
  adresseBan == null
    ? {
        adresse: adresseMainToString(structure.adresse),
        commune: structure.adresse?.nomCommune ?? '',
        codePostal: structure.adresse?.codePostal ?? '',
        codeInsee: structure.adresse?.codeInsee ?? null,
      }
    : {
        adresse: adresseBan.nom,
        commune: adresseBan.commune,
        codePostal: adresseBan.codePostal,
        codeInsee: adresseBan.codeInsee,
        banId: adresseBan.id,
        latitude: adresseBan.latitude,
        longitude: adresseBan.longitude,
      }

export const employeuseMainToLieuData = (
  structure: EmployeuseMainPayload,
  adresseBan?: AdresseBanData,
) => {
  // Les trois champs référent sont nommés un par un, et NON répandus depuis
  // `referentAffichage` : ce résultat part tel quel dans un `lieu_inclusion.create`,
  // où le moindre champ surnuméraire fait échouer Prisma à l'exécution. Un spread
  // ne déclenche pas le contrôle des propriétés excédentaires de TypeScript —
  // `tsc` reste muet et seule l'intégration le voit. C'est ce qui est arrivé
  // quand `aUnReferent` a rejoint la mise à plat du référent.
  const { nomReferent, courrielReferent, telephoneReferent } =
    referentAffichage(ContactReferent(structure.contact))

  return {
    nom: employeuseMainNom(structure),
    ...adresseRetenue(structure, adresseBan),
    complementAdresse: null,
    siret: structure.siret ?? null,
    // `main.structure_administrative` fait foi sur le SIRET, et il est lu ICI,
    // côté serveur : le client choisit l'employeuse, jamais la valeur. On peut
    // donc horodater cette provenance — à la différence d'un SIRET soumis par
    // le navigateur, qui reste non vérifié (cf. `lieuInclusionDepuisAdresse`).
    synchronisationSiret: structure.siret == null ? null : new Date(),
    rna: structure.rna ?? null,
    nomReferent,
    courrielReferent,
    telephoneReferent,
  }
}
