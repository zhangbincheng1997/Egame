var Store = artifacts.require("./Store.sol");

module.exports = function (deployer) {
    deployer.deploy(Store, 100000, 10);
};