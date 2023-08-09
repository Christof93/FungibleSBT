const FungibleSBT = artifacts.require("FungibleSBT");

contract("FungibleSBT", (accounts) => {
  it("should put 100 Epistemo in the first account but only to the unassigned balance", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();
    const unassignedBalance = await FungibleSBTInstance.getUnassignedBalance(accounts[0]);
    const tokenBalance = await FungibleSBTInstance.getBalance(accounts[0]);

    assert.equal(unassignedBalance.valueOf(), 100, "100𐅿 wasn't in unassigned balance of the first account");
    assert.equal(tokenBalance.valueOf(), 0, "100𐅿 was issued to the first account");
  });
  it("should return the token's name", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();
    const name = await FungibleSBTInstance.name();

    assert.equal(name, "epistemo", "Name wasn't as expected.");
  });
  it("should return the token's symbol", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();
    const symbol = await FungibleSBTInstance.symbol();

    assert.equal(symbol, "𐅿", "Symbol wasn't as expected.");
  });
  it("should return the token's decimal places", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();
    const decimals = await FungibleSBTInstance.decimals();

    assert.equal(decimals, 18, "Decimals wasn't as expected.");
  });
  it("should issue the tokens correctly", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();

    // Get initial balances of first and second account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [
      accountTwoUnassignedStartingBalance,
      accountTwoStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1])

    // Make transaction from first account to second.
    const amount = 10;
    let result = await FungibleSBTInstance.issue(accounts[1], amount);

    // Get balances of first and second account after the transactions.
    const [
      accountOneUnassignedEndingBalance,
      accountOneEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [
      accountTwoUnassignedEndingBalance,
      accountTwoEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);

    assert.equal(
      accountOneUnassignedEndingBalance,
      accountOneUnassignedStartingBalance - amount,
      "Amount wasn't correctly taken by the sender"
    );
    assert.equal(
      accountTwoEndingBalance,
      accountTwoStartingBalance + amount,
      "Amount wasn't correctly sent to the receiver"
    );
    assert.equal(
      accountTwoUnassignedEndingBalance,
      accountTwoUnassignedStartingBalance,
      "Amount was sent to the wrong balance mapping"
    );
    assert.equal(
      accountOneEndingBalance,
      accountOneStartingBalance,
      "Amount was sent from the wrong balance mapping"
    );
    assert.equal(
      result.logs[0].event, "Issued", "Issued event not emitted."
    )
  });
  it("should not allow to transfer issued tokens.", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();

    const amount = 10;
    // acc 2 balance = 10
    // Get initial balances of first and second account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [
      accountTwoUnassignedStartingBalance,
      accountTwoStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    try {
      await FungibleSBTInstance.issue(accounts[0], amount, {from: accounts[1]});
      assert.fail("Issuing an already issued token should have failed.");
    }
    catch (err) {
      assert.include(
        err.message,
        "revert", 
        "The error message should contain 'revert'");
    }
    // Get balances of first and second account after the transactions.
    const [
      accountOneUnassignedEndingBalance,
      accountOneEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [
      accountTwoUnassignedEndingBalance,
      accountTwoEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    
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
  it("should allow to revoke tokens which were issued.", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();

    const amount = 10;
    // acc 2 balance = 10
    // Get initial balances of first and second account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [,accountTwoStartingBalance] = await getBothBalances(FungibleSBTInstance, accounts[1]);

    const burnallowanceBefore = await FungibleSBTInstance
      .revocationAllowance(accounts[1], accounts[0]).valueOf();
    console.log(burnallowanceBefore)

    await FungibleSBTInstance.revoke(accounts[1], amount, {from: accounts[0]});
    
    const burnallowanceAfter = await FungibleSBTInstance
      .revocationAllowance(accounts[1], accounts[0]).valueOf();
    console.log(burnallowanceAfter)
    // Get balances of first and second account after the transactions.
    const [
      accountOneUnassignedEndingBalance,
      accountOneEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [,accountTwoEndingBalance] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    
    // tokens on account two should be gone
    assert.equal(
      accountTwoEndingBalance,
      accountTwoStartingBalance - amount,
      "Token were not burned."
    )
    // account one did not earn any new tokens
    assertBalancesUnchanged(
      accountOneUnassignedStartingBalance,
      accountOneUnassignedEndingBalance,
      accountOneEndingBalance,
      accountOneStartingBalance,
    )
    // burn allowance should be restored
    assert.equal(
      burnallowanceAfter,
      burnallowanceBefore - amount,
      "Revocation allowance not deducted correctly.")
  });

});

let getBothBalances = async (token, account) => {
  let unassigned = (
    await token.getUnassignedBalance(account)
  ).toNumber();
  let regular = (
    await token.getBalance(account)
  ).toNumber();
  return [unassigned, regular];
}

let assertBalancesUnchanged = (
  UnassignedStartingBalance,
  UnassignedEndingBalance,
  RegularStartingBalance,
  RegularEndingBalance,
) => {
  assert.equal(
    UnassignedStartingBalance,
    UnassignedEndingBalance,
    "Unassigned tokens weren't correctly reverted to the sender."
  );
  assert.equal(
    RegularStartingBalance,
    RegularEndingBalance,
    "Tokens weren't correctly reverted to the sender."
  );
}