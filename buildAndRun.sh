docker build -t projet-p2p .

docker run --rm -ti -p 33121:33121 -p 4001:4001 -p 4001:4001/udp -p 127.0.0.1:8080:8080 -p 127.0.0.1:5001:5001 -v "$(pwd)":/app -v node_modules:/app/node_modules projet-p2p 