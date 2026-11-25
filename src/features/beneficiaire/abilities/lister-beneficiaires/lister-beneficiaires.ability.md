# Fonctionnalité: Lister les bénéficiaires

## Règle: La liste est filtrée par médiateur, recherchable et paginée

### Scénario: Rechercher les bénéficiaires par nom

* Étant donné les bénéficiaires suivants pour ce médiateur
  | prenom | nom       |
  | Alice  | Testliste |
  | Bob    | Testliste |
* Quand je liste les bénéficiaires avec la recherche "Testliste"
* Alors la liste contient 2 bénéficiaires
* Et le nombre total de correspondances est 2

### Scénario: Affiner la recherche par prénom et nom

* Étant donné les bénéficiaires suivants pour ce médiateur
  | prenom | nom       |
  | Alice  | Testliste |
  | Bob    | Testliste |
* Quand je liste les bénéficiaires avec la recherche "Alice Testliste"
* Alors la liste contient 1 bénéficiaire

### Scénario: Paginer les résultats

* Étant donné les bénéficiaires suivants pour ce médiateur
  | prenom | nom       |
  | Alice  | Testliste |
  | Bob    | Testliste |
* Quand je liste les bénéficiaires avec la recherche "Testliste" par pages de 1
* Alors la liste contient 1 bénéficiaire
* Et le nombre de pages est 2

### Scénario: Trier les bénéficiaires par nom décroissant

* Étant donné les bénéficiaires suivants pour ce médiateur
  | prenom | nom    |
  | Alice  | Albert |
  | Bob    | Zorro  |
* Quand je liste les bénéficiaires triés par "nom" en "desc"
* Alors le premier bénéficiaire est "Zorro"
