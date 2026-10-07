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

## Rule: Pour filtrer, on propose les lieux des activités comptées dans les statistiques et les lieux actuels du médiateur

> Les statistiques comptent toutes les activités du médiateur, y compris celles
> d'un lieu qu'il a quitté : le filtre doit permettre de les isoler. Pour un
> coordinateur, seules comptent les activités faites pendant l'appartenance à
> l'équipe, comme dans les statistiques. S'y ajoutent les lieux où le médiateur
> connecté exerce aujourd'hui, même sans activité — pas ceux des membres de son
> équipe, qui ne filtreraient rien. La saisie, elle, ne propose que les lieux
> où l'on exerce encore.

### Scenario: Un lieu quitté avec des activités reste filtrable

* Given un médiateur qui exerce dans un lieu
* And ce médiateur a des activités dans ce lieu
* And ce médiateur a quitté ce lieu
* When on demande les lieux pour filtrer les activités de ce médiateur
* Then ce lieu est proposé

### Scenario: Un lieu actuel sans activité reste proposé au médiateur

* Given un médiateur qui exerce dans un lieu
* When on demande les lieux pour filtrer les activités de ce médiateur
* Then ce lieu est proposé

### Scenario: Un lieu quitté n'est plus proposé à la saisie

* Given un médiateur qui exerce dans un lieu
* And ce médiateur a des activités dans ce lieu
* And ce médiateur a quitté ce lieu
* When on demande les options de lieux de ce médiateur
* Then aucun lieu n'est proposé
