import { referentFromMainContact } from '@app/web/features/structures/main/mainContact'
import type { Prisma } from '@prisma/client'

// Sélection main d'une employeuse pour la matérialiser en lieu d'activité et pour l'afficher
// pendant l'inscription (ADR-002 étape 6). Le nom vient de la denomination, l'adresse de la
// relation `main.adresse`, les référents du jsonb `contact`.
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

// Nom employeuse : denomination_antenne sinon denomination_sirene (même règle que sessionUser /
// getActeurEmploiForDate).
export const employeuseMainNom = (structure: EmployeuseMainPayload): string =>
  structure.denominationAntenne ?? structure.denominationSirene ?? ''

// Données de l'employeuse (source de vérité main) sous la forme attendue par `lieu_inclusion`.
// `nom`/`adresse`/`commune`/`codePostal` sont non-null (colonnes requises du lieu ; défaut `''`
// quand l'adresse main manque). `complementAdresse` est abandonné (absent de main -> null,
// décision 6 révisée), les référents sont lus depuis `contact`.
export const employeuseMainToLieuData = (structure: EmployeuseMainPayload) => ({
  nom: employeuseMainNom(structure),
  adresse: adresseMainToString(structure.adresse),
  commune: structure.adresse?.nomCommune ?? '',
  codePostal: structure.adresse?.codePostal ?? '',
  codeInsee: structure.adresse?.codeInsee ?? null,
  complementAdresse: null,
  siret: structure.siret ?? null,
  rna: structure.rna ?? null,
  ...referentFromMainContact(structure.contact),
})

// Sélection étendue pour l'affichage admin (page utilisateur) : + les timestamps rendus par
// `getStructuresInfos` (« Créé le » / « Structure supprimée le »).
export const employeuseMainAdminSelect = {
  ...employeuseMainSelect,
  createdAt: true,
  deletedAt: true,
} satisfies Prisma.StructureAdministrativeMainSelect

export type EmployeuseMainAdminPayload =
  Prisma.StructureAdministrativeMainGetPayload<{
    select: typeof employeuseMainAdminSelect
  }>

// Employeuse main sous la forme attendue par `getStructuresInfos` des pages admin utilisateur.
// L'`id` reste l'uuid COOP : le lien `/administration/structures-employeuses/[id]` lit encore la coop
// pendant la transition (déplacer cette route vers l'int main relève de l'échange final). Les autres
// champs viennent de main (source de vérité).
export const employeuseMainToAdminStructure = (
  structureCoopId: string,
  structure: EmployeuseMainAdminPayload | null,
) => {
  const lieuData = structure ? employeuseMainToLieuData(structure) : null
  return {
    id: structureCoopId,
    nom: lieuData?.nom ?? '',
    adresse: lieuData?.adresse ?? '',
    commune: lieuData?.commune ?? '',
    codePostal: lieuData?.codePostal ?? '',
    codeInsee: lieuData?.codeInsee ?? null,
    siret: lieuData?.siret ?? null,
    rna: lieuData?.rna ?? null,
    creation: structure?.createdAt ?? null,
    suppression: structure?.deletedAt ?? null,
  }
}
