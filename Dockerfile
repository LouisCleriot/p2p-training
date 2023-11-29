FROM node:21-bookworm-slim

WORKDIR /app
RUN apt update && apt install -y
RUN npm install libp2p
RUN npm install @libp2p/webrtc
RUN npm install @chainsafe/libp2p-noise
RUN npm install @libp2p/mplex
RUN npm install multiaddr
CMD [ "bash" ]   