# Fonctionnalité: Rechercher une employeuse

Parmi les employeuses déjà enregistrées : c'est ce qui alimente
l'autocomplétion d'inscription et le rapprochement en administration.

## Règle: Chaque terme est confronté au nom, au SIRET et à l'adresse

### Scénario: Recherche par nom

* Étant donné l'employeuse "Croix Rouge Nantes" est enregistrée sous le SIRET "12345678901234"
* Quand je recherche l'employeuse "Croix"
* Alors la recherche trouve "Croix Rouge Nantes"

### Scénario: Recherche par SIRET

* Étant donné l'employeuse "Croix Rouge Nantes" est enregistrée sous le SIRET "12345678901234"
* Quand je recherche l'employeuse "12345678901234"
* Alors la recherche trouve "Croix Rouge Nantes"

### Scénario: Les termes se cumulent

* Étant donné l'employeuse "Croix Rouge Nantes" est enregistrée sous le SIRET "12345678901234"
* Et l'employeuse "Croix Rouge Rennes" est enregistrée sous le SIRET "43210987654321"
* Quand je recherche l'employeuse "Croix Rennes"
* Alors la recherche trouve "Croix Rouge Rennes"
* Et la recherche ne trouve pas "Croix Rouge Nantes"

## Règle: Une employeuse supprimée ne se propose plus

### Scénario: Une employeuse supprimée côté Entrepôt

* Étant donné l'employeuse "Structure fermée" est enregistrée puis supprimée
* Quand je recherche l'employeuse "Structure fermée"
* Alors la recherche ne trouve rien

## Règle: La commune d'une employeuse se cherche sans accent ni tiret

> L'administration filtre les comptes par la commune de leur employeuse : la
> recherche porte sur les communes des adresses connues, et tolère une saisie
> partielle, sans accent ni tiret, ou un début de code postal.

### Scénario: Chercher une commune par un début de nom sans accent ni tiret

* Étant donné une adresse d'employeuse à "Saint-Étienne-de-Testé" au code INSEE "99901" et au code postal "99901"
* Quand je cherche la commune "saint etienne de tes"
* Alors la commune de code INSEE "99901" est proposée

### Scénario: Chercher une commune par son code postal

* Étant donné une adresse d'employeuse à "Saint-Étienne-de-Testé" au code INSEE "99901" et au code postal "99901"
* Quand je cherche la commune "9990"
* Alors la commune de code INSEE "99901" est proposée
