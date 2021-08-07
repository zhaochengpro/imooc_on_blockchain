import React from "react";
import {web3,courseListContract,readJsonFromIPFS,saveJsonToIPFS} from '../config'
import {Row,Col,Comment,Form,Badge,Input,Button,Modal, message} from 'antd'
import FormItem from "antd/lib/form/FormItem";

class Qa extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            questions:[],
            account:"",
            title:'',
            content:'',
            answer:'',
            showModal:false,
            ansIndex:'',
        }
        this.init();
    }
    init = async () =>{
        const [account] = await web3.eth.getAccounts();
        let ret = [];
        let questions = await courseListContract.methods.getQa().call({
            from:account,
            gas:'5000000'
        });

        for(let i = 0; i < questions.length - 1; i += 2){
            const hash = await readJsonFromIPFS(questions[i],questions[i + 1])
            ret.push(hash)
        }
        this.setState({
            account,
            questions:ret
        })
        
    }

    handleChange = (e)=>{
        e.preventDefault();
        this.setState({
            [e.target.name]:e.target.value
        })
    }

    handleSubmit = async(e) => {
        e.preventDefault();
        
        let obj = {
            title:this.state.title,
            content:this.state.content,
            answers:[]
        };
        const hide = message.loading('提问中',0);
        const hash = await saveJsonToIPFS(obj);
        const hash1 = hash.slice(0,23);
        const hash2 = hash.slice(23);
        await courseListContract.methods.createQa(web3.utils.asciiToHex(hash1),web3.utils.asciiToHex(hash2))
            .send({
                from:this.state.account,
                gas:'5000000'
            })

        hide()
        this.setState({
            title:'',
            content:''
        })
        this.init();

    }

    showInfoModal = (index) =>{
        this.setState({
            ansIndex:index,
            showModal:true
        })
    }
    handleCancel = ()=>{
        this.setState({
            showModal:false,
            answer:"",
        })
    }

    handleOk = async() => {
        let ans = this.state.questions[this.state.ansIndex];
        ans.answers.push({
            text:this.state.answer
        });
        const hide = message.loading('回复中',0);
        const hash = await saveJsonToIPFS(ans);
        const hash1 = hash.slice(0,23);
        const hash2 = hash.slice(23);
        await courseListContract.methods.updateQa(
            this.state.ansIndex,
            web3.utils.asciiToHex(hash1),
            web3.utils.asciiToHex(hash2)
            ).send({
            from:this.state.account,
            gas:'5000000'
        })
        hide();
        this.setState({
            answer:'',
            showModal:false,
        })
        this.init();
    }
    handleAnsChange = (e) => {
        this.setState({
            answer:e.target.value
        })
    }
    render(){
        return <Row justify="center">
        <Col span={20}>
            {
                this.state.questions.map((item, index) => {
                    return (<Comment
                        actions={[<span onClick={() => this.showInfoModal(index)}>回复</span>]}
                        author={item.title}
                        content={item.content}
                        avatar={<Badge count={index + 1} />}
                        key={index}>
                        {
                            item.answers.map((ans, i) => {
                                return <Comment content={ans.text} key={i}></Comment>
                            })
                        }
                    </Comment>)
                })
            }
            <Form style={{ marginTop: "20px" }}>
                <FormItem label="标题">
                    <Input value={this.state.title} onChange={this.handleChange} name="title"></Input>
                </FormItem>
                <FormItem label="问题描述">
                    <Input.TextArea
                        rows={6}
                        value={this.state.content}
                        onChange={this.handleChange}
                        name="content"></Input.TextArea>
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>提问</Button>
                </FormItem>
            </Form>
            <Modal
                title="回复"
                visible={this.state.showModal}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
            >
                <Input value={this.state.answer} onChange={this.handleAnsChange}></Input>
            </Modal>
        </Col>
    </Row>
    }
}

export default Qa