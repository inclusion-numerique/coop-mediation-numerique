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
