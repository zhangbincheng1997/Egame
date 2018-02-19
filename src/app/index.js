App = {
    web3: null,
    store: null,

    init: function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
        }

        App.initContract();
    },

    initContract: function () {
        $.getJSON('Store.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            store = TruffleContract(data);
            // Set the provider for our contract
            store.setProvider(web3.currentProvider);
            // TODO
            // App.getInfo();
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    rate: 0.1,
    getInfo: function () {
        // call getBalanceInfo
        store.deployed().then(function (storeInstance) {
            storeInstance.getBalanceInfo.call(web3.eth.accounts[0]).then(function (result) {
                alert(result);
            }).catch(function (err) {
                alert("请解锁用户: " + err);
            }).finally(function () {
                // None
            });
        });
    },

    // 购买游戏币
    recharge: function () {
        var num = $(this).val();
        // call publish
        store.deployed().then(function (storeInstance) {
            storeInstance.recharge({
                from: web3.eth.accounts[0],
                price: web3.toWei(num, 'ether')
            }).then(function (result) {
                alert("兑换成功");
            }).catch(function (err) {
                alert("兑换失败: " + err);
            }).finally(function () {
                // 重新加载
                // window.location.reload();
            });
        });
    },

    // 赎回以太币
    redeem: function () {
        var num = $(this).val();
        // call publish
        store.deployed().then(function (storeInstance) {
            storeInstance.redeem(num, {from: web3.eth.accounts[0]}).then(function (result) {
                alert("兑换成功");
            }).catch(function (err) {
                alert("兑换失败: " + err);
            }).finally(function () {
                // 重新加载
                // window.location.reload();
            });
        });
    }
};


var introCnt = 100; // 简介字数最大限制
var rulesCnt = 100; // 玩法字数最大限制
$(function () {
    // ##### note #####
    App.init();
    // ##### note #####

    // 游戏币兑换限制
    $("#count_yxb").bind('input propertychange', function () {
        var num = $(this).val();
        if (0 < num && num < 100) {
            $("#price_yxb").html((num * App.rate).toFixed(3));
        } else {
            $("#price_yxb").html('0.000');
        }
    }).blur(function () {
        if (0 < num && num < 100) {
            alert('非法数字');
        }
    });

    // 以太币兑换限制
    $("#count_eth").bind('input propertychange', function () {
        var num = $(this).val();
        if (0 < num && num < 100) {
            $("#price_eth").html((num * App.rate).toFixed(3));
        } else {
            $("#price_eth").html('0.000');
        }
    }).blur(function () {
        if (0 < num && num < 100) {
            alert('非法数字');
        }
    });
});