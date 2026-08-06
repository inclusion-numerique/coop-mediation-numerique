import type { UniteLegale } from '@app/web/external-apis/apiEntrepriseApiModels'
import type { StructureCreationDataWithSiret } from '@app/web/features/structures/StructureValidation'
import { getTypologieFromApiEntreprise } from '@app/web/structure/typologieFromApiEntreprise'
import { toTitleCase } from '@app/web/utils/toTitleCase'

export const structureCreationDataWithSiretFromUniteLegale = ({
  nature_juridique,
  complements,
  nom_raison_sociale,
  nom_complet,
  matching_etablissements,
}: UniteLegale): StructureCreationDataWithSiret[] => {
  const typologie = getTypologieFromApiEntreprise({
    complements,
    nature_juridique,
  })

  return matching_etablissements
    .filter(({ etat_administratif }) => etat_administratif === 'A')
    .map(
      ({
        adresse,
        code_postal,
        commune,
        libelle_commune,
        liste_enseignes,
        est_siege,
        siret,
      }) => {
        const nomEnseigne = liste_enseignes?.at(0)

        let nom = est_siege
          ? nom_raison_sociale
          : nomEnseigne && nomEnseigne !== nom_raison_sociale
            ? `${nomEnseigne} · ${nom_raison_sociale}`
            : nom_raison_sociale

        if (!nom) {
          nom = nom_complet
        }

        return {
          siret,
          adresse: toTitleCase(adresse),
          typologie,
          // Le code postal était le seul composant d'adresse jamais repris, alors
          // que l'API le fournit. Son absence remontait jusqu'à `main.adresse`,
          // dont la colonne restait vide — et `AdresseEmployeuse` étant totale,
          // un code postal invalide fait tomber l'adresse ENTIÈRE à `null` :
          // l'employeuse s'affichait alors sans aucune adresse.
          codePostal: code_postal ?? '',
          commune: toTitleCase(libelle_commune),
          codeInsee: commune,
          nom: toTitleCase(nom),
        }
      },
    )
}
