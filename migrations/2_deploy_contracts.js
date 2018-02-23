var Store = artifacts.require("./Store.sol");

module.exports = function (deployer) {
    deployer.deploy(Store, 100000, web3.toWei('0.1', 'ether'));
};
