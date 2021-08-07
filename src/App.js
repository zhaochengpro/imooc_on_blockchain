import React from 'react';
import './App.less'
import { Button } from 'antd';
import { BrowserRouter, Route, Link } from "react-router-dom";
import Head from "./components/Header";
import Create from './pages/Create';
import Detail from './pages/Detail';
import Qa from './pages/Qa';
import Course from './pages/Course';
import Layout, { Content } from 'antd/lib/layout/layout';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <BrowserRouter className="App">
        <Layout>
          <Head></Head>
          <Content>
            <Route path='/create' component={Create}></Route>
            <Route path='/qa' component={Qa}></Route>
            <Route path='/' exact component={Course}></Route>
            <Route path='/detail/:address' component={Detail}></Route>
          </Content>
        </Layout>

      </BrowserRouter>
    )
  }
}

export default App;
