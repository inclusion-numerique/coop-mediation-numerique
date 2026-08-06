import {
  ContactReferent,
  referentAffichage,
} from '@app/web/features/employeuse'
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
export const employeuseMainToLieuData = (structure: EmployeuseMainPayload) => {
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
    adresse: adresseMainToString(structure.adresse),
    commune: structure.adresse?.nomCommune ?? '',
    codePostal: structure.adresse?.codePostal ?? '',
    codeInsee: structure.adresse?.codeInsee ?? null,
    complementAdresse: null,
    siret: structure.siret ?? null,
    rna: structure.rna ?? null,
    nomReferent,
    courrielReferent,
    telephoneReferent,
  }
}
