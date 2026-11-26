# Fonctionnalité: Consulter les statistiques publiques

> La page publique des statistiques présente l'activité de toute la coop :
> bénéficiaires accompagnés, accompagnements réalisés et leur cumul mois par
> mois. Seule compte l'activité saisie dans la coop : ni ce qui a été supprimé,
> ni ce qui a été importé de sa première version.
>
> La base n'est jamais vide : les scénarios relèvent les statistiques avant et
> après avoir semé leurs activités, et comparent les deux relevés.

## Règle: Un bénéficiaire compte dès qu'il a été accompagné lors d'une activité non supprimée

### Scénario: Les bénéficiaires suivis et anonymes sont comptés à part

* Étant donné les statistiques publiques relevées
* Et une activité saisie qui accompagne un bénéficiaire suivi et un bénéficiaire anonyme
* Quand les statistiques publiques sont relevées à nouveau
* Alors les bénéficiaires suivis ont augmenté de 1
* Et les bénéficiaires anonymes ont augmenté de 1

### Scénario: Un bénéficiaire accompagné seulement lors d'une activité supprimée ne compte pas

* Étant donné les statistiques publiques relevées
* Et une activité supprimée qui accompagne un bénéficiaire suivi
* Quand les statistiques publiques sont relevées à nouveau
* Alors les bénéficiaires suivis ont augmenté de 0

### Scénario: Un bénéficiaire importé de la première version ne compte pas

* Étant donné les statistiques publiques relevées
* Et une activité saisie qui accompagne un bénéficiaire importé de la v1
* Quand les statistiques publiques sont relevées à nouveau
* Alors les bénéficiaires anonymes ont augmenté de 0

## Règle: Les accompagnements comptent ceux des activités saisies dans la coop et non supprimées

### Scénario: Chaque bénéficiaire accompagné lors d'une activité compte pour un accompagnement

* Étant donné les statistiques publiques relevées
* Et une activité saisie qui accompagne deux bénéficiaires anonymes
* Quand les statistiques publiques sont relevées à nouveau
* Alors les accompagnements par des médiateurs ont augmenté de 2

### Scénario: Les accompagnements d'une activité supprimée ne comptent pas

* Étant donné les statistiques publiques relevées
* Et une activité supprimée qui accompagne deux bénéficiaires anonymes
* Quand les statistiques publiques sont relevées à nouveau
* Alors les accompagnements par des médiateurs ont augmenté de 0

### Scénario: Les accompagnements d'une activité importée de la première version ne comptent pas

* Étant donné les statistiques publiques relevées
* Et une activité importée de la v1 qui accompagne deux bénéficiaires anonymes
* Quand les statistiques publiques sont relevées à nouveau
* Alors les accompagnements par des médiateurs ont augmenté de 0

## Règle: Le cumul mensuel ajoute chaque mois au cumul des mois précédents

### Scénario: Le cumul des accompagnements

* Quand les statistiques publiques sont relevées
* Alors chaque mois du cumul des accompagnements ajoute ceux du mois au cumul précédent

### Scénario: Le cumul des bénéficiaires

* Quand les statistiques publiques sont relevées
* Alors chaque mois du cumul des bénéficiaires ajoute ceux du mois au cumul précédent

## Règle: Un médiateur suit des bénéficiaires dès qu'un de ses bénéficiaires suivis a été accompagné lors d'une activité non supprimée

### Scénario: Le médiateur qui accompagne un bénéficiaire suivi le suit

* Étant donné les statistiques publiques relevées
* Et une activité saisie qui accompagne un bénéficiaire suivi
* Quand les statistiques publiques sont relevées à nouveau
* Alors les médiateurs suivant des bénéficiaires ont augmenté de 1

### Scénario: Un bénéficiaire suivi accompagné seulement lors d'une activité supprimée n'est pas suivi

* Étant donné les statistiques publiques relevées
* Et une activité supprimée qui accompagne un bénéficiaire suivi
* Quand les statistiques publiques sont relevées à nouveau
* Alors les médiateurs suivant des bénéficiaires ont augmenté de 0
