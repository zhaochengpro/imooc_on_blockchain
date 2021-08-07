import { Col,Input,Row,Upload,Button } from "antd";
import Form from "antd/lib/form/Form";
import FormItem from "antd/lib/form/FormItem";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { Redirect } from "react-router-dom";
import { ipfsPrefix,saveFileToIPFS,web3,courseListContract,getCourseContract } from "../config";

class Create extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            toIndex:false
        }
    }
    handleChange = (e)=>{
        this.setState({
            [e.target.name]:e.target.value
        })
    }
    handleSubmit = async (e) => {
        e.preventDefault();
        console.log(this.state);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const [account] = await web3.eth.getAccounts();
        const arr = [
            this.state.name,
            this.state.content,
            web3.utils.toWei(this.state.target),
            web3.utils.toWei(this.state.fundingPrice),
            web3.utils.toWei(this.state.price),
            this.state.img
        ]
        await courseListContract.methods.createCourse(...arr).send({
            from: account,
            gas:'5000000'
        });
        this.setState({
            toIndex:true,
        })

    }
    handleUpload = async (file) => {
        const hash = await saveFileToIPFS(file);
        console.log(hash)
        this.setState({
            img:hash
        })

        return false;
    }
    render(){
        if(this.state.toIndex){
            return <Redirect to="/"></Redirect>
        }
        return <Row 
        
        justify="center"
        style={{ marginTop: '30px' }}
                >
            <Col span={20} style={{marginTop:'20px'}}>
                <Form>
                    <FormItem label="名称">
                        <Input onChange={this.handleChange} name="name"></Input>
                    </FormItem>
                    <FormItem label="简介">
                        <TextArea onChange={this.handleChange} name="content"></TextArea>
                    </FormItem>
                    <FormItem label="课程结构图">
                        <Upload
                            beforeUpload={this.handleUpload}
                            showUploadList={false}
                        >
                            {
                                this.state.img ?
                                    <img height="100px" src={`${ipfsPrefix}${this.state.img}`} />
                                    : <Button type="primary">上传图片</Button>

                            }

                        </Upload>
                    </FormItem>
                    <FormItem label="众筹目标">
                        <Input name="target" onChange={this.handleChange} />
                    </FormItem>
                    <FormItem label="众筹价格">
                        <Input onChange={this.handleChange} name="fundingPrice"></Input>
                    </FormItem>
                    <FormItem label="上线价格">
                        <Input onChange={this.handleChange} name="price"></Input>
                    </FormItem>
                    <FormItem >
                       <Button type='primary' onClick={this.handleSubmit}>创建课程</Button>
                    </FormItem>
                </Form>
            </Col>
        </Row>
    }
}

export default Create