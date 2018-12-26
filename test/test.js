var BountyApp = artifacts.require("./BountyApp.sol");
var TestToken = artifacts.require("./TestToken.sol");
const truffleAssert = require('truffle-assertions');

contract("BountyApp", accounts => {

  it("accounts[0] should be owner", async () => {

    bountyAppInstance = await BountyApp.new({ from: accounts[0] });

    const ownerAddress = await bountyAppInstance.owner.call();

    assert.equal(ownerAddress, accounts[0], "Contract Owner address is incorrect.");
  });

  it("accounts[1] can add bounty", async () => {

  	// Init Token
  	token = await TestToken.new({ from: accounts[0] });
  	await token.mint(accounts[1], "1000000", { from: accounts[0] });

  	// Approve Contract
  	await token.approve(bountyAppInstance.address, "1000000", { from: accounts[1] });

  	// Add Bounty
    await bountyAppInstance.addBounty("Translation", "Description for bounty program", token.address, "1000000", { from: accounts[1] });

    var bountyData = await bountyAppInstance.getBounty.call(0);

    assert.equal(bountyData[0], accounts[1], "Bounty Owner address is incorrect.");
  });

  it("accounts[2] can add bounty entry", async () => {

  	// Add Bounty Entry
    await bountyAppInstance.addBountyEntry(0, "031487252fd2b7ce92c2701e185bdd8f", { from: accounts[2] });

    var bountyEntryData = await bountyAppInstance.getEntry.call(0);

    assert.equal(bountyEntryData[0], accounts[2], "Bounty Owner address is incorrect.");
  });

  it("accounts[3] can add bounty entry", async () => {

  	// Add Bounty Entry
    await bountyAppInstance.addBountyEntry(0, "482afeb462daaebce1b4681e1f06b3c7", { from: accounts[3] });

    var bountyEntryData = await bountyAppInstance.getEntry.call(1);

    assert.equal(bountyEntryData[0], accounts[3], "Bounty Owner address is incorrect.");
  });

  it("accounts[2] cannot add bounty entry to non-existant bounty", async () => {

    await truffleAssert.reverts(bountyAppInstance.addBountyEntry(1, "031487252fd2b7ce92c2701e185bdd8f", { from: accounts[2] }));
  });

  it("accounts[1] cannot approve non-existant bounty entry", async () => {

    await truffleAssert.reverts(bountyAppInstance.approveBountyEntry(2, { from: accounts[1] }));
  });

  it("accounts[2] cannot approve own bounty entry", async () => {

    await truffleAssert.reverts(bountyAppInstance.approveBountyEntry(0, { from: accounts[2] }));
  });

  it("accounts[1] can approve accounts[2] bounty entry", async () => {

    await bountyAppInstance.approveBountyEntry(0, { from: accounts[1] });

    var bountyEntryData = await bountyAppInstance.getEntry.call(0);

    assert.equal(bountyEntryData[3], 1, "Bounty Entry is not approved.");
  });

  it("accounts[1] cannot approve after bounty completed", async () => {

    await truffleAssert.reverts(bountyAppInstance.approveBountyEntry(1, { from: accounts[1] }));
  });

  it("accounts[3] cannot add bounty entry after bounty completed", async () => {

    await truffleAssert.reverts(bountyAppInstance.addBountyEntry(0, "482afeb462daaebce1b4681e1f06b3c7", { from: accounts[3] }));
  });

  it("accounts[3] cannot withdraw payout (not owner of entry)", async () => {

    await truffleAssert.reverts(bountyAppInstance.withdrawBountyPayout(0, { from: accounts[3] }));
  });

  it("accounts[3] cannot withdraw payout (not approved)", async () => {

    await truffleAssert.reverts(bountyAppInstance.withdrawBountyPayout(1, { from: accounts[3] }));
  });

  it("accounts[2] can withdraw payout", async () => {

    await bountyAppInstance.withdrawBountyPayout(0, { from: accounts[2] });

    var balance = await token.balanceOf.call(accounts[2]);

    assert.equal(balance, 1000000, "Bounty payout not withdrawn.");
  });

  it("Bounty entry payout status is paid", async () => {

    var bountyEntryData = await bountyAppInstance.getEntry.call(0);

    assert.equal(bountyEntryData[3], 2, "Bounty payout not withdrawn.");
  });
});