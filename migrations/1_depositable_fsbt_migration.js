var FungibleSBTDepositable = artifacts.require("FungibleSBTDepositable");

module.exports = async function(deployer, network, accounts) {
  // deployment steps
  if (network=="development") {
    deployer.deploy(FungibleSBTDepositable, "epistemo", "𐅿", {from: accounts[0]});
  }
};