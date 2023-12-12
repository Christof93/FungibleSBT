
const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const AddressZero = '0x0000000000000000000000000000000000000000';

describe("FungibleSBTDepositable Contract", () => {
  async function deployTokenFixture() {
    const [addr1, addr2, addr3] = await ethers.getSigners();
    const token = await ethers.deployContract("FungibleSBTDepositable", ["epistemo", "𐅿"]);
    return [ token, addr1, addr2, addr3 ];
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

  describe("Deposit Collateral", function() {
    it("should allow to deposit tokens to another account as a collateral", async function () {
      const [ FungibleSBTInstance, , acc2, acc3 ] = await loadFixture(deployTokenFixture);
      
      let amount = 10;
      // issue 10 tokens to account 2
      await FungibleSBTInstance.issue(acc2, amount);
      // Get initial balances of second and third account.
      const [
        accountOneUnassignedStartingBalance,
        accountOneStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2);
      const [
        accountTwoUnassignedStartingBalance,
        accountTwoStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc3);
      let collateralBefore = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      // grant a collateral to account 3 from account two to burn tokens
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);
      let collateralAfter = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));

      // Get balances of second and third account after the collateral.
      const [
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2);
      const [
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc3);
      // Collateral has not been granted correctly
			expect(collateralBefore + amount).to.equal(collateralAfter);
      // assert all balances remain unchanged
      assertBalancesUnchanged(
        accountOneUnassignedStartingBalance,
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance,
        accountOneStartingBalance,
      );   
      assertBalancesUnchanged(
        accountTwoUnassignedStartingBalance,
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance,
        accountTwoStartingBalance,
      );
    });
    it("should return the value of an account's collateral", async function () {
      const [ FungibleSBTInstance, , acc2, acc3 ] = await loadFixture(deployTokenFixture);
      let amount = 10;
      // issue 10 tokens to account 2 and from there give as collateral to acc3
      await FungibleSBTInstance.issue(acc2, amount);
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);

      let collateralAmount = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      expect(collateralAmount).to.be.equal(amount);
    });
    it("should not allow to deposit tokens to another account as a collateral if the collateral exceeds the balance", async function () {
      const [ FungibleSBTInstance, acc1, acc2, acc3 ] = await loadFixture(deployTokenFixture);

      let amount = 10;
      // issue 10 tokens to account 2 and from there give as collateral to acc3
      await FungibleSBTInstance.issue(acc2, amount);
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);
      let collateralBefore = Number(await FungibleSBTInstance.collateralDeposit(acc1, acc2));
      // grant a collateral to account 3 from account two to burn tokens
      await expect(FungibleSBTInstance.grantCollateral(acc3, amount))
				.to.be.revertedWith("Fungible SBT: Can not grant collateral. Resulting deposits exceed total balance.")
      
      let collateralAfter = Number(await FungibleSBTInstance.collateralDeposit(acc1, acc2));
      // Collateral value should not have changed
			expect(collateralBefore).to.equal(collateralAfter);
      
      
    });
    it("should not allow to deposit tokens as collateral if the already granted collaterals exceed balance", async function () {
      const [ FungibleSBTInstance, , acc2, acc3 ] = await loadFixture(deployTokenFixture);

      let amount = 10;
      // issue 10 tokens to account 2 and from there give as collateral to acc3
      await FungibleSBTInstance.issue(acc2, amount);
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);
      // make sure balance is high enough
      // acc 1 - 10 tokens, 10 collateral to acc 2
      //Pre-test balance insufficient?
      expect(await FungibleSBTInstance.balanceOf(acc2)).to.equal(amount);
      
      let collateralBefore = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      //Pre-test collateral insufficient?
      expect(collateralBefore).to.equal(amount);
      // grant a collateral to account 3 from account two to burn tokens
      await expect(FungibleSBTInstance.grantCollateral(acc3, amount))
				.to.be.revertedWith("Fungible SBT: Can not grant collateral. Resulting deposits exceed total balance.");
      let collateralAfter = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      // Collateral should not have been changed
			expect(collateralBefore).to.equal(collateralAfter);
    });
    it("should allow to burn tokens deposited as a collateral", async function () {
      const [ FungibleSBTInstance, , acc2, acc3 ] = await loadFixture(deployTokenFixture);

      let amount = 10;
      // issue 10 tokens to account 2 and from there give as collateral to acc3
      await FungibleSBTInstance.issue(acc2, amount);
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);
      // Get initial balances of second and third account.
      const [
        accountOneUnassignedStartingBalance,
        accountOneStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2);
      const [
        accountTwoUnassignedStartingBalance,
        accountTwoStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc3);
      let collateralBefore = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      // grant a collateral to account 3 from account 2 to burn tokens
      await FungibleSBTInstance.connect(acc3).burnDeposit(acc2, amount);
      let collateralAfter = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));

      // Get balances of second and third account after the collateral.
      const [
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2);
      const [
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc3);
      // Collateral has not been burned correctly
			expect(collateralBefore - amount).to.equal(collateralAfter);
      // assert all balances remain unchanged
      // Collateral has not been deducted from balance
			expect(accountOneEndingBalance).to.equal(accountOneStartingBalance - amount);
      // Unassigned balance should not have changed!
			expect(accountOneUnassignedStartingBalance).to.equal(accountOneUnassignedEndingBalance);
      assertBalancesUnchanged(
        accountTwoUnassignedStartingBalance,
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance,
        accountTwoStartingBalance,
      );
    });
    it("should not allow to burn more tokens than the collateral value", async function () {
      const [ FungibleSBTInstance, , acc2, acc3 ] = await loadFixture(deployTokenFixture);

      let amount = 10;
      // issue 10 tokens to account 2 and from there give as collateral to acc3
      // and burn the deposit
      await FungibleSBTInstance.issue(acc2, amount);
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);
      await FungibleSBTInstance.connect(acc3).burnDeposit(acc2, amount);

      let collateralBefore = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      // Pre-test collateral should be 0
			expect(collateralBefore).to.equal(0);
      // Burning this deposit should fail because the burn allowance is exhausted
      await expect(FungibleSBTInstance.connect(acc3).burnDeposit(acc2, amount))
        .to.be.revertedWith("Fungible SBT: Trying to burn amount larger than assigned collateral deposit.");
      let collateralAfter = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));

      // Collateral should not have changed
			expect(collateralBefore).to.equal(collateralAfter);
    });
    it("should allow the receiver to return the collateral deposit", async function () {
      const [ FungibleSBTInstance, , acc2, acc3 ] = await loadFixture(deployTokenFixture);

      let amount = 10;
      // issue 10 tokens to account 2 and grant them to account 3
      await FungibleSBTInstance.issue(acc2, amount);
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);

      // Get initial balances of second and third account.
      const [
        accountOneUnassignedStartingBalance,
        accountOneStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2);
      const [
        accountTwoUnassignedStartingBalance,
        accountTwoStartingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc3);
      let collateralBefore = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      // grant a collateral to account 3 from account 2 to burn tokens
      await FungibleSBTInstance.connect(acc3).returnDeposit(acc2, amount);

      let collateralAfter = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));

      // Get balances of second and third account after the collateral.
      const [
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc2);
      const [
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance
      ] = await getBothBalances(FungibleSBTInstance, acc3);
      // Collateral has not been returned correctly
			expect(collateralBefore - amount).to.equal(collateralAfter);
      // assert all balances remain unchanged
      assertBalancesUnchanged(
        accountOneUnassignedStartingBalance,
        accountOneUnassignedEndingBalance,
        accountOneEndingBalance,
        accountOneStartingBalance,
      );
      assertBalancesUnchanged(
        accountTwoUnassignedStartingBalance,
        accountTwoUnassignedEndingBalance,
        accountTwoEndingBalance,
        accountTwoStartingBalance,
      );
    });
    it("should not allow to return more tokens than the collateral value", async function () {
      const [ FungibleSBTInstance, , acc2, acc3 ] = await loadFixture(deployTokenFixture);
      let amount = 10;
      // issue 10 tokens to account 2 and grant them to account 3
      await FungibleSBTInstance.issue(acc2, amount);
      await FungibleSBTInstance.connect(acc2).grantCollateral(acc3, amount);
      await FungibleSBTInstance.connect(acc3).returnDeposit(acc2, amount);

      let collateralBefore = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));
      // Pre-test collateral should be 0
			expect(collateralBefore).to.equal(0);
      // Returning this deposit should fail because amount exceeds allowance.
      await expect(FungibleSBTInstance.connect(acc3).returnDeposit(acc2, amount))
        .to.be.revertedWith("Fungible SBT: Trying to return amount larger than assigned collateral deposit.");

      let collateralAfter = Number(await FungibleSBTInstance.collateralDeposit(acc2, acc3));

      // Collateral should not have changed
			expect(collateralBefore).to.equal(collateralAfter);
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