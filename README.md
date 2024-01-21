# IFT713 Project

- Louis CLÉRIOT (clel3204)
- Matéo DEMANGEON (demm1412)
- Martin GUITTENY (guim1106)
- Lucas RIOUX (riol2003)

## Description

This small project consist in 2 script that allow training bagging ai model using peer2peer network in a local network using libp2p to create and manage communication between node and ipfs to store and retrieve data.  

## Usage

1. Access the project directory.

2. Launch the script to build the Docker image and start a container

    ```bash
    ./buildAndRun.sh
    ```

3. Make the machine available as a worker with
    ```bash
    node src/worker.js
    ```

4. Start training on a simple dataset with
    ```bash
    node src/master.js
    ```

Note: for this to work, all machines must be connected to the same local network.
It's possible that peer-to-peer communication may not work if the system is used on a network such as eduroam.
