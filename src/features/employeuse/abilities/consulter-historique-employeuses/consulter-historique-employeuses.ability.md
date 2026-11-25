# Fonctionnalité: Consulter l'historique des employeuses d'un utilisateur

Lecture d'administration : qui employait ce compte, depuis quand, et le
rattachement est-il encore actif.

## Règle: L'historique retient toutes les employeuses, en cours comme passées

### Scénario: Un emploi en cours et un emploi terminé

* Étant donné un compte rattaché à "Employeuse actuelle" par une affectation active
* Et ce compte rattaché à "Employeuse passée" par une affectation terminée
* Quand je consulte l'historique de ses employeuses
* Alors l'historique compte 2 employeuses
* Et "Employeuse actuelle" y figure comme rattachement actif
* Et "Employeuse passée" y figure comme rattachement terminé

### Scénario: Un compte sans aucun rattachement

* Étant donné un compte sans aucun rattachement
* Quand je consulte l'historique de ses employeuses
* Alors l'historique est vide

## Règle: Une employeuse n'apparaît qu'une fois, même rattachée par deux sources

### Scénario: Le dispositif et le déclaratif désignent la même employeuse

* Étant donné un compte rattaché à "Employeuse partagée" par une affectation active
* Et ce compte rattaché une seconde fois à "Employeuse partagée" par une affectation terminée
* Quand je consulte l'historique de ses employeuses
* Alors l'historique compte 1 employeuse
* Et "Employeuse partagée" y figure comme rattachement actif

## Règle: Les dates d'emploi viennent du contrat, quand il en existe un

### Scénario: Un contrat renseigne la période

* Étant donné un compte rattaché à "Employeuse actuelle" par une affectation active
* Et un contrat chez "Employeuse actuelle" du "2026-01-01" au "2026-06-30"
* Quand je consulte l'historique de ses employeuses
* Alors la période de "Employeuse actuelle" va du "2026-01-01" au "2026-06-30"

### Scénario: Sans contrat, la période reste inconnue

* Étant donné un compte rattaché à "Employeuse actuelle" par une affectation active
* Quand je consulte l'historique de ses employeuses
* Alors la période de "Employeuse actuelle" est inconnue
