App = {
    web3Provider: null,
    contracts: {},
    storeInstance: null,
    account: null,

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
        $("#publishBtn").click(App.handlePublish);
    },

    handlePublish: function () {
        if (!$("#publishForm").valid()) return;
        $("#tip").html('<span style="color:blue">正在发布...</span>');

        // 获取数据
        var name = $("#name").val();
        var style = $("#style").val();
        var intro = $("#intro").val();
        var rules = $("#rules").val();
        var price = web3.toWei($("#price").val());
        var cover = "0xcover";
        var file = "0xfile";

        // call publish
        App.storeInstance.publish(name, style, intro, rules, price, cover, file, {from: account}).then(function (result) {
            alert("发布成功");
        }).catch(function (err) {
            alert("发布失败: " + err);
        }).finally(function () {
            // 重置输入
            $(':input', '#publishForm')
                .not(':button, :submit, :reset, :hidden').val('')
                .removeAttr('checked').removeAttr('selected');
            $("#style").val('动作');
            // 清空提示
            validator.resetForm();
        });
    }
};

var validator;
$(function () {
    App.init();

    $("#fbyx-menu").addClass("menu-item-active");

    // 验证表单
    validator = $("#publishForm").validate(
        {
            rules: {
                name: {
                    required: true,
                    rangelength: [1, 10]
                },
                style: {
                    required: true
                },
                price: {
                    required: true,
                    number: true
                },
                intro: {
                    required: true,
                    rangelength: [1, 200]
                },
                rules: {
                    required: true,
                    rangelength: [1, 200]
                }
                // cover
                // file
            },
            messages: {
                name: {
                    required: "×",
                    rangelength: "字数范围[1-10]"
                },
                style: {
                    required: "×"
                },
                price: {
                    required: "×",
                    number: "不合法的数字"
                },
                intro: {
                    required: "×",
                    rangelength: "字数范围[1-200]"
                },
                rules: {
                    required: "×",
                    rangelength: "字数范围[1-200]"
                }
                // cover
                // file
            },
            success: function (label) {
                label.text("√"); // 正确时候输出
            },
            errorPlacement: function (error, element) {
                // Append error within linked label
                $(element)
                    .closest("form")
                    .find("label[for='" + element.attr("id") + "']")
                    .append(error);
            }
        });
});
