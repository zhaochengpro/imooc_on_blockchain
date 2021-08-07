const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname,"../contracts/Imooc.sol");

const source = fs.readFileSync(contractPath,"utf-8");

// console.log(source)
const ret = solc.compile(source);

if(Array.isArray(ret.errors) && ret.errors.length > 0){
    console.log(ret.errors[0])
}else{
    Object.keys(ret.contracts).forEach((name) =>{
        const compliedPath = path.resolve(__dirname,`../src/compiled/${name.slice(1)}.json`);
        fs.writeFileSync(compliedPath,JSON.stringify(ret.contracts[name]));
        console.log(`${compliedPath} is over`)
    })
    
}


