pragma solidity ^0.4.0;

// 商店合约
contract Store {

    // 游戏
    struct Game {
        address owner;  // 所有者
        string name;    // 游戏名
        string style;   // 类型
        string intro;   // 简介
        string rules;   // 玩法
        uint price;     // 价格
        uint sales;     // 销量
        uint score;     // 评分
        uint date;      // 发布日期
        string cover;   // 封面指针
        string file;    // 文件指针

        mapping(address=>bool) isPurchased; // 是否已购买
        mapping(address=>bool) isEvaluated; // 是否已评价
    }
    Game[] games;

    // 用户
    struct User {
        uint[] purchasedGames;   // 已购买的游戏
        uint[] publishedGames;   // 已发布的游戏
    }
    mapping(address=>User) userPool;

//////////////////////// 事件 ////////////////////
    // 发布成功触发事件 [游戏ID, 游戏名, 类型, 简介, 玩法, 价格, 发布日期, 封面指针, 文件指针]
    event publishSuccess(uint id, string name, string style, string intro, string rules,
                        uint price, uint date, string cover, string file);
    // 购买成功触发事件 [游戏ID, 用户地址, 价格]
    event purchaseSuccess(uint id, address owner, uint price);
    // 评价成功触发事件 [游戏ID, 用户地址, 评分]
    event evaluateSuccess(uint id, address owner, uint score);
//////////////////////// 事件 ////////////////////

//////////////////////// 查询 ////////////////////
    // 获取已经购买的游戏列表
    function getPurchasedGames() public view returns (uint[]) {
        return userPool[msg.sender].purchasedGames;
    }
    // 获取已经发布的游戏列表
    function getPublishedGames() public view returns (uint[]) {
        return userPool[msg.sender].publishedGames;
    }
    // 获取游戏数量
    function getGameLength() public view returns (uint) {
        return games.length;
    }
    // 获取游戏信息
    function getGameInfo(uint id) public view returns (
        address, string, string, string, string, uint, uint, uint, uint, string) {
        require(id < games.length);
        // 获取合约
        Game storage g = games[id];
        return (g.owner, g.name, g.style, g.intro, g.rules,
                g.price, g.sales, g.score, g.date, g.cover);
    }
    // 获取游戏文件
    function getGameFile(uint id) public view returns (string) {
        require(id < games.length);
        // 获取合约
        Game storage g = games[id];
        require(g.owner == msg.sender ||
                g.isPurchased[msg.sender]);
        return (g.file);
    }
//////////////////////// 查询 ////////////////////

    // 发布游戏 区块链存储游戏指针 IPFS存储游戏
    function publish(
        string name, string style, string intro, string rules,
        uint price, string cover, string file) public {
        uint id = games.length;
        // 创建合约
        Game memory g = Game(msg.sender, name, style, intro, rules,
                            price, 0, 0, now, cover, file);
        games.push(g);

        // 记录发布
        userPool[msg.sender].publishedGames.push(id);

        // 通知
        publishSuccess(id, name, style, intro, rules, price, g.date, cover, file);
    }
    // 购买游戏
    function purchase(uint id) public payable {
        require(id < games.length);
        // 读取合约
        Game storage g = games[id];
        require(g.owner != msg.sender &&
                !g.isPurchased[msg.sender]);
        require(msg.value >= g.price);

        // 记录购买
        userPool[msg.sender].purchasedGames.push(id);
        g.sales++;
        g.isPurchased[msg.sender] = true;
        g.owner.transfer(msg.value); // 转账

        // 通知
        purchaseSuccess(id, msg.sender, g.price);
    }
    // 评价游戏
    function evaluate(uint id, uint star) public {
        require(id < games.length);
        // 读取合约
        Game storage g = games[id];
        require(g.owner != msg.sender &&
                g.isPurchased[msg.sender] &&
                !g.isEvaluated[msg.sender]);
        require(0 <= star && star <= 5);

        // 更新评分
        g.score += star;

        // 通知
        evaluateSuccess(id, msg.sender, g.score);
    }

    function () public {
        revert();
    }
}