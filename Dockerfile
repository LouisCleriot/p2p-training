# Use a specific version of Ubuntu as the base image
FROM ubuntu:focal

# Set the working directory in the Docker image
WORKDIR /app
COPY ./package.json /app/package.json

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y software-properties-common curl gnupg ca-certificates

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

# Set the command to start a bash session
CMD ["bash"]
