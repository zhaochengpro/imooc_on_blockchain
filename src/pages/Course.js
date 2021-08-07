import React from "react";
import { Col, Row, Switch, Badge, Button } from "antd";
import { Link } from "react-router-dom";
import { web3, courseListContract, getCourseContract, ipfsPrefix } from '../config'

class Course extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addressList: [],
            detailList: [],
            showAll: true,
            isCeo: false
        }
        this.init();
    }
    init = async () => {
        const [account] = await web3.eth.getAccounts();
        const addressList = await courseListContract.methods.getCourses().call({
            from: account,
            gas: '5000000'
        })

        const detailList = await Promise.all(
            addressList.map((v) => {
                return getCourseContract(v).methods.getDetail().call({
                    from: account,
                    gas: '5000000'
                })
            }))
        const isCeo = await courseListContract.methods.isCeo().call({
            from: account,
            gas: "5000000"
        })

        this.setState({
            addressList,
            detailList,
            isCeo,
            account
        })
    }
    onChangeSwitch = (v) => {
        this.setState({
            showAll:v
        })
    }
    remove = async(i) => {
        await courseListContract.methods.removeCourse(i).send({
            from:this.state.account,
            gas:'5000000'
        })
        this.init();
    }
    render() {
        return <Row
            gutter={16}
            type="flex"
            style={{ marginTop: "20px",marginLeft:"10px" }}

        >
            <Col span={20}>
                <Switch onChange={this.onChangeSwitch} checkedChildren="全部" unCheckedChildren="已上线" defaultChecked></Switch>
            </Col>
            {
                this.state.detailList.map((detail, i) => {
                    const address = this.state.addressList[i]
                    let [name, content, target, fundingPrice, price, img, video, count, role,isOnline] = Object.values(detail);
                    if (!this.state.showAll && !isOnline) {
                        return null
                    }
                    target = web3.utils.fromWei(target)
                    fundingPrice = web3.utils.fromWei(fundingPrice)
                    price = web3.utils.fromWei(price)
                    let buyPrice = isOnline ? price : fundingPrice
                    return (<Col key={i} span={6}>
                        <div className="content">
                            <p>
                                <span>{name}</span>
                                <span>
                                    {isOnline
                                        ? <Badge count="已上线" style={{ background: "#52c41a" }}></Badge> :
                                        <Badge count="众筹中" ></Badge>
                                    }
                                </span>
                            </p>
                            <img className="item" src={`${ipfsPrefix}${img}`} alt="" />
                            <div className="center">
                                <p>
                                    {`目标${target}ETH,已有${count}人支持`}
                                </p>
                                <p>
                                    {
                                        isOnline ? <Badge count={`上线价${price}ETH`} style={{ background: "#52c41a" }}></Badge> :
                                            <Badge count={`众筹价${fundingPrice}ETH`}></Badge>
                                    }
                                </p>
                                <Button type="primary" block style={{ marginBottom: "10px" }}>
                                    <Link to={`/detail/${address}`}>
                                        查看详情
                                    </Link>
                                </Button>
                                {
                                    this.state.isCeo ? <Button type="primary" onClick={() => this.remove(i)} block>删除</Button> : null
                                }
                            </div>
                        </div>
                    </Col>)
                })
            }
        </Row>
    }
}

export default Course