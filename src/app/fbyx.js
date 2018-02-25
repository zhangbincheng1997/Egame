App = {
    init: function () {
        // connect to ipfs daemon API server
        window.ipfs = window.IpfsApi('localhost', '5001');

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
            // ......
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    publish: async function () {
        if (!$("#form").valid()) return;
        $("#tip").html('<span style="color:blue">正在发布...</span>');

        // 获取数据
        var name = $("#name").val();
        var style = $("#style").val();
        var intro = $("#intro").val();
        var rules = $("#rules").val();
        var price = $("#price").val();
        var cover = $("#cover")[0].files[0];
        var file = $("#file")[0].files[0];

        // 上传到 IPFS
        cover = 'https://ipfs.io/ipfs/' + await App._ipfsadd(cover);
        file = 'https://ipfs.io/ipfs/' + await App._ipfsadd(file);
        $("#tip_cover").html(cover).attr('href', cover);
        $("#tip_file").html(file).attr('href', file);
        // 上传到 Ethereum
        App.handlePublish(name, style, intro, rules, price, cover, file);
    },

    handlePublish: function (name, style, intro, rules, price, cover, file) {
        store.deployed().then(function (storeInstance) {
            storeInstance.publish(name, style, intro, rules, price, cover, file, {
                from: web3.eth.accounts[0]
            }).then(function (result) {
                alert("发布成功,等待写入区块!");
                window.location.reload();
            }).catch(function (err) {
                alert("发布失败: " + err);
                window.location.reload();
            });
        });
    },

    ////////////////////////////////////////////////////////////////////////////////

    _ipfsadd: function (f) {
        return new Promise(function (resolve, reject) {
            let reader = new FileReader();
            reader.onloadend = function () {
                const buffer = ipfs.Buffer.from(reader.result);
                ipfs.add(buffer, {
                    progress: (prog) => console.log(`received: ${prog}`)
                }).then((response) => {
                    console.log(response[0].hash);
                    resolve(response[0].hash);
                }).catch((err) => {
                    alert("IPFS 发生错误");
                    window.location.reload();
                });
            };
            reader.readAsArrayBuffer(f);
        });
    }
};

$(function () {
    // ##### note #####
    App.init();
    // ##### note #####

    // 激活导航
    $("#fbyx-menu").addClass("menu-item-active");

    // 简介限制
    var introCnt = 1000; // 简介字数最大限制
    $("[name^='intro']").keyup(function () {
        var num = introCnt - $(this).val().length;
        if (num > 0) {
            $(this).next('span').html('剩余' + num + '字数');
        } else {
            $(this).next('span').html('剩余 0 字数');
            var c = $(this).val().substr(0, introCnt);
            $(this).val(c);
        }
    }).blur(function () {
        $(this).next('span').html('');
    });

    // 玩法限制
    var rulesCnt = 1000; // 玩法字数最大限制
    $("[name^='rules']").keyup(function () {
        var num = rulesCnt - $(this).val().length;
        if (num > 0) {
            $(this).next('span').html('剩余' + num + '字数');
        } else {
            $(this).next('span').html('剩余 0 字数');
            var c = $(this).val().substr(0, rulesCnt);
            $(this).val(c);
        }
    }).blur(function () {
        $(this).next('span').html('');
    });

    // 验证表单
    $("#form").validate({
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
                rangelength: [1, 1000]
            },
            rules: {
                required: true,
                rangelength: [1, 1000]
            },
            cover: {
                required: true
            },
            file: {
                required: true
            }
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
            },
            cover: {
                required: "×"
            },
            file: {
                required: "×"
            }
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
