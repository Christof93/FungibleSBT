const FungibleSBTDepositable = artifacts.require("FungibleSBTDepositable");

contract("FungibleSBTDepositable", (accounts) => {
  beforeEach(async function () {
    FungibleSBTInstance = await FungibleSBTDepositable.deployed();
  });
  it("should put 100 Epistemo in the first account but only to the unassigned balance", async () => {
    const unassignedBalance = await FungibleSBTInstance.getUnassignedBalance(accounts[0]);
    const tokenBalance = await FungibleSBTInstance.getBalance(accounts[0]);

    assert.equal(unassignedBalance.valueOf(), 100, "100𐅿 wasn't in unassigned balance of the first account");
    assert.equal(tokenBalance.valueOf(), 0, "100𐅿 was issued to the first account");
  });
  it("should return the token's name", async () => {
    const name = await FungibleSBTInstance.name();

    assert.equal(name, "epistemo", "Name wasn't as expected.");
  });
  it("should return the token's symbol", async function () {
    const symbol = await FungibleSBTInstance.symbol();

    assert.equal(symbol, "𐅿", "Symbol wasn't as expected.");
  });
  it("should return the token's decimal places", async function () {
    const decimals = await FungibleSBTInstance.decimals();

    assert.equal(decimals, 18, "Decimals wasn't as expected.");
  });
  it("should issue the tokens correctly", async function () {
    // Get initial balances of first and second account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [
      accountTwoUnassignedStartingBalance,
      accountTwoStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);

    const issuedBefore = (
      await FungibleSBTInstance.getIssuance(accounts[1], accounts[0])
    ).toNumber();
    
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
    const issuedAfter = (
      await FungibleSBTInstance.getIssuance(accounts[1], accounts[0])
    ).toNumber();
    // 
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
      issuedAfter,
      issuedBefore + amount,
      "The issue transaction was not recorded properly"
    );
    assert.equal(
      result.logs[0].event, "Issued", "Issued event not emitted."
    );
  });
  it("should not allow to transfer issued tokens.", async function () {
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
  it("should allow to revoke tokens which were issued", async function ()  {
    const amount = 10;
    // acc 2 balance = 10
    // Get initial balances of first and second account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[0]);
    const [,accountTwoStartingBalance] = await getBothBalances(FungibleSBTInstance, accounts[1]);

    const burnallowanceBefore = (
      await FungibleSBTInstance.getIssuance(accounts[1], accounts[0])
    ).toNumber();

    await FungibleSBTInstance.revoke(accounts[1], amount, {from: accounts[0]});
    
    const burnallowanceAfter = (
      await FungibleSBTInstance.getIssuance(accounts[1], accounts[0])
    ).toNumber();
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
  it("should allow to deposit tokens to another account as a collateral", async function () {
    let amount = 10;
    // issue 10 tokens to account 2
    await FungibleSBTInstance.issue(accounts[1], amount);
    // Get initial balances of second and third account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    const [
      accountTwoUnassignedStartingBalance,
      accountTwoStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[2]);
    let collateralBefore = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    // grant a collateral to account 3 from account two to burn tokens
    await FungibleSBTInstance.grantCollateral(accounts[2], amount, {from: accounts[1]});
    let collateralAfter = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();

    // Get balances of second and third account after the collateral.
    const [
      accountOneUnassignedEndingBalance,
      accountOneEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    const [
      accountTwoUnassignedEndingBalance,
      accountTwoEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[2]);
    assert.equal(
      collateralBefore + amount,
      collateralAfter,
      "Collateral has not been granted correctly"
    );
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
    let amount = 10;
    let collateralAmount = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    assert.equal(collateralAmount, amount, "The returned account collateral is not correct.");
  });
  it("should not allow to deposit tokens to another account as a collateral if the collateral exceeds the balance", async function () {
    let amount = 10;
    let collateralBefore = (await FungibleSBTInstance.getCollateralDeposit(accounts[0], accounts[1])).toNumber();
    // grant a collateral to account 3 from account two to burn tokens
    try {
      await FungibleSBTInstance.grantCollateral(accounts[2], amount);
      assert.fail("Granting collateral should have failed because collateral value exceeds balance");
    } 
    catch(err) {
      assert.include(
        err.message,
        "revert", 
        "The error message should contain 'revert'");
      assert.include(
        err.message,
        "Can not grant collateral", 
        "The error message is not as expected"
      );
    }
    let collateralAfter = (await FungibleSBTInstance.getCollateralDeposit(accounts[0], accounts[1])).toNumber();
    assert.equal(
      collateralBefore,
      collateralAfter,
      "Collateral value should not have changed"
    );
    
    
  });
  it("should not allow to deposit tokens as collateral if the already granted collaterals exceed balance", async function () {
    let amount = 10;
    
    // make sure balance is high enough
    // acc 1 - 10 tokens, 10 collateral to acc 2
    assert.equal(
      (await FungibleSBTInstance.getBalance(accounts[1])).toNumber(), amount, "Pre-test balance insufficient"
    );
    let collateralBefore = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    assert.equal(collateralBefore, amount, "Pre-test collateral insufficient");
    // grant a collateral to account 3 from account two to burn tokens
    try {
      await FungibleSBTInstance.grantCollateral(accounts[2], amount, {from: accounts[1]});
      assert.fail("Granting collateral should have failed because already granted collaterals exceed balance");
    }
    catch (err) {
      assert.include(
        err.message,
        "revert", 
        "The error message should contain 'revert'"
      );
      assert.include(
        err.message,
        "Can not grant collateral", 
        "The error message is not as expected"
      );
    }
    let collateralAfter = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    assert.equal(
      collateralBefore,
      collateralAfter,
      "Collateral should not have been changed"
    );
  });
  it("should allow to burn tokens deposited as a collateral", async function () {
    let amount = 10;
    // Get initial balances of second and third account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    const [
      accountTwoUnassignedStartingBalance,
      accountTwoStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[2]);
    let collateralBefore = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    // grant a collateral to account 3 from account 2 to burn tokens
    await FungibleSBTInstance.burnDeposit(accounts[1], amount, {from: accounts[2]});
    let collateralAfter = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();

    // Get balances of second and third account after the collateral.
    const [
      accountOneUnassignedEndingBalance,
      accountOneEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    const [
      accountTwoUnassignedEndingBalance,
      accountTwoEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[2]);
    assert.equal(
      collateralBefore - amount,
      collateralAfter,
      "Collateral has not been burned correctly"
    );
    // assert all balances remain unchanged
    assert.equal(
      accountOneEndingBalance,
      accountOneStartingBalance - amount,
      "Collateral has not been deducted from balance"
    )
    assert.equal(
      accountOneUnassignedStartingBalance,
      accountOneUnassignedEndingBalance,
      "Unassigned balance should not have changed!"
    )
    assertBalancesUnchanged(
      accountTwoUnassignedStartingBalance,
      accountTwoUnassignedEndingBalance,
      accountTwoEndingBalance,
      accountTwoStartingBalance,
    );
  });
  it("should not allow to burn more tokens than the collateral value", async function () {
    let amount = 10;

    let collateralBefore = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    assert.equal(
      collateralBefore,
      0,
      "Pre-test collateral should be 0"
    );
    try {
      // burn collateral of account 2 from account 3
      await FungibleSBTInstance.burnDeposit(accounts[1], amount, {from: accounts[2]});
      assert.fail("Burning this deposit should fail because the burn allowance is exhausted")
    }
    catch (err) {
      assert.include(
        err.message,
        "revert", 
        "The error message should contain 'revert'"
      );
      assert.include(
        err.message,
        "Trying to burn amount larger than assigned collateral deposit.", 
        "The error message is not as expected"
      );
    }
    let collateralAfter = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();

    assert.equal(
      collateralBefore,
      collateralAfter,
      "Collateral should not have changed"
    );
  });
  it("should allow the receiver to return the collateral deposit", async function () {
    let amount = 10;
    // issue 10 tokens to account 2 and grant them to account 3
    await FungibleSBTInstance.issue(accounts[1], amount);
    await FungibleSBTInstance.grantCollateral(accounts[2], amount, {from: accounts[1]});

    // Get initial balances of second and third account.
    const [
      accountOneUnassignedStartingBalance,
      accountOneStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    const [
      accountTwoUnassignedStartingBalance,
      accountTwoStartingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[2]);
    let collateralBefore = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    // grant a collateral to account 3 from account 2 to burn tokens
    await FungibleSBTInstance.returnDeposit(accounts[1], amount, {from: accounts[2]});
    let collateralAfter = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();

    // Get balances of second and third account after the collateral.
    const [
      accountOneUnassignedEndingBalance,
      accountOneEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[1]);
    const [
      accountTwoUnassignedEndingBalance,
      accountTwoEndingBalance
    ] = await getBothBalances(FungibleSBTInstance, accounts[2]);
    assert.equal(
      collateralBefore - amount,
      collateralAfter,
      "Collateral has not been returned correctly"
    );
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
    let amount = 10;

    let collateralBefore = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();
    assert.equal(
      collateralBefore,
      0,
      "Pre-test collateral should be 0"
    );
    try {
      // return collateral of account 2 from account 3
      await FungibleSBTInstance.returnDeposit(accounts[1], amount, {from: accounts[2]});
      assert.fail("Returning this deposit should fail because amount exceeds allowance.")
    }
    catch (err) {
      assert.include(
        err.message,
        "revert", 
        "The error message should contain 'revert'"
      );
      assert.include(
        err.message,
        "Trying to return amount larger than assigned collateral deposit.", 
        "The error message is not as expected"
      );
    }
    let collateralAfter = (await FungibleSBTInstance.getCollateralDeposit(accounts[1], accounts[2])).toNumber();

    assert.equal(
      collateralBefore,
      collateralAfter,
      "Collateral should not have changed"
    );
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
    "Unassigned tokens balance should not have been affected."
  );
  assert.equal(
    RegularStartingBalance,
    RegularEndingBalance,
    "Tokens balance should not have been affected."
  );
}