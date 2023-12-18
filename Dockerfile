# Use a specific version of Ubuntu as the base image
FROM ubuntu:focal

# Set the working directory in the Docker image
WORKDIR /app
COPY ./package.json /app/package.json

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y software-properties-common curl gnupg ca-certificates wget

# Add the GPG key for the Ethereum repository
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1C52189C923F6CA9

# Add the Ethereum PPA
RUN echo "deb [trusted=yes] http://ppa.launchpad.net/ethereum/ethereum/ubuntu focal main" >> /etc/apt/sources.list && \
    apt update

# Install solc
RUN apt install -y solc


# Install Node.js
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
ENV NODE_MAJOR=20
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install nodejs -y
RUN npm install 

# Install Ethereum client (geth)
RUN apt-get install -y ethereum

# Create a data directory for the Ethereum blockchain
RUN mkdir -p /ethereum_data

# Initialize the Ethereum blockchain
# RUN geth --datadir /ethereum_data init /app/genesis.json

# Expose ports for Ethereum JSON-RPC and P2P communication
EXPOSE 8545 30303

# Install IPFS
RUN curl -O https://dist.ipfs.io/go-ipfs/v0.9.1/go-ipfs_v0.9.1_linux-amd64.tar.gz
RUN tar xvfz go-ipfs_v0.9.1_linux-amd64.tar.gz
RUN mv go-ipfs/ipfs /usr/local/bin/ipfs

# install maj ipfs
RUN wget https://dist.ipfs.tech/ipfs-update/v1.9.0/ipfs-update_v1.9.0_linux-amd64.tar.gz
RUN tar -xvzf ipfs-update_v1.9.0_linux-amd64.tar.gz
RUN cd ipfs-update && ./install.sh
RUN ipfs-update install latest

# Initialize IPFS
RUN ipfs init

# Set the command to start a bash session
CMD ["bash"]
