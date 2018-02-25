App = {
    init: function () {
        // Is there an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            window.web3 = new Web3(web3.currentProvider);
        } else {
            // If no injected web3 instance is detected, fall back to Ganache
            window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
        }
        App.initContract();
    },

    initContract: function () {
        $.getJSON('Store.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            window.store = TruffleContract(data);
            // Set the provider for our contract
            window.store.setProvider(web3.currentProvider);
            // Init app
            App.getGame();
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    getGame: async function () {
        window.gid = getQueryVariable('id');

        var result = await App._getGameInfo(gid);
        $("#owner").html(result[0]);
        $("#name").html(result[1]);
        $("#style").html(result[2]);
        $("#intro").html(result[3]);
        $("#rules").html(result[4].toString());
        $("#price").html(result[5].toString() * 100); // fake price
        $("#discount").html(result[5].toString());
        $("#sales").html(result[6].toString());
        $("#score").html(result[7].toString());
        $("#date").html(fmtDate(result[8].toString()));
        $("#cover").attr('src', result[9]);

        var clen = await App._getCommentLength(gid);
        $("#comments_cnt").html(clen.toString());
        var content = '';
        for (var i = 0; i < clen; i++) {
            var result = await App._getCommentInfo(gid, i);
            content += '<div class="row">'
                + '<div class="col-sm-1">'
                + '<img src="images/buyer.png"/>'
                + '<samp>***' + result[0].substr(-3) + '</samp>'
                + '</div>'
                + '<div class="col-sm-11">'
                + '<p>' + fmtDate(result[1].toString()) + '</p>'
                + '<p name="star" data-score="' + result[2] + '"></p>'
                + '<p>' + result[3] + '</p>'
                + '</div>'
                + '</div>'
                + '<hr/>';
        }
        $("#comments").append(content);
    },

    purchase: function () {
        store.deployed().then(function (storeInstance) {
            storeInstance.isPurchased.call(gid).then(function (result) {
                if (result) {
                    alert("已购买");
                } else {
                    storeInstance.purchase(gid, {
                        from: web3.eth.accounts[0],
                        gas: 140000
                    }).then(function (result) {
                        alert("购买成功,等待写入区块!");
                    }).catch(function (err) {
                        alert("购买失败: " + err);
                    });
                }
            });
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    _getGameInfo: function (id) {
        return new Promise(function (resolve, reject) {
            store.deployed().then(function (storeInstance) {
                storeInstance.getGameInfo.call(id).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    alert("内部错误: " + err);
                });
            });
        });
    },

    _getCommentInfo: function (gid, cid) {
        return new Promise(function (resolve, reject) {
            store.deployed().then(function (storeInstance) {
                storeInstance.getCommentInfo.call(gid, cid).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    alert("内部错误: " + err);
                });
            });
        });
    },

    _getCommentLength: function (id) {
        return new Promise(function (resolve, reject) {
            store.deployed().then(function (storeInstance) {
                storeInstance.getCommentLength.call(id).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    alert("内部错误: " + err);
                });
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

// timestamp -> yyyy-MM-dd HH:mm:ss
function fmtDate(timestamp) {
    var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = date.getDate() + ' ';
    h = date.getHours() + ':';
    m = date.getMinutes() + ':';
    s = date.getSeconds();
    return Y + M + D + h + m + s;
}

$(function () {
    // ##### note #####
    App.init();
    // ##### note #####

    // 设置星星
    $("[name^='star']").raty({
        number: 10, // 星星上限
        readOnly: true,
        score: function () {
            return $(this).attr('data-score');
        }
    });
});
