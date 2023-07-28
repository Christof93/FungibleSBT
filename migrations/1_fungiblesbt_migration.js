var MyContract = artifacts.require("FungibleSBT");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(MyContract, "epistemo", "Ꭱ");
};