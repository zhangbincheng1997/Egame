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
            App.getInfo();
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    rate: 0.1,
    getInfo: function () {
        // call getBalanceInfo
        store.deployed().then(function (storeInstance) {
            storeInstance.getBalanceInfo.call(web3.eth.accounts[0]).then(function (result) {
                $("#all_yxb").html(result[1] + ' / ' + result[0]);
                var all_eth = (result[2] / 1e18).toFixed(3);
                $("#all_eth").html(all_eth);
                $("#my_yxb").html(result[3].toString());
                var my_eth = (result[4] / 1e18).toFixed(3);
                $("#my_eth").html(my_eth);
                rate = result[5] / 1e18;
                $("#rate1").html(rate.toFixed(3));
                $("#rate2").html((1 / rate).toFixed(3));
            }).catch(function (err) {
                alert("请解锁用户: " + err);
            }).finally(function () {
                // None
            });
        });
    },

    // 购买游戏币
    buy: function () {
        $("#tip_buy").html('正在购买......');
        var num = $("#buy_yxb").val(); // 买入的游戏币
        if (num <= 0 || num >= 100) return;
        // call publish
        store.deployed().then(function (storeInstance) {
            storeInstance.buy({
                from: web3.eth.accounts[0],
                value: web3.toWei(num * App.rate, 'ether')
            }).then(function (result) {
                alert("兑换成功");
            }).catch(function (err) {
                alert("兑换失败: " + err);
            }).finally(function () {
                // 重新加载
                window.location.reload();
            });
        });
    },

    // 卖出游戏币
    sell: function () {
        $("#tip_sell").html('正在购买......');
        var num = $("#sell_yxb").val(); // 卖出的游戏币
        if (num <= 0 || num >= 100) return;
        // call publish
        store.deployed().then(function (storeInstance) {
            storeInstance.sell(num, {from: web3.eth.accounts[0]}).then(function (result) {
                alert("兑换成功");
            }).catch(function (err) {
                alert("兑换失败: " + err);
            }).finally(function () {
                // 重新加载
                window.location.reload();
            });
        });
    }
};

$(function () {
    // ##### note #####
    App.init();
    // ##### note #####

    // 游戏币买入限制
    $("#buy_yxb").bind('input propertychange', function () {
        var num = $(this).val();
        if (0 < num && num < 100) {
            var p = (num * App.rate).toFixed(3);
            $("#buy_eth").html(p);
        } else {
            $("#buy_eth").html('0.000');
        }
    }).blur(function () {
        var num = $(this).val();
        if (num != '' && num <= 0 || num >= 100) {
            alert('非法数字');
            $(this).val('');
        }
    });

    // 游戏币卖出限制
    $("#sell_yxb").bind('input propertychange', function () {
        var num = $(this).val();
        if (0 < num && num < 100) {
            var p = (num * App.rate).toFixed(3);
            $("#sell_eth").html(p);
        } else {
            $("#sell_eth").html('0.000');
        }
    }).blur(function () {
        var num = $(this).val();
        if (num != '' && num <= 0 || num >= 100) {
            alert('非法数字');
            $(this).val('');
        }
    });
});