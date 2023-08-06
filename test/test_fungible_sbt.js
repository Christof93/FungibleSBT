const FungibleSBT = artifacts.require("FungibleSBT");

contract("FungibleSBT", (accounts) => {
  it("should put 100 Epistemo in the first account", async () => {
    const FungibleSBTInstance = await FungibleSBT.deployed();
    const balance = await FungibleSBTInstance.balanceOf(accounts[0]);

    assert.equal(balance.valueOf(), 100, "100𐅿 wasn't in the first account");
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
    const accountOneStartingBalance = (
      await FungibleSBTInstance.balanceOf(accountOne)
    ).toNumber();
    const accountTwoStartingBalance = (
      await FungibleSBTInstance.balanceOf(accountTwo)
    ).toNumber();

    // Make transaction from first account to second.
    const amount = 10;
    await FungibleSBTInstance.issue(accountTwo, amount);

    // Get balances of first and second account after the transactions.
    const accountOneEndingBalance = (
      await FungibleSBTInstance.balanceOf(accountOne)
    ).toNumber();
    const accountTwoEndingBalance = (
      await FungibleSBTInstance.balanceOf(accountTwo)
    ).toNumber();

    assert.equal(
      accountOneEndingBalance,
      accountOneStartingBalance - amount,
      "Amount wasn't correctly taken by the sender"
    );
    assert.equal(
      accountTwoEndingBalance,
      accountTwoStartingBalance + amount,
      "Amount wasn't correctly sent to the receiver"
    );
  });
});