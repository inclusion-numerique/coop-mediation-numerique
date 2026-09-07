import { FormationLabel } from '@gouvfr-anct/lieux-de-mediation-numerique'

/**
 * Ce que la coop propose des nomenclatures du schéma national.
 *
 * La saisie circule dans le vocabulaire du standard, du formulaire jusqu'au
 * domaine : les écrans citent donc directement les énumérations du paquet, et
 * il n'y a plus qu'une traduction — au transfer, vers les noms sous lesquels la
 * base les stocke.
 *
 * Neuf nomenclatures sur dix sont offertes en entier, et n'ont rien à déclarer
 * ici. La dixième fait exception.
 */

/**
 * Les labels de formation que la coop sait enregistrer.
 *
 * Le schéma national en compte un de plus — « Étapes numériques (La Poste) » —
 * auquel la base ne sait pas donner de nom. L'offrir à la saisie ferait
 * disparaître le choix au moment de l'enregistrer.
 */
export const FormationLabelPropose = {
  FormeAMonEspaceSante: FormationLabel.FormeAMonEspaceSante,
  FormeADuplex: FormationLabel.FormeADuplex,
  ArniaMednum: FormationLabel.ArniaMednum,
  CollectifRessourcesEtActeursReemploi:
    FormationLabel.CollectifRessourcesEtActeursReemploi,
  FabriquesDeTerritoire: FormationLabel.FabriquesDeTerritoire,
  LesEclaireurs: FormationLabel.LesEclaireurs,
  MesPapiers: FormationLabel.MesPapiers,
  Ordi3: FormationLabel.Ordi3,
  SudLabs: FormationLabel.SudLabs,
} as const satisfies Record<string, FormationLabel>

export type FormationLabelPropose =
  (typeof FormationLabelPropose)[keyof typeof FormationLabelPropose]

const proposes = new Set<string>(Object.values(FormationLabelPropose))

/**
 * Les labels d'une fiche que la saisie peut réafficher.
 *
 * Une fiche porte le vocabulaire du standard en entier ; le formulaire n'en
 * offre que ce que la base sait nommer. Le tri est théorique — la base ne peut
 * pas avoir stocké l'exception — mais il évite de l'affirmer avec un `as`.
 */
export const formationsLabelsProposees = (
  labels: readonly FormationLabel[],
): readonly FormationLabelPropose[] =>
  labels.filter((label): label is FormationLabelPropose => proposes.has(label))

/**
 * Les valeurs d'une énumération du schéma national reconnues parmi des libellés
 * bruts.
 *
 * Une source externe rend des chaînes ; les traiter d'emblée comme des valeurs
 * du standard demanderait un `as`, c'est-à-dire une affirmation qu'on ne vérifie
 * pas. Ce qu'on ne reconnaît pas est écarté.
 */
export const reconnues = <Valeur extends string>(
  enumeration: Record<string, Valeur>,
  libelles: readonly string[],
): readonly Valeur[] => {
  const connues = new Set<string>(Object.values(enumeration))

  return libelles.filter((libelle): libelle is Valeur => connues.has(libelle))
}
