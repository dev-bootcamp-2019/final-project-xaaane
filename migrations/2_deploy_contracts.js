var BountyApp = artifacts.require("BountyApp");
var TestToken = artifacts.require("TestToken");

module.exports = function(deployer) {
  deployer.deploy(BountyApp);
  deployer.deploy(TestToken);
};