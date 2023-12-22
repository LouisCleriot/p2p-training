
# Projet IFT713

- Louis CLÉRIOT (clel3204)
- Matéo DEMANGEON (demm1412)
- Martin GUITTENY (guim1106)
- Lucas RIOUX (riol2003)

## Utilisation

1. Accédez au répertoire du projet.

2. Lancez le script permettant de construire l'image Docker et de lancer un container

    ```bash
    ./buildAndRun.sh
    ```

3. Rendre la machine disponible en tant que worker avec
    ```bash
    node src/worker.js
    ```

4. Lancer un entraînement sur un jeu de données simples avec
    ```bash
    node src/master.js
    ```

Attention : pour fonctionner, toutes les machines doivent être connectées au même réseau local.
Il est possible que la communication peer-to-peer ne fonctionne pas si le système est utilisé sur un réseau tel que eduroam.
