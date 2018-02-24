pragma solidity ^0.4.0;

// 代币系统
contract Token {

    uint tokenTotal;    // 代币总和
    uint tokenPrice;    // 代币价格
    uint balanceTokens; // 合约余额

    // 所有用户余额记录
    mapping(address=>uint) balances;

    event buySuccess(address addr, uint num);
    event sellSuccess(address addr, uint num);

    // 获取余额信息 [代币总和 代币价格 合约余额 合约金币 用户余额 用户金币]
    function getBalanceInfo() public view returns (
        uint, uint, uint, uint, uint, uint) {
        return (tokenTotal, tokenPrice,
                balanceTokens, this.balance,
                balances[msg.sender], msg.sender.balance);
    }

    // 买入代币
    function buy() public payable {
        uint tokensToBuy = msg.value / tokenPrice;
        require(tokensToBuy <= balanceTokens); // 合约代币是否足够

        // 更新信息
        balances[msg.sender] += tokensToBuy;
        balanceTokens -= tokensToBuy;
        buySuccess(msg.sender, tokensToBuy);
    }

    // 卖出代币
    function sell(uint tokensToSell) public {
        require(tokensToSell <= balances[msg.sender]); // 用户代币是否足够

        // 更新信息
        uint total = tokensToSell * tokenPrice;
        balances[msg.sender] -= tokensToSell;
        balanceTokens += tokensToSell;
        msg.sender.transfer(total);
        sellSuccess(msg.sender, tokensToSell);
    }
}

// 商店系统
contract Store is Token {

    // deployer.deploy(Store, 100000, web3.toWei('0.1', 'ether'))
    function Store(uint _tokens, uint _tokenPrice) public {
        tokenTotal = _tokens;       // 100000
        tokenPrice = _tokenPrice;   // 100000000000000000
        balanceTokens = tokenTotal; // 100000
    }

    // 用户
    struct User {
        uint[] purchasedGames;  // 已购买的游戏
        uint[] publishedGames;  // 已发布的游戏
    }

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
        uint date;      // 日期
        string cover;   // 封面 (ipfs)
        string file;    // 文件 (ipfs)

        uint clen;                          // 评价数量
        mapping(uint=>Comment) comments;    // 评价列表
    }

    // 评价
    struct Comment {
        address buyer;  // 购买者
        uint date;      // 日期
        uint score;     // 评分
        string content; // 评论
    }

    Game[] games;
    mapping(address=>User) userPool;

    event publishSuccess(
        uint id, string name, string style, string intro, string rules,
        uint price, uint date, string cover, string file);
    event purchaseSuccess(uint id, address addr, uint price);
    event evaluateSuccess(uint id, address addr, uint score);

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

    // 获取评价数量
    function getCommentLength(uint id) public view returns (uint) {
        return games[id].clen;
    }

    // 获取游戏信息!!!!!!
    function getGameInfo(uint id) public view returns (
        address, string, string, string, string, uint, uint, uint, uint, string) {
        require(id < games.length);
        // 获取游戏
        Game storage g = games[id];
        return (g.owner, g.name, g.style, g.intro, g.rules,
                g.price, g.sales, g.score, g.date, g.cover);
    }

    // 获取游戏文件!!!!!!
    function getGameFile(uint id) public view returns (string) {
        require(id < games.length);
        // 获取游戏
        Game storage g = games[id];
        require(g.owner == msg.sender || isPurchased(id)); // 限制条件
        return (g.file);
    }

    // 获得评价信息!!!!!!
    function getCommentInfo(uint gid, uint cid) public view returns (
        address, uint, uint, string) {
        require(gid < games.length);
        require(cid < games[gid].clen);
        // 获取评价
        Comment storage c = games[gid].comments[cid];
        return (c.buyer, c.date, c.score, c.content);
    }

    // 是否已经购买 通过遍历实现
    function isPurchased(uint id) public view returns (bool) {
        User storage u = userPool[msg.sender];
        for(uint i = 0; i < u.purchasedGames.length; i++)
            if(u.purchasedGames[i] == id)
                return true; // 已经购买
        return false; // 尚未购买
    }

    // 是否已经评价 通过遍历实现
    function isEvaluated(uint id) public view returns (bool) {
        Game storage g = games[id];
        for(uint i = 0; i < g.clen; i++)
            if(g.comments[i].buyer == msg.sender)
                return true; // 已经评价
        return false; // 尚未评价
    }

    // 发布游戏
    function publish(
        string name, string style, string intro, string rules,
        uint price, string cover, string file) public {
        uint id = games.length;
        // 创建合约
        Game memory g = Game(msg.sender, name, style, intro, rules,
                            price, 0, 0, now, cover, file, 0); // clen = 0

        // 记录发布
        games.push(g);
        userPool[msg.sender].publishedGames.push(id);

        publishSuccess(id, name, style, intro, rules, price, g.date, cover, file);
    }

    // 购买游戏
    function purchase(uint id) public {
        require(id < games.length);
        // 读取合约
        Game storage g = games[id];
        require(g.owner != msg.sender && !isPurchased(id)); // 限制条件
        require(balances[msg.sender] >= g.price); // 合法条件

        // 记录购买
        balances[msg.sender] -= g.price;
        balances[g.owner] += g.price;
        g.sales++;
        userPool[msg.sender].purchasedGames.push(id);

        purchaseSuccess(id, msg.sender, g.price);
    }

    // 评价游戏
    function evaluate(uint id, uint score, string content) public {
        require(id < games.length);
        // 读取合约
        Game storage g = games[id];
        require(g.owner != msg.sender && isPurchased(id) && !isEvaluated(id)); // 限制条件
        require(0 <= score && score <= 10); // 合法条件

        // 记录评价
        g.score += score;
        g.comments[g.clen++] = Comment(msg.sender, now, score, content);

        evaluateSuccess(id, msg.sender, g.score);
    }

    // https://solidity.readthedocs.io/en/latest/contracts.html#fallback-function
    function () public {
        revert();
    }
}