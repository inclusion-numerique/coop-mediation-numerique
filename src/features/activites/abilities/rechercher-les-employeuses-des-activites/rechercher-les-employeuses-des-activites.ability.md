# Fonctionnalité: Rechercher les employeuses des activités

> Le filtre « Structure employeuse » propose les employeuses rattachées aux
> activités vivantes du médiateur, cherchées par nom ou par commune.

## Règle: Seules les employeuses des activités vivantes du médiateur sont proposées

### Scénario: L'employeuse d'une activité supprimée et celle d'un autre médiateur sont écartées

* Étant donné le médiateur a des activités pour les employeuses "Mairie de Lyon, Association Numérique"
* Et une activité supprimée du médiateur était pour l'employeuse "Centre Social"
* Et un autre médiateur a une activité pour l'employeuse "Conseil départemental"
* Quand je recherche "" parmi les employeuses de mes activités
* Alors les employeuses trouvées sont "Association Numérique, Mairie de Lyon"

## Règle: La recherche porte sur le nom et écarte les employeuses déjà choisies

### Scénario: Chercher une employeuse par son nom

* Étant donné le médiateur a des activités pour les employeuses "Mairie de Lyon, Association Numérique"
* Quand je recherche "mairie" parmi les employeuses de mes activités
* Alors les employeuses trouvées sont "Mairie de Lyon"

### Scénario: Une employeuse déjà choisie n'est plus proposée

* Étant donné le médiateur a des activités pour les employeuses "Mairie de Lyon, Association Numérique"
* Quand je recherche "" parmi les employeuses de mes activités en excluant "Mairie de Lyon"
* Alors les employeuses trouvées sont "Association Numérique"
