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
            App.getGames();
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    getGames: function () {
        // call getGameLength
        store.deployed().then(function (storeInstance) {
            storeInstance.getGameLength.call().then(function (result) {
                totalNum = parseInt(result);
                $("#pagination").pagination(totalNum, {
                    callback: App.pageCallback,
                    prev_text: '<<<',
                    next_text: '>>>',
                    ellipse_text: '...',
                    current_page: 0, // 当前选中的页面
                    items_per_page: 8, // 每页显示的条目数
                    num_display_entries: 4, // 连续分页主体部分显示的分页条目数
                    num_edge_entries: 1 // 两侧显示的首尾分页的条目数
                });
            }).catch(function (err) {
                alert("内部错误: " + err);
            }).finally(function () {
                // None
            });
        });
    },

    pageCallback: function (index, jq) {
        console.log(index);
        $("#mygame").html('');

        var start = index * 8; // 开始
        var end = Math.min((index + 1) * 8, totalNum); // 结束
        for (var i = start; i < end; i++) {
            let id = i; // note: var id = i; false
            // call getGameInfo
            store.deployed().then(function (storeInstance) {
                storeInstance.getGameInfo.call(id).then(function (result) {
                    console.log(result);
                    console.log(id);
                    var content = '';
                    content += '<div class="col-sm-6 col-md-3" >'
                        + '<div class="thumbnail">'
                        + '<a href="game.html?id=' + id + '">'
                        + '<div style="position: relative;">'
                        + '<img id="cover" class="img-cover" src="' + result[9] + '" alt="游戏封面"/>'
                        + '<figcaption id="name" class="img-caption">' + result[1] + '</figcaption>'
                        + '</div>'
                        + '</a>'
                        + '<div class="caption">'
                        + '<table class="dashed_tbl">'
                        + '<tr>'
                        + '<td>销量: <samp id="sales">' + result[6] + '</samp></td>'
                        + '<td>评分: <samp id="score">' + result[7] + '</samp></td>'
                        + '</tr>'
                        + '</table>'
                        + '<span class="label label-info">类型</span>'
                        + '<samp id="style">' + result[2] + '</samp>'
                        + '<br/>'
                        + '<span class="label label-info">简介</span>'
                        + '<samp id="intro">' + result[3].substr(0, 20) + '......</samp>'
                        + '<br/>'
                        + '<span class="label label-info">玩法</span>'
                        + '<samp id="rules">' + result[4].substr(0, 20) + '......</samp>'
                        + '<div align="center">'
                        + '<button class="btn btn-danger btn-xs" data-toggle="modal" data-target="#modal" onclick="App.set(' + id + ', ' + result[5] + ')">'
                        + '购买$ ' + (result[5] / 1e18)
                        + '</button>'
                        + '</div>'
                        + '</div>'
                        + '</div>';
                    $("#mygame").append(content);
                }).catch(function (err) {
                    alert("获取错误: " + err);
                }).finally(function () {
                    // None
                });
            });
        }
    },

    purchaseId: 0,
    price: 0,
    set: function (_id, _price) {
        purchaseId = _id;
        price = _price;
    },

    // 购买
    purchase: function () {
        alert(purchaseId + ' ' + price);
        // call purchase
        store.deployed().then(function (storeInstance) {
            storeInstance.purchase(id, {from: web3.eth.accounts[0], value: price}).then(function (result) {
                alert("购买成功: " + result);
            }).catch(function (err) {
                alert("购买失败: " + err);
            }).finally(function () {
                // 关闭窗口
                $("#modal").modal('hide');
            });
        })
    }
};

$(function () {
    // ##### note #####
    App.init();
    // ##### note #####

    // 激活导航
    $("#yxzy-menu").addClass("menu-item-active");
});
