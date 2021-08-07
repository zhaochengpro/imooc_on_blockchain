import React from "react";
import {withRouter} from "react-router-dom";
import { Row,Col,Form,Badge,Upload,Button } from "antd";
import { courseListContract,web3,getCourseContract,ipfsPrefix,saveFileToIPFS } from "../config";
import FormItem from "antd/lib/form/FormItem";

class Detail extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            account:'',
            address:this.props.match.params.address
        }
        this.init();
    }
    init = async ()=>{
        const [account] = await web3.eth.getAccounts();
        const detail = await getCourseContract(this.state.address).methods.getDetail().call({
            from:account,
            gas:"5000000"
        })
        this.setState({
            name:detail[0],
            content:detail[1],
            target:web3.utils.fromWei(detail[2]),
            fundingPrice:web3.utils.fromWei(detail[3]),
            price:web3.utils.fromWei(detail[4]),
            img:detail[5],
            video:detail[6],
            count:detail[7],
            role:detail[8],
            isOnline:detail[9],
            account

        })
    }
    buy = async() =>{
        let buyPrice;
        if(!this.state.isOnline){
            buyPrice = this.state.fundingPrice
        }else{
            buyPrice = this.state.price
        }
        console.log(buyPrice)
        await getCourseContract(this.state.address).methods.buy().send({
            from:this.state.account,
            value:web3.utils.toWei(buyPrice)
        })
        this.init();
    }
    handleUpload = async (file)=>{
        const hash = await saveFileToIPFS(file);
        await getCourseContract(this.state.address).methods.addVideo(hash).send({
            from:this.state.account,
            gas:"5000000"
        })
        this.init();
    }
    render(){
        let formItemLayout = {
            labelCol: {
                span: 6
            },
            wrapperCol: {
                span: 10
            }
        }
        return <Row type="flex" justify='center' style={{ marginTop: "30px" }}>
        <Col span={20}>
            <Form>
                <FormItem {...formItemLayout} label="课程名">
                    {this.state.name}
                </FormItem>
                <FormItem {...formItemLayout} label="课程简介">
                    {this.state.content}
                </FormItem>
                <FormItem {...formItemLayout} label="课程目标">
                    {this.state.target} ETH
                </FormItem>
                <FormItem {...formItemLayout} label="众筹价格">
                    {this.state.fundingPrice} ETH
                </FormItem>
                <FormItem {...formItemLayout} label="上线价格">
                    {this.state.price} ETH
                </FormItem>

                <FormItem {...formItemLayout} label="支持人数">
                    {this.state.count}
                </FormItem>

                <FormItem {...formItemLayout} label="状态">
                    {this.state.isOnline ? <Badge count="已上线"></Badge> : <Badge count="众筹中"></Badge>
                    }
                </FormItem>
                <FormItem {...formItemLayout} label="身份">
                    {this.state.role === '0' && <Upload beforeUpload={this.handleUpload} showUploadList={false}>
                        <Button type="primary">上传视频</Button>
                    </Upload>
                    }
                    {this.state.role === '1' && "已购买"
                    }
                    {this.state.role === '2' && "学员"
                    }
                </FormItem>
                <FormItem {...formItemLayout} label="视频状态">
                    {this.state.video ?(this.state.role === '2' ? "已上传":<video controls width="300px" src={`${ipfsPrefix}${this.state.video}`}></video>) : "等待上传"
                    }
                </FormItem>
                <FormItem {...formItemLayout} label="购买">
                    {this.state.role === '2' && (
                        <Button type="primary" onClick={this.buy}>
                            支持{this.state.isOnline?this.state.price:this.state.fundingPrice}ETH
                        </Button>
                    )
                    }
                </FormItem>
            </Form>
        </Col>
    </Row>
    }
}

export default withRouter(Detail)