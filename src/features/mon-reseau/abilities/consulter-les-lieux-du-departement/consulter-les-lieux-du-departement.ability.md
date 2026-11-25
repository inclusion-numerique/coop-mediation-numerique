# Fonctionnalité: Consulter les lieux d'un département

> L'annuaire des lieux d'un département, tel que mon réseau le présente : la
> liste vient des lieux d'activité, l'annuaire n'en retient que ce que l'écran
> sait demander.

## Règle: L'annuaire se filtre par commune

### Scénario: La commune choisie est demandée à l'annuaire

* Quand on consulte les lieux du Cantal à Aurillac
* Alors l’annuaire est demandé pour Aurillac seulement

### Scénario: Une commune invalide n'est pas demandée à l'annuaire

* Quand on consulte les lieux du Cantal dans la commune « pas-une-commune »
* Alors l’annuaire est demandé sans commune

## Règle: Un département inconnu n'a pas d'annuaire des lieux

### Scénario: L'annuaire des lieux d'un département qui n'existe pas est introuvable

* Quand on consulte les lieux du département « 20 »
* Alors l’annuaire des lieux est introuvable
