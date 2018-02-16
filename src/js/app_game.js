App = {
    web3Provider: null,
    contracts: {},
    storeInstance: null,
    account: null,
    id : 0,

    init: function () {
        return App.initWeb3();
    },

    initWeb3: function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function () {
        $.getJSON('Store.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            App.contracts.Store = TruffleContract(data);
            // Set the provider for our contract
            App.contracts.Store.setProvider(App.web3Provider);

            // 获取主账号
            web3.eth.getAccounts(function (error, accounts) {
                if (error) {
                    console.log(error);
                } else {
                    account = accounts[0];
                }
            });

            // 获取单例类
            App.contracts.Store.deployed().then(function (instance) {
                App.storeInstance = instance;
            }).finally(function () {
                App.bindEvents();
            });
        });
    },

    // 绑定事件
    bindEvents: function () {
        App.getGames();
        $("#firstbuy").click(App.handlePurchase);
    },

    getGames: function () {
        id = getQueryVariable('id');
        // call getGameInfo
        App.storeInstance.getGameInfo.call(id).then(function (result) {
            console.log(result);
            $("#owner").html(result[0]);
            $("#name").html(result[1]);
            $("#style").html(result[2]);
            $("#intro").html(result[3]);
            $("#rules").html(result[4]);
            $("#price").html(result[5]*2 / 1e18); // fake
            $("#discount").html(result[5] / 1e18);
            $("#sales").html(result[6].toString());
            $("#score").html(result[7].toString());
            $("#date").html(fmtDate(result[8].toString()));
        }).catch(function (err) {
            alert("内部错误: " + err);
        }).finally(function () {
            // None
        });
    },

    handlePurchase: function () {
        // call purchase
        var price = web3.toWei($("#discount").val()); // price -> discount
        App.storeInstance.purchase(id, {from: account, value: price}).then(function (result) {
            alert("购买成功");
        }).catch(function (err) {
            alert("购买失败: " + err);
        }).finally(function () {
            // None
        });
    }
};

// get the parameter from url
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

// timestamp -> yyyy-MM-dd
function fmtDate(obj) {
    var date = new Date(obj * 1000);
    var y = 1900 + date.getYear();
    var m = "0" + (date.getMonth() + 1);
    var d = "0" + date.getDate();
    return y + "-" + m.substring(m.length - 2, m.length) + "-" + d.substring(d.length - 2, d.length);
}

$(function () {
    App.init();
});
