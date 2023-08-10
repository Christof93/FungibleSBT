module.exports = {
  networks: {
    development: {
      network_id: "*",
      port: 8545,
      host: "127.0.0.1"
    }
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.19",
      debug: {
        enabled: true,
        revertStrings: "all" // Optional, for better revert error messages
      }
    }    
  },
  plugins: ["solidity-coverage"]
};
