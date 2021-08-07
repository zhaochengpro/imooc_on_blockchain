const Web3 = require('web3');
const  ganache =  require('ganache-cli');
const  assert = require('assert');
const path = require('path');
const BigNum = require('bignumber.js')
const  CourseList =  require(path.resolve(__dirname,'../src/compiled/CourseList.json'));
const  Course  =  require(path.resolve(__dirname,'../src/compiled/Course.json'));
const web3 = new Web3(ganache.provider());

let accounts;
let courseList;
let course;

describe('Imooc智能合约', () => {
    before(async () =>{
        accounts = await web3.eth.getAccounts();
        const {interface,bytecode} = CourseList;
        courseList = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data:bytecode})
            .send({
                from:accounts[0],
                gas:"5000000"
            });
    })

    it('合约部署成功', async() => {
        assert.ok(courseList.options.address)
    });
    it("创建课程",async ()=>{
        const oldAddress = await courseList.methods.getCourses().call();
        assert.equal(oldAddress.length,0);
        await courseList.methods.createCourse(
            'zc的react课程',
            '这是zc发布的react课程',
            web3.utils.toWei('8'),
            web3.utils.toWei('2'),
            web3.utils.toWei('4'),
            '图片的hash',
        ).send({
            from:accounts[9],
            gas:"5000000"
        })
        const newAddress = await courseList.methods.getCourses().call();
        assert.equal(newAddress.length,1);
    })
    it('课程属性', async() => {
        const address = await courseList.methods.getCourses().call();
        course = await new web3.eth.Contract(JSON.parse(Course.interface),address[0]);
        const name = await course.methods.name().call()
        const content = await course.methods.content().call()
        const target = await course.methods.target().call()
        const fundingPrice = await course.methods.fundingPrice().call()
        const price = await course.methods.price().call()
        const img = await course.methods.img().call()
        const count = await course.methods.count().call()
        const isOnline = await course.methods.isOnline().call()
        assert.equal(name,'zc的react课程')
        assert.equal(content,'这是zc发布的react课程')
        assert.equal(target,web3.utils.toWei('8'))
        assert.equal(fundingPrice,web3.utils.toWei('2'))
        assert.equal(price,web3.utils.toWei('4'))
        assert.equal(img,'图片的hash')
        assert.ok(!isOnline)
        assert.equal(count,0);
    });
    it('是否是ceo',async ()=>{
        const isceo = await courseList.methods.isCeo().call({
            from:accounts[0]
        })
        assert.ok(isceo);
        const isceo2 = await courseList.methods.isCeo().call({
            from:accounts[1]
        })
        assert.ok(!isceo2)
    })
    it('删除课程', async () => {
        
        await courseList.methods.createCourse(
            'zc的vue课程',
            '这是个zc的vue课程',
            web3.utils.toWei('8'),
            web3.utils.toWei('2'),
            web3.utils.toWei('4'),
            '图片的hash1'
        ).send({
            from:accounts[9],
            gas:"5000000"
        })
        const oldAddress = await courseList.methods.getCourses().call();
        assert.equal(oldAddress.length,2);
        try {
            await courseList.methods.removeCourse(1).send({
                from:accounts[1],
                gas:"5000000"
            })
            assert.ok(false);
        } catch (error) {
            assert.equal(error.name,'c')
        }
        try {
            await courseList.methods.removeCourse(2).send({
                from:accounts[0],
                gas:"5000000"
            })
            assert.ok(false);
        } catch (error) {
            assert.equal(error.name,'c')
        }

        await courseList.methods.removeCourse(1).send({
            from:accounts[0],
            gas:"5000000"
        })

        const newAddress = await courseList.methods.getCourses().call();
        assert.equal(newAddress.length,1);
    });

    it('购买课程', async () => {
        await course.methods.buy().send({
            from:accounts[1],
            value:web3.utils.toWei('2')
        })
        const value = await course.methods.users(accounts[1]).call();
        const count = await course.methods.count().call();
        assert.equal(value,web3.utils.toWei('2'));
        assert.equal(count,1)

        const detail = await course.methods.getDetail().call({from:accounts[9]})
        assert.equal(detail[8],0)
        const detail1 = await course.methods.getDetail().call({from:accounts[1]});
        assert.equal(detail1[8],1);
        const detail2 = await course.methods.getDetail().call({from:accounts[3]});
        assert.equal(detail2[8],2);
    });
    it('不能重复购买', async() => {
        try {
            await course.methods.buy().send({
                from:accounts[1],
                value:web3.utils.toWei('2')
            })
            assert.ok(false)
        } catch (error) {
            assert.equal(error.name,'c')
        }
    });
    
    it('未上线不能以上线价格购买', async() => {
        try {
            await course.methods.buy().send({
                from:accounts[1],
                value:web3.utils.toWei('4')
            })
            assert.ok(false)
        } catch (error) {
            assert.equal(error.name,'c')
        }
    });
    it('未上线，不能上线视频', async() => {
        try {
            await course.methods.addVideo('视频hash').send({
                from:accounts[9],
                gas:'5000000'
            })
        } catch (error) {
            assert.equal(error.name,'c');
        }
    });
    
    it('未上线，购买的钱不到讲师账户', async() => {
        const oldBalance = new BigNum(await web3.eth.getBalance(accounts[9]));
        await course.methods.buy().send({
            from:accounts[2],
            value:web3.utils.toWei('2')
        })
        const newBlance = new BigNum(await web3.eth.getBalance(accounts[9]));
        const diff = newBlance.minus(oldBalance);
        assert.equal(diff,0);
    });
    it('上线，购买的钱到讲师账户', async() => {
        const oldBalance = new BigNum(await web3.eth.getBalance(accounts[9]));
        await course.methods.buy().send({
            from:accounts[3],
            value:web3.utils.toWei('2')
        })
        await course.methods.buy().send({
            from:accounts[4],
            value:web3.utils.toWei('2')
        })
        const newBlance = new BigNum(await web3.eth.getBalance(accounts[9]));
        const diff = newBlance.minus(oldBalance);
        assert.equal(diff,web3.utils.toWei('8'));
    });
    it('上线之后，以上线价格购买', async() => {
        try {
            await course.methods.buy().send({
                from:accounts[5],
                value:web3.utils.toWei('2')
            })
            assert.ok(false);
        } catch (error) {
            assert.equal(error.name,'c')
        }
        await course.methods.buy().send({
            from:accounts[5],
            value:web3.utils.toWei('4')
        })
        const count = await course.methods.count().call();
        assert.equal(count,5)
    });
    it('上线之后购买，与ceo分成', async () => {
        const oldCeoBalance = new BigNum(await web3.eth.getBalance(accounts[0]));
        const oldOwnerBalane = new BigNum(await web3.eth.getBalance(accounts[9]));
        await course.methods.buy().send({
            from:accounts[6],
            value:web3.utils.toWei('4')
        })
        const newCeoBalance = new BigNum(await web3.eth.getBalance(accounts[0]));
        const newOwnerBalane = new BigNum(await web3.eth.getBalance(accounts[9]));
        const ceoDiff = newCeoBalance.minus(oldCeoBalance);
        const ownerDiff = newOwnerBalane.minus(oldOwnerBalane);
        assert.equal(ceoDiff,web3.utils.toWei('0.4'))
        assert.equal(ownerDiff,web3.utils.toWei('3.6'))
    });
    
    it('上线后，上线视频', async() => {
        await course.methods.addVideo('视频hash').send({
            from:accounts[9],
            gas:'5000000'
        })
        const hash = await course.methods.video().call();
        assert.equal(hash,'视频hash')
    });
    
        
});


