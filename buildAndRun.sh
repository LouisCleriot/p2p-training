docker build -t projet-p2p .

docker run --rm -ti -v "$(pwd)":/app -v node_modules:/app/node_modules projet-p2p