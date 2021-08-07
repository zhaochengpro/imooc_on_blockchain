import {Layout, Menu,Row } from "antd";
import React from "react";
import { Link } from "react-router-dom";
const Head = Layout.Header;


class HeadComp extends React.Component{
    render(){
        return <Head>
            <div className="logo">
                <img src="./imooc.png" />
            </div>
            <Menu
            theme='dark'
            mode="horizontal"
            >
                <Menu.Item key="/">
                    <Link to="/">首页</Link>
                </Menu.Item>
                <Menu.Item key="/qa">
                    <Link to="/qa">问答区</Link>
                </Menu.Item>
                <Menu.Item key="/create">
                    <Link to="/create">我要众筹</Link>
                </Menu.Item>
        </Menu>
        </Head>
        
    }
}
export default HeadComp;