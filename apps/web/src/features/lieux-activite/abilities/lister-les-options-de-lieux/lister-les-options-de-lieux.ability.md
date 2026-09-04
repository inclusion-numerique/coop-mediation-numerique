# Feature: Proposer des lieux dans un filtre

> Les écrans qui filtrent par lieu — activités, utilisateurs, statistiques —
> ont besoin de la même liste de choix. Elle vit ici parce que le lieu en est
> le sujet ; le nombre d'activités n'est qu'un signal de classement.

## Rule: Le lieu où l'on travaille le plus est proposé en tête

### Scenario: Le lieu le plus utilisé est signalé

* Given un médiateur qui exerce dans un lieu
* When on demande les options de lieux de ce médiateur
* Then ce lieu est proposé

## Rule: On ne propose que les lieux où le médiateur exerce

### Scenario: Aucun lieu pour un médiateur sans rattachement

* Given un médiateur qui exerce dans un lieu
* When on demande les options de lieux d'un médiateur étranger
* Then aucun lieu n'est proposé

### Scenario: Sans médiateur, rien n'est proposé

* Given un médiateur qui exerce dans un lieu
* When on demande les options de lieux de personne
* Then aucun lieu n'est proposé
