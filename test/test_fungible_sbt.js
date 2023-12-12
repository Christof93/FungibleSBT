const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const AddressZero = '0x0000000000000000000000000000000000000000';

describe("FungibleSBT Contract", () => {
  async function deployTokenFixture() {
    const [addr1, addr2] = await ethers.getSigners();
    const token = await ethers.deployContract("FungibleSBT", ["epistemo", "𐅿"]);
    return [ token, addr1, addr2 ];
  }
  describe("Deployment", function() {
    it("should put 100 Epistemo in the first account but only to the unassigned balance", async function()  {
      const [ FungibleSBTInstance , acc1 ] = await loadFixture(deployTokenFixture);
      const unassignedBalance = await FungibleSBTInstance.unassignedBalanceOf(acc1.address);
      const tokenBalance = await FungibleSBTInstance.balanceOf(acc1.address);

      expect(unassignedBalance).to.equal(100);
      expect(tokenBalance).to.equal(0);
    });
    it("should return the total of tokens", async function() {
      const [ FungibleSBTInstance ] = await loadFixture(deployTokenFixture);
      const totalSupply = await FungibleSBTInstance.totalSupply();

      expect(totalSupply).to.equal(100);
    })
    it("should return the token's name", async function()  {
      const [ FungibleSBTInstance ] = await loadFixture(deployTokenFixture);
      const name = await FungibleSBTInstance.name();

      expect(name).to.equal("epistemo");
    });
    it("should return the token's symbol", async function()  {
      const [ FungibleSBTInstance ] = await loadFixture(deployTokenFixture);
      const symbol = await FungibleSBTInstance.symbol();

      expect(symbol).to.equal("𐅿");
    });
    it("should not return true if asked if 0 interface is implemented by the token contract", async function() {
      const [ FungibleSBTInstance ] = await loadFixture(deployTokenFixture);
      const supports0 = await FungibleSBTInstance.supportsInterface('0x70a08231');
      
      expect(supports0).to.equal(false);
    })
    it("should return the token's decimal places", async function()  {
      const [ FungibleSBTInstance ] = await loadFixture(deployTokenFixture);
      const decimals = await FungibleSBTInstance.decimals();

      expect(decimals).to.equal(18);
    });
  });
  describe("Issuing", function() {
    it("should issue the tokens correctly", async function()  {
      const [ FungibleSBTInstance, acc1, acc2 ] = await loadFixture(deployTokenFixture);

      // Get initial balances of first and second account.
      const [
        accountOneUnassignedStartingBalance,
        accountOneStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [
        accountTwoUnassignedStartingBalance,
        accountTwoStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2.address);

      const issuedBefore = Number(
        await FungibleSBTInstance.getIssuance(acc2.address, acc1.address)
      );
      
      // Make transaction from first account to second.
      const amount = 10;
      let result = await FungibleSBTInstance.issue(acc2.address, amount);
      
      // Get balances of first and second account after the transactions.
      const [
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2.address);
      const issuedAfter = Number(
        await FungibleSBTInstance.getIssuance(acc2.address, acc1.address)
      );
      // 
      expect(accountOneUnassignedEndingBalance).to.equal(accountOneUnassignedStartingBalance - amount)
      expect(accountTwoEndingBalance).to.equal(accountTwoStartingBalance + amount)
      expect(accountTwoUnassignedEndingBalance).to.equal(accountTwoUnassignedStartingBalance)
      expect(accountOneEndingBalance).to.equal(accountOneStartingBalance)
      expect(issuedAfter).to.equal(issuedBefore + amount)
      expect(result).to.emit(FungibleSBTInstance, "Issued");
    });
    it("shouldn't allow transfer any tokens to and from the zero address", async function() {
      const [ FungibleSBTInstance, acc1 ] = await loadFixture(deployTokenFixture);
      const amount = 10;

      await expect(FungibleSBTInstance.issue(AddressZero, amount))
        .to.be.revertedWith("FungibleSBT: transfer to the zero address");
      await expect(FungibleSBTInstance.revoke(AddressZero, amount))
        .to.be.revertedWith("Fungible SBT: Not enough revocation allowance.");
    });
    it("should not allow to transfer issued tokens", async function()  {
      const [ FungibleSBTInstance, acc1, acc2 ] = await loadFixture(deployTokenFixture);

      const amount = 10;
      await FungibleSBTInstance.issue(acc2.address, amount);
      // acc 2 balance = 10
      // Get initial balances of first and second account.
      const [
        accountOneUnassignedStartingBalance,
        accountOneStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [
        accountTwoUnassignedStartingBalance,
        accountTwoStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2.address);

      await expect(FungibleSBTInstance.connect(acc2).issue(acc1.address, amount))
        .to.be.revertedWith("FungibleSBT: amount of tokens to be issued exceeds balance of unassigned tokens.");
      
      // Get balances of first and second account after the transactions.
      const [
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2.address);
      
      // assert all balances remain unchanged
      assertBalancesUnchanged(
        accountOneUnassignedStartingBalance,
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance,
        accountOneStartingBalance,
      )    
      assertBalancesUnchanged(
        accountTwoUnassignedStartingBalance,
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance,
        accountTwoStartingBalance,
      )
    });
  });
  describe("Revoking", function() {
    it("should not allow to revoke more tokens than were issued", async function()  {
      const [ FungibleSBTInstance, acc1, acc2 ] = await loadFixture(deployTokenFixture);

      const amount = 10;
      await FungibleSBTInstance.issue(acc2.address, amount);
      // acc 2 balance = 10
      // Get initial balances of first and second account.
      const [
        accountOneUnassignedStartingBalance,
        accountOneStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [,accountTwoStartingBalance] = await getBothBalances(FungibleSBTInstance, acc2.address);

      const burnallowanceBefore = Number(
        await FungibleSBTInstance.getIssuance(acc2.address, acc1.address)
      );
      await expect(FungibleSBTInstance.connect(acc1).revoke(acc2.address, amount+10))
        .to.be.revertedWith("Fungible SBT: Not enough revocation allowance.")
      
      
      const burnallowanceAfter = Number(
        await FungibleSBTInstance.getIssuance(acc2.address, acc1.address)
      );
      // Get balances of first and second account after the transactions.
      const [
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [,accountTwoEndingBalance] = await getBothBalances(FungibleSBTInstance, acc2.address);
      
      // tokens on account two should be gone
      expect(accountTwoEndingBalance).to.equal(accountTwoStartingBalance)
      // account one did not earn any new tokens
      assertBalancesUnchanged(
        accountOneUnassignedStartingBalance,
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance,
        accountOneStartingBalance,
      )
      // burn allowance should be restored
      expect(burnallowanceAfter).to.equal(burnallowanceBefore)
    });
    it("should allow to revoke tokens which were issued", async function()  {
      [ FungibleSBTInstance, acc1, acc2 ] = await loadFixture(deployTokenFixture);

      const amount = 10;
      await FungibleSBTInstance.issue(acc2.address, amount);
      // acc 2 balance = 10
      // Get initial balances of first and second account.
      const [
        accountOneUnassignedStartingBalance,
        accountOneStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [ , accountTwoStartingBalance ] = await getBothBalances(FungibleSBTInstance, acc2.address);

      const burnallowanceBefore = Number(
        await FungibleSBTInstance.getIssuance(acc2.address, acc1.address)
      );
      await FungibleSBTInstance.revoke(acc2.address, amount);
      
      const burnallowanceAfter = Number(
        await FungibleSBTInstance.getIssuance(acc2.address, acc1.address)
      );
      // Get balances of first and second account after the transactions.
      const [
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc1.address);
      const [,accountTwoEndingBalance] = await getBothBalances(FungibleSBTInstance, acc2.address);
      
      // tokens on account two should be gone
      expect(accountTwoEndingBalance).to.equal(accountTwoStartingBalance - amount);
      // account one did not earn any new tokens
      assertBalancesUnchanged(
        accountOneUnassignedStartingBalance,
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance,
        accountOneStartingBalance,
      )
      // burn allowance should be restored
      expect(burnallowanceAfter).to.equal(burnallowanceBefore - amount)
    });
  });

});

let getBothBalances = async (token, account) => {
  let unassigned = (
    await token.unassignedBalanceOf(account)
  )
;
  let regular = (
    await token.balanceOf(account)
  );
  return [Number(unassigned), Number(regular)];
}

let assertBalancesUnchanged = (
  UnassignedStartingBalance,
  UnassignedEndingBalance,
  RegularStartingBalance,
  RegularEndingBalance,
) => {
  expect(UnassignedStartingBalance).to.equal(UnassignedEndingBalance)
  expect(RegularStartingBalance).to.equal(RegularEndingBalance)
}