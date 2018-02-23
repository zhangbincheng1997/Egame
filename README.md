# 基于 Ethereum 和 IPFS 的游戏平台

## 项目展示
1. 兑换代币
![alt text](docs/1.png "title")
2. 发布游戏
![alt text](docs/2.png "title")
3. 游戏主页
![alt text](docs/3.png "title")
4. 其他功能: 查看已购买的游戏、查看已发布的游戏、开始游戏、评价游戏......
![alt text](docs/4.png "title")
5. 后续功能: 搜索、分类、游戏排行、最新资讯、帮助中心......
[ERC20 代币标准](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md)

## 准备工作

### 安装 metamask 以太坊钱包(谷歌浏览器插件)
1. download from https://chrome.google.com/webstore/category/extensions  
![alt text](docs/5.png "title")
2. save `MetaMask Seed Words`  
![alt text](docs/6.png "title")
3. set `Customer RPC`  
![alt text](docs/7.png "title")

### 安装 truffle 以太坊开发框架
1. 安装命令
```
sudo apt-get install nodejs
sudo apt-get install npm
sudo npm install -g truffle
```
2. 框架目录
```
contracts/: Directory for Solidity contracts
migrations/: Directory for scriptable deployment files
test/: Directory for test files for testing your application and contracts
truffle.js: Truffle configuration file
```

### 安装 ganache 以太坊测试环境
1. download from http://truffleframework.com/ganache/  
![alt text](docs/8.png "title")
2. open the ganache, set Mnemonic as your MetaMask Seed Words, and Restart  
![alt text](docs/9.png "title")
3. open the metamask, Reset Account.  
![alt text](docs/10.png "title")

### 重点说明
1. 每次 重启 ganache 都要 重置 metamask!
2. 每次 重启 ganache 都要 重置 metamask!
3. 每次 重启 ganache 都要 重置 metamask!

## 项目运行
1. 编译合约命令: truffle compile
2. 部署合约命令: truffle migrate
3. 启动服务器命令: npm run dev

## 更多教程
1. 文档
>* web3: https://web3js.readthedocs.io/en/1.0/index.html
>* ipfs: https://ipfs.io/docs/
>* truffle: http://truffleframework.com/docs/
2. 插件
>* web3: https://github.com/ethereum/web3.js
>* ipfs: https://github.com/ipfs/js-ipfs-api
>* truffle: https://github.com/trufflesuite/truffle-contract
3. 案例
>* 宠物商店(英文): http://truffleframework.com/tutorials/pet-shop
>* 宠物商店(中文): https://learnblockchain.cn/2018/01/12/first-dapp/
>* 代币系统: https://github.com/Firstbloodio/token
>* 投票系统: https://github.com/maheshmurthy/ethereum_voting_dapp