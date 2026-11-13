# Feature: Supprimer des bénéficiaires

## Rule: La suppression est un soft-delete qui anonymise le bénéficiaire

### Scenario: Supprimer un bénéficiaire du médiateur

* Given un bénéficiaire enregistré pour ce médiateur
* When je supprime ce bénéficiaire
* Then la suppression retire 1 bénéficiaire
* And le bénéficiaire est anonymisé et marqué supprimé
* And le compteur de bénéficiaires du médiateur revient à son niveau initial

### Scenario: Une commune à plusieurs codes postaux n'en garde qu'un

* Given un bénéficiaire de Nice enregistré pour ce médiateur
* When je supprime ce bénéficiaire
* Then le bénéficiaire est anonymisé et marqué supprimé
* And le bénéficiaire supprimé ne garde que le code postal "06100"

## Rule: La suppression nécessite au moins un bénéficiaire valide du médiateur

### Scenario: Supprimer un bénéficiaire inexistant échoue

* When je supprime un bénéficiaire inexistant
* Then la suppression échoue avec l'erreur "AucunBeneficiaireValide"
