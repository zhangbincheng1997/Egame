App = {
    web3Provider: null,
    contracts: {},
    storeInstance: null,
    account: null,
    totalNum: 0,
    id: 0,
    price: 0,

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
        $("#purchaseBtn").click(App.handlePurchase);
    },

    getGames: function () {
        // call getGameLength
        App.storeInstance.getGameLength.call().then(function (result) {
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
    },

    pageCallback: function (index, jq) {
        console.log(index);
        $("#mygame").html('');

        var start = index * 8; // 开始
        var end = Math.min((index + 1) * 8, totalNum); // 结束
        for (var i = start; i < end; i++) {
            let id = i; // note: var id = i; false
            // call getGameInfo
            App.storeInstance.getGameInfo.call(id).then(function (result) {
                console.log(result);
                console.log(id);
                var content = '';
                content += '<div class="col-sm-6 col-md-3">'
                    + '<div class="thumbnail">'
                    + '<div style="position: relative;">'
                    + '<a href="game.html?id=' + id + '">'
                    + '<img id="cover" style="width: 400px;height: 240px;" src="images/dnf.jpg" alt="游戏图片"/>'
                    + '</a>'
                    + '<figcaption id="name" class="img-caption">' + result[1] + '</figcaption>'
                    + '</div>'
                    + '<div class="caption" style="text-align: center">'
                    + '<table class="dashed_tbl">'
                    + '<tr>'
                    + '<td>销量: <samp id="sales">' + result[6] + '</samp></td>'
                    + '<td>评分: <samp id="score">' + result[7] + '</samp></td>'
                    + '</tr>'
                    + '</table>'
                    + '<p style="text-align: left">'
                    + '<span class="badge" id="style">' + result[2] + '</span>'
                    + '<span id="intro">' + result[3] + '</span>'
                    + '</p>'
                    + '<button onclick="App.set(' + id + ', ' + result[5] + ')" class="btn btn-danger btn-xs" data-toggle="modal" data-target="#modal">'
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
        }
    },

    set: function (_id, _price) {
        id = _id;
        price = _price;
    },

    handlePurchase: function () {
        // call purchase
        App.storeInstance.purchase(id, {from: account, value:price}).then(function (result) {
            alert("购买成功");
        }).catch(function (err) {
            alert("购买失败: " + err);
        }).finally(function () {
            // 关闭窗口
            $("#modal").modal('hide');
        });
    }
};

$(function () {
    App.init();

    $("#yxzy-menu").addClass("menu-item-active");
});
