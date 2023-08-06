var FungibleSBT = artifacts.require("FungibleSBT");

module.exports = async function(deployer, network, accounts) {
  // deployment steps
  if (network=="development") {
    deployer.deploy(FungibleSBT, "epistemo", "𐅿");
  }
};