# Feature: Consulter les lieux d'un département

> L'annuaire des lieux d'un département, tel que mon réseau le présente : la
> liste vient des lieux d'activité, l'annuaire n'en retient que ce que l'écran
> sait demander.

## Rule: L'annuaire se filtre par commune

### Scenario: La commune choisie est demandée à l'annuaire

* When on consulte les lieux du Cantal à Aurillac
* Then l’annuaire est demandé pour Aurillac seulement

### Scenario: Une commune invalide n'est pas demandée à l'annuaire

* When on consulte les lieux du Cantal dans la commune « pas-une-commune »
* Then l’annuaire est demandé sans commune

## Rule: Un département inconnu n'a pas d'annuaire des lieux

### Scenario: L'annuaire des lieux d'un département qui n'existe pas est introuvable

* When on consulte les lieux du département « 20 »
* Then l’annuaire des lieux est introuvable
