module.exports = {

  networks: {
    development: {
        host: "127.0.0.1",
        port: 8552,
        network_id: "*" // Match any network id
    }
  },

  mocha: {
  },

  compilers: {
    solc: {
      version: "0.8.0",      // Fetch exact version from solc-bin (default: truffle's version)
    }
  },
};