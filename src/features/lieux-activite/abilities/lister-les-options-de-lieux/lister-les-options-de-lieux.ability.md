# Fonctionnalité: Proposer des lieux dans un filtre

> Les écrans qui filtrent par lieu — activités, utilisateurs, statistiques —
> ont besoin de la même liste de choix. Elle vit ici parce que le lieu en est
> le sujet ; le nombre d'activités n'est qu'un signal de classement.

## Règle: Le lieu où l'on travaille le plus est proposé en tête

### Scénario: Le lieu le plus utilisé est signalé

* Étant donné un médiateur qui exerce dans un lieu
* Quand on demande les options de lieux de ce médiateur
* Alors ce lieu est proposé

## Règle: On ne propose que les lieux où le médiateur exerce

### Scénario: Aucun lieu pour un médiateur sans rattachement

* Étant donné un médiateur qui exerce dans un lieu
* Quand on demande les options de lieux d'un médiateur étranger
* Alors aucun lieu n'est proposé

### Scénario: Sans médiateur, rien n'est proposé

* Étant donné un médiateur qui exerce dans un lieu
* Quand on demande les options de lieux de personne
* Alors aucun lieu n'est proposé

## Règle: Seuls les lieux exploitables sont proposés à la saisie

### Scénario: Un lieu sans adresse reconnue par la BAN n'est pas proposé à la saisie

* Étant donné un médiateur qui exerce dans un lieu
* Et ce lieu n'a pas d'adresse reconnue par la BAN
* Quand on demande les options de lieux de ce médiateur
* Alors aucun lieu n'est proposé

### Scénario: Un lieu supprimé n'est pas proposé à la saisie

* Étant donné un médiateur qui exerce dans un lieu
* Et ce lieu est supprimé
* Quand on demande les options de lieux de ce médiateur
* Alors aucun lieu n'est proposé

## Règle: Le filtre de l'administration ne propose que des lieux exploitables

> L'administration cherche un lieu par son nom, sa commune ou son code postal,
> parmi tous les lieux, sans liste chargée d'avance.

### Scénario: Un lieu exploitable est proposé à l'administration

* Étant donné un médiateur qui exerce dans un lieu
* Quand on cherche ce lieu par son nom pour filtrer dans l'administration
* Alors ce lieu figure parmi les lieux proposés

### Scénario: Un lieu sans adresse reconnue par la BAN n'est pas proposé à l'administration

* Étant donné un médiateur qui exerce dans un lieu
* Et ce lieu n'a pas d'adresse reconnue par la BAN
* Quand on cherche ce lieu par son nom pour filtrer dans l'administration
* Alors ce lieu ne figure pas parmi les lieux proposés

### Scénario: Un lieu supprimé n'est pas proposé à l'administration

* Étant donné un médiateur qui exerce dans un lieu
* Et ce lieu est supprimé
* Quand on cherche ce lieu par son nom pour filtrer dans l'administration
* Alors ce lieu ne figure pas parmi les lieux proposés

## Règle: Pour filtrer, on propose les lieux des activités comptées dans les statistiques et les lieux actuels du médiateur

> Les statistiques comptent toutes les activités du médiateur, y compris celles
> d'un lieu qu'il a quitté : le filtre doit permettre de les isoler. Pour un
> coordinateur, seules comptent les activités faites pendant l'appartenance à
> l'équipe, comme dans les statistiques. S'y ajoutent les lieux où le médiateur
> connecté exerce aujourd'hui, même sans activité — pas ceux des membres de son
> équipe, qui ne filtreraient rien. La saisie, elle, ne propose que les lieux
> où l'on exerce encore.

### Scénario: Un lieu quitté avec des activités reste filtrable

* Étant donné un médiateur qui exerce dans un lieu
* Et ce médiateur a des activités dans ce lieu
* Et ce médiateur a quitté ce lieu
* Quand on demande les lieux pour filtrer les activités de ce médiateur
* Alors ce lieu est proposé

### Scénario: Un lieu actuel sans activité reste proposé au médiateur

* Étant donné un médiateur qui exerce dans un lieu
* Quand on demande les lieux pour filtrer les activités de ce médiateur
* Alors ce lieu est proposé

### Scénario: Un lieu quitté n'est plus proposé à la saisie

* Étant donné un médiateur qui exerce dans un lieu
* Et ce médiateur a des activités dans ce lieu
* Et ce médiateur a quitté ce lieu
* Quand on demande les options de lieux de ce médiateur
* Alors aucun lieu n'est proposé
