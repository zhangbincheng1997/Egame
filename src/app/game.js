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
            App.getGame();
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    getGame: function () {
        id = getQueryVariable('id');
        // call getGameInfo
        store.deployed().then(function (storeInstance) {
            storeInstance.getGameInfo.call(id).then(function (result) {
                console.log(result);
                $("#owner").html(result[0]);
                $("#name").html(result[1]);
                $("#style").html(result[2]);
                $("#intro").html(result[3]);
                $("#rules").html(result[4]);
                $("#pprice").html(result[5] / 1e18); // fake
                $("#price").html(result[5] / 1e18);
                $("#sales").html(result[6].toString());
                $("#score").html(result[7].toString());
                $("#date").html(fmtDate(result[8].toString()));
                $("#cover").attr('src', result[9]);
            }).catch(function (err) {
                alert("内部错误: " + err);
            }).finally(function () {
                // None
            });
        });
    },

    purchase: function () {
        var price = web3.toWei($("#price").val());
        // call purchase
        store.deployed().then(function (storeInstance) {
            storeInstance.purchase(id, {from: web3.eth.accounts[0], value: price}).then(function (result) {
                alert("购买成功: " + result);
            }).catch(function (err) {
                alert("购买失败: " + err);
            }).finally(function () {
                // None
            });
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
    // ##### note #####
    App.init();
    // ##### note #####
});
