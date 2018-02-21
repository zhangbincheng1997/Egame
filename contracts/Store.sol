pragma solidity ^0.4.0;

contract Token {// 限制范围 合约总代币

    // 代币系统
    uint totalTokens;    // Total no. of tokens available for this election
    uint balanceTokens;  // Total no. of tokens still available for purchase
    uint tokenPrice;     // Price per token

    // 所有用户余额记录
    mapping(address=>uint) balances;

    // 买入代币触发事件 [用户地址, 购买数量]
    event buySuccess(address addr, uint num);
    // 卖回代币触发事件 [用户地址, 赎回数量]
    event sellSuccess(address addr, uint num);

    // 获取余额信息 总代币 剩余代币 合约金币 用户代币 用户金币 兑换率
    function getBalanceInfo()
            public view returns (uint, uint, uint, uint, uint, uint) {
        return (totalTokens, balanceTokens, this.balance,
                balances[msg.sender], msg.sender.balance, tokenPrice);
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

// 商店合约
contract Store is Token {

    // deployer.deploy(Store, 100000, web3.toWei('0.1', 'ether'))
    function Store(uint _tokens, uint _tokenPrice) public {
        totalTokens = _tokens;
        balanceTokens = _tokens;
        tokenPrice = _tokenPrice; // 1000000000000000
    }

    // 评论
    struct Comment {
        address buyer;
        uint date;
        uint score;
        string content;
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
        uint date;      // 发布日期
        string cover;   // 封面指针
        string file;    // 文件指针

        uint clen;      // 评论数量
        mapping(uint=>Comment) comments; // 评论列表
    }
    Game[] games;

    // 用户
    struct User {
        uint[] purchasedGames;   // 已购买的游戏
        uint[] publishedGames;   // 已发布的游戏
    }
    mapping(address=>User) userPool;

    // 发布成功触发事件 [游戏ID, 游戏名, 类型, 简介, 玩法, 价格, 发布日期, 封面指针, 文件指针]
    event publishSuccess(uint id, string name, string style, string intro, string rules,
                        uint price, uint date, string cover, string file);
    // 购买成功触发事件 [游戏ID, 用户地址, 价格]
    event purchaseSuccess(uint id, address addr, uint price);
    // 评价成功触发事件 [游戏ID, 用户地址, 评分]
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
    // 获取评论数量
    function getCommentLength(uint id) public view returns (uint) {
        return games[id].clen;
    }
    // 获取游戏信息!!!!!!
    function getGameInfo(uint id) public view returns (
        address, string, string, string, string, uint, uint, uint, uint, string) {
        require(id < games.length);
        // 获取合约
        Game storage g = games[id];
        return (g.owner, g.name, g.style, g.intro, g.rules,
                g.price, g.sales, g.score, g.date, g.cover);
    }
    // 获得评价信息!!!!!!
    function getEvaluatedInfo(uint gid, uint cid)
                public view returns (address, uint, string) {
        require(gid < games.length);
        require(cid < games[gid].clen);
        Comment storage c = games[gid].comments[cid];
        return (c.buyer, c.score, c.content);
    }
    // 获取游戏文件!!!!!!
    function getGameFile(uint id) public view returns (string) {
        require(id < games.length);
        // 获取合约
        Game storage g = games[id];
        require(g.owner == msg.sender || isPurchased(id));
        return (g.file);
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

    // 发布游戏 区块链存储游戏指针 IPFS存储游戏 "地下城与勇士", "冒险", "简介", "玩法", 10, "0xcover", "0xfile"
    function publish(
        string name, string style, string intro, string rules,
        uint price, string cover, string file) public {
        uint id = games.length;
        // 创建合约
        Game memory g = Game(msg.sender, name, style, intro, rules,
                            price, 0, 0, now, cover, file, 0); // clen = 0
        games.push(g);

        // 记录发布
        userPool[msg.sender].publishedGames.push(id);

        // 通知
        publishSuccess(id, name, style, intro, rules, price, g.date, cover, file);
    }
    // 购买游戏
    function purchase(uint id) public {
        require(id < games.length);
        // 读取合约
        Game storage g = games[id];
        require(g.owner != msg.sender &&
                !isPurchased(id));
        require(balances[msg.sender] >= g.price); // 代币足够

        // 记录购买
        userPool[msg.sender].purchasedGames.push(id);
        g.sales++;
        balances[msg.sender] -= g.price;
        balances[g.owner] += g.price;

        // 通知
        purchaseSuccess(id, msg.sender, g.price);
    }
    // 评价游戏
    function evaluate(uint id, uint score, string content) public {
        require(id < games.length);
        // 读取合约
        Game storage g = games[id];
        require(g.owner != msg.sender &&
                isPurchased(id) && isEvaluated(id));
        require(0 <= score && score <= 5);

        // 更新评分
        g.score += score;
        g.comments[g.clen] = Comment(msg.sender, now, score, content);
        g.clen++;

        // 通知
        evaluateSuccess(id, msg.sender, g.score);
    }

    function () public {
        revert();
    }
}