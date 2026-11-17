# Feature: Consulter le contrat d'un conseiller numérique

> Le contrat d'un conseiller numérique vient du tableau de pilotage, via
> l'Entrepôt. Le conseiller le retrouve sur son profil, son coordinateur sur
> sa fiche dans mon réseau. Seul le contrat le plus récent compte : il cesse
> d'être affiché dès que sa rupture est passée, et son échéance prévient de sa
> fin trois mois à l'avance.

## Rule: Seul le contrat le plus récent est consulté

### Scenario: Un conseiller réembauché retrouve son nouveau contrat

* Given un conseiller numérique
* And un CDD du 01/01/2022 au 31/12/2023
* And un CDI débuté le 01/01/2025
* When on consulte son contrat le 14/10/2026
* Then son contrat est un CDI débuté le 01/01/2025, sans terme

## Rule: Une rupture passée met fin à l'affichage du contrat

### Scenario: Le contrat rompu n'est plus consulté

* Given un conseiller numérique
* And un CDD du 01/01/2025 au 31/12/2027, rompu le 30/06/2026
* When on consulte son contrat le 14/10/2026
* Then il n'a pas de contrat

### Scenario: Une rupture à venir devient le terme du contrat

* Given un conseiller numérique
* And un CDD du 01/01/2025 au 31/12/2027, rompu le 30/11/2026
* When on consulte son contrat le 14/10/2026
* Then son contrat est un CDD du 01/01/2025 au 30/11/2026, fin prochaine

## Rule: L'échéance prévient de la fin du contrat trois mois à l'avance

### Scenario: Un contrat loin de son terme est en cours

* Given un conseiller numérique
* And un CDD du 01/01/2025 au 31/12/2027
* When on consulte son contrat le 14/10/2026
* Then son contrat est un CDD du 01/01/2025 au 31/12/2027, en cours

### Scenario: Un contrat à moins de trois mois de son terme finit prochainement

* Given un conseiller numérique
* And un CDP du 01/01/2025 au 31/12/2026
* When on consulte son contrat le 14/10/2026
* Then son contrat est un CDP du 01/01/2025 au 31/12/2026, fin prochaine

### Scenario: Un contrat dont le terme est passé est terminé

* Given un conseiller numérique
* And un PEC du 01/01/2025 au 30/06/2026
* When on consulte son contrat le 14/10/2026
* Then son contrat est un PEC du 01/01/2025 au 30/06/2026, terminé

## Rule: Un compte inconnu de l'Entrepôt n'a pas de contrat

### Scenario: Un compte sans fiche dans l'Entrepôt n'a pas de contrat

* Given un compte sans fiche dans l'Entrepôt
* When on consulte son contrat le 14/10/2026
* Then il n'a pas de contrat
