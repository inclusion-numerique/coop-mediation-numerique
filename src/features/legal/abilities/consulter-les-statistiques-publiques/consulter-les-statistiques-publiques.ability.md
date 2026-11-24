# Feature: Consulter les statistiques publiques

> La page publique des statistiques présente l'activité de toute la coop :
> bénéficiaires accompagnés, accompagnements réalisés et leur cumul mois par
> mois. Seule compte l'activité saisie dans la coop : ni ce qui a été supprimé,
> ni ce qui a été importé de sa première version.
>
> La base n'est jamais vide : les scénarios relèvent les statistiques avant et
> après avoir semé leurs activités, et comparent les deux relevés.

## Rule: Un bénéficiaire compte dès qu'il a été accompagné lors d'une activité non supprimée

### Scenario: Les bénéficiaires suivis et anonymes sont comptés à part

* Given les statistiques publiques relevées
* And une activité saisie qui accompagne un bénéficiaire suivi et un bénéficiaire anonyme
* When les statistiques publiques sont relevées à nouveau
* Then les bénéficiaires suivis ont augmenté de 1
* And les bénéficiaires anonymes ont augmenté de 1

### Scenario: Un bénéficiaire accompagné seulement lors d'une activité supprimée ne compte pas

* Given les statistiques publiques relevées
* And une activité supprimée qui accompagne un bénéficiaire suivi
* When les statistiques publiques sont relevées à nouveau
* Then les bénéficiaires suivis ont augmenté de 0

### Scenario: Un bénéficiaire importé de la première version ne compte pas

* Given les statistiques publiques relevées
* And une activité saisie qui accompagne un bénéficiaire importé de la v1
* When les statistiques publiques sont relevées à nouveau
* Then les bénéficiaires anonymes ont augmenté de 0

## Rule: Les accompagnements comptent ceux des activités saisies dans la coop et non supprimées

### Scenario: Chaque bénéficiaire accompagné lors d'une activité compte pour un accompagnement

* Given les statistiques publiques relevées
* And une activité saisie qui accompagne deux bénéficiaires anonymes
* When les statistiques publiques sont relevées à nouveau
* Then les accompagnements par des médiateurs ont augmenté de 2

### Scenario: Les accompagnements d'une activité supprimée ne comptent pas

* Given les statistiques publiques relevées
* And une activité supprimée qui accompagne deux bénéficiaires anonymes
* When les statistiques publiques sont relevées à nouveau
* Then les accompagnements par des médiateurs ont augmenté de 0

### Scenario: Les accompagnements d'une activité importée de la première version ne comptent pas

* Given les statistiques publiques relevées
* And une activité importée de la v1 qui accompagne deux bénéficiaires anonymes
* When les statistiques publiques sont relevées à nouveau
* Then les accompagnements par des médiateurs ont augmenté de 0

## Rule: Le cumul mensuel ajoute chaque mois au cumul des mois précédents

### Scenario: Le cumul des accompagnements

* When les statistiques publiques sont relevées
* Then chaque mois du cumul des accompagnements ajoute ceux du mois au cumul précédent

### Scenario: Le cumul des bénéficiaires

* When les statistiques publiques sont relevées
* Then chaque mois du cumul des bénéficiaires ajoute ceux du mois au cumul précédent
