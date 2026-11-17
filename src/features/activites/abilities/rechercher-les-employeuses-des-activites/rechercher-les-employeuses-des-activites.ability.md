# Feature: Rechercher les employeuses des activités

> Le filtre « Structure employeuse » propose les employeuses rattachées aux
> activités vivantes du médiateur, cherchées par nom ou par commune.

## Rule: Seules les employeuses des activités vivantes du médiateur sont proposées

### Scenario: L'employeuse d'une activité supprimée et celle d'un autre médiateur sont écartées

* Given le médiateur a des activités pour les employeuses "Mairie de Lyon, Association Numérique"
* And une activité supprimée du médiateur était pour l'employeuse "Centre Social"
* And un autre médiateur a une activité pour l'employeuse "Conseil départemental"
* When je recherche "" parmi les employeuses de mes activités
* Then les employeuses trouvées sont "Association Numérique, Mairie de Lyon"

## Rule: La recherche porte sur le nom et écarte les employeuses déjà choisies

### Scenario: Chercher une employeuse par son nom

* Given le médiateur a des activités pour les employeuses "Mairie de Lyon, Association Numérique"
* When je recherche "mairie" parmi les employeuses de mes activités
* Then les employeuses trouvées sont "Mairie de Lyon"

### Scenario: Une employeuse déjà choisie n'est plus proposée

* Given le médiateur a des activités pour les employeuses "Mairie de Lyon, Association Numérique"
* When je recherche "" parmi les employeuses de mes activités en excluant "Mairie de Lyon"
* Then les employeuses trouvées sont "Association Numérique"
