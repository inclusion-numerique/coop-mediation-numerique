# Feature: Se connecter

> La connexion passe par ProConnect ; ce qui suit ne décrit que ce que la coop
> décide autour d'elle : la page où arrive une personne, selon son profil et
> l'état de son inscription, et celle où elle revient après s'être connectée.
>
> Une inscription n'est achevée que si elle est validée **et** que la personne
> a un profil de médiateur ou de coordinateur : sans l'un ou l'autre, elle ne
> peut rien faire dans la coop et reprend son parcours d'inscription.

## Rule: La page d'accueil dépend du profil et de l'état de l'inscription

### Scenario Outline: Un « <personne> » arrive sur « <page> »

* Given la personne "<personne>"
* When il arrive sur la coop
* Then il est conduit vers "<page>"

#### Examples:

  | personne                                                    | page            |
  | ----------------------------------------------------------- | --------------- |
  | visiteur sans session                                       | /               |
  | administrateur                                              | /administration |
  | utilisateur dont l'inscription n'est pas validée            | /inscription    |
  | utilisateur validé sans profil de médiateur ni coordinateur | /inscription    |
  | médiateur inscrit                                           | /coop           |
  | coordinateur inscrit                                        | /coop           |

## Rule: Après la connexion, chacun revient là où il travaille

### Scenario Outline: Un « <personne> » qui vient de se connecter revient sur « <page> »

* Given la personne "<personne>"
* When il vient de se connecter
* Then il est conduit vers "<page>"

#### Examples:

  | personne                                                    | page                         |
  | ----------------------------------------------------------- | ---------------------------- |
  | visiteur sans session                                       | /connexion                   |
  | administrateur                                              | /administration/utilisateurs |
  | support                                                     | /administration/utilisateurs |
  | utilisateur dont l'inscription n'est pas validée            | /inscription                 |
  | utilisateur validé sans profil de médiateur ni coordinateur | /inscription                 |
  | médiateur inscrit                                           | /coop                        |
  | coordinateur inscrit                                        | /coop                        |
