# Fonctionnalité: Lister mes activités

> Le médiateur retrouve ses activités, des plus récentes aux plus anciennes,
> mêlées aux rendez-vous RDV Service Public qui n'ont pas encore de compte
> rendu. Ses filtres et sa pagination se lisent dans l'URL.

## Règle: Seules les activités vivantes du médiateur sont listées, les plus récentes d'abord

### Scénario: Une activité supprimée et celle d'un autre médiateur sont écartées

* Étant donné un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* Et son activité du 5 mars 2026 est supprimée
* Et un autre médiateur a enregistré une activité le 7 mars 2026
* Quand je liste mes activités
* Alors les activités listées sont celles du "9 mars, 3 mars"
* Et 2 activités sont comptées sur 1 page

### Scénario: Les plus anciennes d'abord à la demande

* Étant donné un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* Quand je liste mes activités avec "ordre=asc"
* Alors les activités listées sont celles du "3 mars, 5 mars, 9 mars"

### Scénario: Un bénéficiaire anonymisé dont la commune a plusieurs codes postaux reste listé

* Étant donné un médiateur ayant accompagné le 3 mars 2026 un bénéficiaire de Nice, anonymisé depuis
* Quand je liste mes activités
* Alors les activités listées sont celles du "3 mars"

## Règle: Les filtres de l'URL restreignent la liste, une valeur invalide est ignorée

### Scénario: Filtrer les ateliers collectifs

* Étant donné un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* Quand je liste mes activités avec "types=collectif"
* Alors les activités listées sont celles du "5 mars"

### Scénario: Une valeur de filtre invalide ne restreint rien

* Étant donné un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* Quand je liste mes activités avec "lieux=x') OR 1=1 --"
* Alors 3 activités sont comptées sur 1 page

### Scénario: Filtrer une période

* Étant donné un médiateur ayant enregistré des activités les 3, 5 et 9 mars 2026
* Quand je liste mes activités avec "du=2026-03-04&au=2026-03-31"
* Alors les activités listées sont celles du "9 mars, 5 mars"

## Règle: La liste se pagine

### Scénario: Deuxième page de dix lignes

* Étant donné un médiateur ayant enregistré 12 activités en avril 2026
* Quand je liste mes activités avec "page=2&lignes=10"
* Alors 12 activités sont comptées sur 2 pages
* Et 2 activités sont listées
