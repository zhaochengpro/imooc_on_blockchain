pragma solidity ^0.4.24;

/**
    课程列表合同
 */
contract CourseList{
    address public ceo;
    address[] public courses;
    bytes23[] public questions;

    constructor()public{
        ceo = msg.sender;
    }

    //创建课程
    function createCourse(string _name,string _content,uint _target,uint _fundingPrice,uint _price,string _img) public {
        address newCourse = new Course(ceo,msg.sender, _name, _content, _target, _fundingPrice, _price,_img);
        courses.push(newCourse);
    }
    //获取所有课程
    function getCourses()public view returns(address[] memory) {
        return courses;
    }
    //移除课程
    function removeCourse(uint _index)public{
        //ceo才能移除课程
        require(msg.sender == ceo);
        //必须在课程长度内才能移除
        require(_index < courses.length);
        uint len = courses.length;
        //将所有的信息向前移
        for(uint i = _index; i < len - 1; i++){
            courses[i] = courses[i + 1];
        }
        //删除最后一个元素
        delete courses[len - 1];
        //长度减一
        courses.length--;
    }

    /**
        创建问答
        ipfs最长存储46位
        这里我们将其定长为两个23位
     */
    function createQa(bytes23 _hash1,bytes23 _hash2) public{
        questions.push(_hash1);
        questions.push(_hash2);
    }

    /**
        删除问答
     */
    function removeQa(uint _index) public{
        uint len = questions.length;
        uint index = _index * 2;
        for(uint i = index; i < len - 2; i+=2){
            questions[i] = questions[i + 2];
            questions[i + 1] = questions[i + 3];
        }

        delete questions[len - 1];
        delete questions[len - 2];
        questions.length-=2;
    }

    /**
        更新问答
     */
    function updateQa(uint _index,bytes23 _hash1,bytes23 _hash2) public{
        questions[_index * 2] = _hash1;
        questions[_index * 2 + 1] = _hash2;
    }

    /**
        获取问答
     */
    function getQa()public view returns(bytes23[]){
        return questions;
    }

    /**
        判断是否是ceo
     */
     function isCeo( )public view returns(bool) {
         return ceo == msg.sender;
     }

}

/**
    课程合约
 */
contract Course{
    address public ceo;
    address public owner;
    string public name;
    string public content;
    uint public target;
    uint public fundingPrice;
    uint public price;
    string public img;
    string public video;
    uint public count;
    bool public isOnline;

    //用户购买映射
    mapping(address => uint) public users;

    constructor(address _ceo,address _owner,string _name,string _content,uint _target,uint _fundingPrice,uint _price,string _img) public{
        ceo = _ceo;
        owner = _owner;
        name = _name;
        content = _content;
        target = _target;
        fundingPrice = _fundingPrice;
        price = _price;
        img = _img;
        video = '';
        count = 0;
        isOnline = false;
    }

    function getDetail() public view returns(string,string,uint,uint,uint,string,string,uint,uint,bool){
        uint role;
        if(msg.sender == owner){
            //讲师
            role = 0;
        }else if(users[msg.sender] > 0 ){
            //学员
            role = 1;
        }else{
            //普通用户
            role = 2;
        }
        return (
            name,
            content,
            target,
            fundingPrice,
            price,
            img,
            video,
            count,
            role,
            isOnline
        );
    }

    function buy()public payable{
        require(users[msg.sender] == 0);
        //判断用户购买课程价格是否与对应价格相符
        if(isOnline){
            require(price == msg.value);
        }else{
            require(fundingPrice == msg.value);
        }
        //将用户添加到购买列表中
        users[msg.sender] = msg.value;
        //支持人数加一
        count++;


        if(target <= count * fundingPrice){
            if(isOnline){
                //上线之后，用户购买与ceo分成
                uint value = msg.value;
                //ceo分成10%
                ceo.transfer(value / 10);
                //讲师分成90%
                owner.transfer(value - value / 10);
            }else{
                //上线之后将所有的钱转给讲师
                isOnline = true;
                owner.transfer(count * fundingPrice);
            }
        }

    }

    modifier OnlyOwner{
        require(msg.sender == owner);
        require(isOnline == true);
        _;
    }
    function addVideo(string _video)  public OnlyOwner {
        //只有讲师并且项目已上线才能发布
        video = _video;
    }
}