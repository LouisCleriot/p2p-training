var DecentralizedAITraining = artifacts.require("./DecentralizedAITraining.sol");

module.exports = function(deployer) {
  deployer.deploy(DecentralizedAITraining);
};