# Feature: Rechercher une employeuse

Parmi les employeuses déjà enregistrées : c'est ce qui alimente
l'autocomplétion d'inscription et le rapprochement en administration.

## Rule: Chaque terme est confronté au nom, au SIRET et à l'adresse

### Scenario: Recherche par nom

* Given l'employeuse "Croix Rouge Nantes" est enregistrée sous le SIRET "12345678901234"
* When je recherche l'employeuse "Croix"
* Then la recherche trouve "Croix Rouge Nantes"

### Scenario: Recherche par SIRET

* Given l'employeuse "Croix Rouge Nantes" est enregistrée sous le SIRET "12345678901234"
* When je recherche l'employeuse "12345678901234"
* Then la recherche trouve "Croix Rouge Nantes"

### Scenario: Les termes se cumulent

* Given l'employeuse "Croix Rouge Nantes" est enregistrée sous le SIRET "12345678901234"
* And l'employeuse "Croix Rouge Rennes" est enregistrée sous le SIRET "43210987654321"
* When je recherche l'employeuse "Croix Rennes"
* Then la recherche trouve "Croix Rouge Rennes"
* And la recherche ne trouve pas "Croix Rouge Nantes"

## Rule: Une employeuse supprimée ne se propose plus

### Scenario: Une employeuse supprimée côté Entrepôt

* Given l'employeuse "Structure fermée" est enregistrée puis supprimée
* When je recherche l'employeuse "Structure fermée"
* Then la recherche ne trouve rien

## Rule: La commune d'une employeuse se cherche sans accent ni tiret

> L'administration filtre les comptes par la commune de leur employeuse : la
> recherche porte sur les communes des adresses connues, et tolère une saisie
> partielle, sans accent ni tiret, ou un début de code postal.

### Scenario: Chercher une commune par un début de nom sans accent ni tiret

* Given une adresse d'employeuse à "Saint-Étienne-de-Testé" au code INSEE "99901" et au code postal "99901"
* When je cherche la commune "saint etienne de tes"
* Then la commune de code INSEE "99901" est proposée

### Scenario: Chercher une commune par son code postal

* Given une adresse d'employeuse à "Saint-Étienne-de-Testé" au code INSEE "99901" et au code postal "99901"
* When je cherche la commune "9990"
* Then la commune de code INSEE "99901" est proposée
