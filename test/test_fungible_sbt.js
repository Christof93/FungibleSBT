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

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];

    // Get initial balances of first and second account.
    const accountOneUnassignedStartingBalance = (
      await FungibleSBTInstance.getUnassignedBalance(accountOne)
    ).toNumber();
    const accountOneStartingBalance = (
      await FungibleSBTInstance.getBalance(accountOne)
    ).toNumber();
    const accountTwoUnassignedStartingBalance = (
      await FungibleSBTInstance.getUnassignedBalance(accountTwo)
    ).toNumber();
    const accountTwoStartingBalance = (
      await FungibleSBTInstance.getBalance(accountTwo)
    ).toNumber();

    // Make transaction from first account to second.
    const amount = 10;
    let result = await FungibleSBTInstance.issue(accountTwo, amount);

    // Get balances of first and second account after the transactions.
    const accountOneUnassignedEndingBalance = (
      await FungibleSBTInstance.getUnassignedBalance(accountOne)
    ).toNumber();
    const accountOneEndingBalance = (
      await FungibleSBTInstance.getBalance(accountOne)
    ).toNumber();
    const accountTwoUnassignedEndingBalance = (
      await FungibleSBTInstance.getUnassignedBalance(accountTwo)
    ).toNumber();
    const accountTwoEndingBalance = (
      await FungibleSBTInstance.getBalance(accountTwo)
    ).toNumber();

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
});