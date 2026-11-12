# Feature: Lister mes activités

> Le médiateur retrouve ses activités, des plus récentes aux plus anciennes,
> mêlées aux rendez-vous RDV Service Public qui n'ont pas encore de compte
> rendu. Ses filtres et sa pagination se lisent dans l'URL.

## Rule: Seules les activités vivantes du médiateur sont listées, les plus récentes d'abord

### Scenario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Given un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* And son activité du 5 mars 2026 est supprimée
* And un autre médiateur a enregistré une activité le 7 mars 2026
* When je liste mes activités
* Then les activités listées sont celles du "9 mars, 3 mars"
* And 2 activités sont comptées sur 1 page

### Scenario: Les plus anciennes d'abord à la demande

* Given un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* When je liste mes activités avec "ordre=asc"
* Then les activités listées sont celles du "3 mars, 5 mars, 9 mars"

## Rule: Les filtres de l'URL restreignent la liste, une valeur invalide est ignorée

### Scenario: Filtrer les ateliers collectifs

* Given un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* When je liste mes activités avec "types=collectif"
* Then les activités listées sont celles du "5 mars"

### Scenario: Une valeur de filtre invalide ne restreint rien

* Given un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* When je liste mes activités avec "lieux=x') OR 1=1 --"
* Then 3 activités sont comptées sur 1 page

### Scenario: Filtrer une période

* Given un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* When je liste mes activités avec "du=2026-03-04&au=2026-03-31"
* Then les activités listées sont celles du "9 mars, 5 mars"

## Rule: La liste se pagine

### Scenario: Deuxième page de dix lignes

* Given un médiateur ayant enregistré 12 activités en avril 2026
* When je liste mes activités avec "page=2&lignes=10"
* Then 12 activités sont comptées sur 2 pages
* And 2 activités sont listées
