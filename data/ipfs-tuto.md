# How to use IPFS

## add file to ipfs
```python
ipfs add <path/to/file>           #add a file to local ipfs node
ipfs add -r <path/to/directory>   #add a directory to local ipfs node with recursive file
```
## pin file to ipfs
```python
ipfs add pin <hash>               #pin a file to local ipfs node to not be garbage collected
```

## launch ipfs daemon
```python
ipfs daemon   #launch ipfs daemon
ipfs swarm peers #list peers connected to your node
```

## get file from ipfs
```python
ipfs cat <hash> # Get file content
ipfs get <hash> # Download file
```




QmcxbDmv9gJ5ck5UskpFfevNCYZRKn1A9Ux4jLGFtGQ8s9




ipfs daemon # Start ipfs daemon to be connected to the network
ipfs swarm peers # List peers connected to your node

ipfs name publish <hash> # Publish a file to the network
ipfs name resolve <hash> # Resolve a file from the network