import type { UniteLegale } from '@app/web/external-apis/apiEntrepriseApiModels'
import type { StructureCreationDataWithSiret } from '@app/web/features/structures/StructureValidation'
import { getTypologieFromApiEntreprise } from '@app/web/structure/typologieFromApiEntreprise'
import { toTitleCase } from '@app/web/utils/toTitleCase'

/**
 * Voie seule, débarrassée du code postal et de la commune que l'API répète.
 *
 * `adresse` arrive en une seule chaîne, localité comprise
 * (« 27 RUE SAINT-GUILLAUME 75007 PARIS »), alors que le code postal et la
 * commune voyagent déjà à part. Conservée telle quelle, elle les répétait à
 * l'affichage (« …75007 Paris, 75007 Paris ») et brouillait la requête envoyée
 * à la BAN, dont le score retombait sous le seuil de géocodage.
 *
 * On ne retire que ce dont on est sûr : le suffixe exact « code postal
 * commune ». Une adresse qui ne s'y termine pas (étranger, cedex) est rendue
 * intacte, de même qu'une voie qui se réduirait à rien.
 */
const voieSansLocalite = (
  adresse: string,
  codePostal: string | undefined,
  commune: string,
): string => {
  const localite = `${codePostal ?? ''} ${commune}`.trim()
  const valeur = adresse.trim()
  if (localite === '' || !valeur.toLowerCase().endsWith(localite.toLowerCase()))
    return adresse
  return valeur.slice(0, valeur.length - localite.length).trim() || adresse
}

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
          adresse: toTitleCase(
            voieSansLocalite(adresse, code_postal, libelle_commune),
          ),
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
