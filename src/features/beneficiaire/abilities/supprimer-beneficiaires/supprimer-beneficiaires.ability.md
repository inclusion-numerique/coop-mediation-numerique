# Fonctionnalité: Supprimer des bénéficiaires

## Règle: La suppression est un soft-delete qui anonymise le bénéficiaire

### Scénario: Supprimer un bénéficiaire du médiateur

* Étant donné un bénéficiaire enregistré pour ce médiateur
* Quand je supprime ce bénéficiaire
* Alors la suppression retire 1 bénéficiaire
* Et le bénéficiaire est anonymisé et marqué supprimé
* Et le compteur de bénéficiaires du médiateur revient à son niveau initial

### Scénario: Une commune à plusieurs codes postaux n'en garde qu'un

* Étant donné un bénéficiaire de Nice enregistré pour ce médiateur
* Quand je supprime ce bénéficiaire
* Alors le bénéficiaire est anonymisé et marqué supprimé
* Et le bénéficiaire supprimé ne garde que le code postal "06100"

## Règle: La suppression nécessite au moins un bénéficiaire valide du médiateur

### Scénario: Supprimer un bénéficiaire inexistant échoue

* Quand je supprime un bénéficiaire inexistant
* Alors la suppression échoue avec l'erreur "AucunBeneficiaireValide"

## Règle: Un médiateur n'anonymise jamais le bénéficiaire d'un autre médiateur

### Scénario: Le bénéficiaire d'un autre médiateur est ignoré

* Étant donné un bénéficiaire enregistré pour ce médiateur
* Et un bénéficiaire enregistré pour un autre médiateur
* Quand je supprime ces deux bénéficiaires
* Alors la suppression retire 1 bénéficiaire
* Et le bénéficiaire est anonymisé et marqué supprimé
* Et le bénéficiaire de l'autre médiateur garde son identité

### Scénario: L'écriture de l'anonymisation n'atteint pas le bénéficiaire d'un autre médiateur

* Étant donné un bénéficiaire enregistré pour un autre médiateur
* Quand l'anonymisation de ce bénéficiaire est écrite au nom de ce médiateur
* Alors le bénéficiaire de l'autre médiateur garde son identité
