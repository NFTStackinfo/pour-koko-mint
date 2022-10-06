const SmartContract = artifacts.require("TheBlindClub")

module.exports = function (deployer) {
  deployer.deploy(SmartContract, "http://94.237.98.208/?id=")
}
