const {notification, message} = require('antd')
const Web3 = require('web3');
const CourseList = require('./compiled/CourseList.json');
const Course = require('./compiled/Course.json');
const address = require('./address');
const concat = require('it-concat')
const ipfsClient = require('ipfs-http-client')

//web3
let web3;
if(typeof window.ethereum !== 'undefined'){
    web3 = new Web3(window.web3.currentProvider);
} else{
    notification.warning({
        message: '没有检测到以太坊插件',
        description: "请安装并激活metamask"
    })
}

//ipfs
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
const ipfsPrefix = 'https://ipfs.infura.io:5001/api/v0/cat?arg=';


//contract合约
const courseListContract = new web3.eth.Contract(JSON.parse(CourseList.interface),address.default);

let getCourseContract = (addr) => new web3.eth.Contract(JSON.parse(Course.interface),addr);


function saveFileToIPFS(file){
    const hide = message.loading('上传中');
    return new Promise((resolve,reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async() => {
            const buffer = Buffer.from(reader.result);
            const ret = await ipfs.add(buffer);
            hide();
            resolve(ret.path);
        }
    })
}

function saveJsonToIPFS(json){
    // const hide = message.loading('上传中');
    return new Promise(async (resolve,reject) => {
        const buffer = Buffer.from(JSON.stringify(json));
        const ret = await ipfs.add(buffer);
        // hide();
        resolve(ret.path);
    })
}

function readJsonFromIPFS(hash1,hash2){
    return new Promise(async (resolve,reject) => {
        const hash = web3.utils.hexToAscii(hash1) + web3.utils.hexToAscii(hash2)
        const ret = await concat(ipfs.cat(hash));
        const res = ret.toString();
        resolve(JSON.parse(res));
    })
}

export {
    ipfs, 
    ipfsPrefix, 
    saveFileToIPFS, 
    web3, 
    courseListContract, 
    getCourseContract, 
    saveJsonToIPFS,
    readJsonFromIPFS
}