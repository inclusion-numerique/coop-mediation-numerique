# Fonctionnalité: Consulter le contrat d'un conseiller numérique

> Le contrat d'un conseiller numérique vient du tableau de pilotage, via
> l'Entrepôt. Le conseiller le retrouve sur son profil, son coordinateur sur
> sa fiche dans mon réseau. Seul le contrat le plus récent compte : il cesse
> d'être affiché dès que sa rupture est passée, et son échéance prévient de sa
> fin trois mois à l'avance.

## Règle: Seul le contrat le plus récent est consulté

### Scénario: Un conseiller réembauché retrouve son nouveau contrat

* Étant donné un conseiller numérique
* Et un CDD du 01/01/2022 au 31/12/2023
* Et un CDI débuté le 01/01/2025
* Quand on consulte son contrat le 14/10/2026
* Alors son contrat est un CDI débuté le 01/01/2025, sans terme

## Règle: Une rupture passée met fin à l'affichage du contrat

### Scénario: Le contrat rompu n'est plus consulté

* Étant donné un conseiller numérique
* Et un CDD du 01/01/2025 au 31/12/2027, rompu le 30/06/2026
* Quand on consulte son contrat le 14/10/2026
* Alors il n'a pas de contrat

### Scénario: Une rupture à venir devient le terme du contrat

* Étant donné un conseiller numérique
* Et un CDD du 01/01/2025 au 31/12/2027, rompu le 30/11/2026
* Quand on consulte son contrat le 14/10/2026
* Alors son contrat est un CDD du 01/01/2025 au 30/11/2026, fin prochaine

## Règle: L'échéance prévient de la fin du contrat trois mois à l'avance

### Scénario: Un contrat loin de son terme est en cours

* Étant donné un conseiller numérique
* Et un CDD du 01/01/2025 au 31/12/2027
* Quand on consulte son contrat le 14/10/2026
* Alors son contrat est un CDD du 01/01/2025 au 31/12/2027, en cours

### Scénario: Un contrat à moins de trois mois de son terme finit prochainement

* Étant donné un conseiller numérique
* Et un CDP du 01/01/2025 au 31/12/2026
* Quand on consulte son contrat le 14/10/2026
* Alors son contrat est un CDP du 01/01/2025 au 31/12/2026, fin prochaine

### Scénario: Un contrat dont le terme est passé est terminé

* Étant donné un conseiller numérique
* Et un PEC du 01/01/2025 au 30/06/2026
* Quand on consulte son contrat le 14/10/2026
* Alors son contrat est un PEC du 01/01/2025 au 30/06/2026, terminé

## Règle: Un compte inconnu de l'Entrepôt n'a pas de contrat

### Scénario: Un compte sans fiche dans l'Entrepôt n'a pas de contrat

* Étant donné un compte sans fiche dans l'Entrepôt
* Quand on consulte son contrat le 14/10/2026
* Alors il n'a pas de contrat
