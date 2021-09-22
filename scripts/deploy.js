/**
 * 将合约部署到ropsten虚拟测试链上
 */

const path = require('path');
const fs = require('fs');
const Web3 = require('web3');
const HdwalletProvider = require('truffle-hdwallet-provider');

const CourseList = require(path.resolve(__dirname,'../src/compiled/CourseList.json'));
const {interface,bytecode} = CourseList;
const provider = new HdwalletProvider(
    "save pause run butter submit chief believe place cherry damp next fluid",
    "https://rinkeby.infura.io/v3/2b86c426683f4a6095fd175fe931d799"
)

const web3 = new Web3(provider);

(async () => {
    const [account] = await web3.eth.getAccounts();
    console.time('合同部署时间')
    const contract = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data:bytecode})
            .send({
                from:account,
                gas:'5000000'
            })
    console.timeEnd('合同部署时间')
    const contractAddress = contract.options.address
    console.log('合约部署成功')
    console.log('合约查看网络',`https//ropsten.etherscan.io/address/${contractAddress}`)

    const addressPath = path.resolve(__dirname,'../src/address.js');
    fs.writeFileSync(addressPath,`export default ${JSON.stringify(contractAddress)}`)
    console.log('地址写入成功',addressFile)
})();
