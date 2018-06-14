import React, { Component } from 'react';
import './App.css';
import { Menu, Dropdown, Button, Icon, Row, Col, Spin } from 'antd'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

class App extends Component {
  
  state = {
    timerId: null,
    selectedCurrency: 'USD',
    currentPrice: '',
    currencies: [
      'USD',
      'GBP',
      'EUR',
    ],
    data: [],
    isLoadingHistory: true,
  }
  
  onSelectCurrency = async (e) => {
    await this.setState({
      selectedCurrency: e.key,
      currentPrice: '',
      
    })
    await this.fetchHistoryData()
  }
  
  menu = (
    <Menu onClick={this.onSelectCurrency}>
      {this.state.currencies.map((c) => <Menu.Item key={c}>{c}</Menu.Item>)}
    </Menu>
  )
  
  fetchHistoryData = async () => {
    await this.setState({
      isLoadingHistory: true
    })
    const response = await fetch(`https://api.coindesk.com/v1/bpi/historical/close.json?currency=${this.state.selectedCurrency}&t=${Date.now()}`)
    const data = await response.json()
    let dates = Object.keys(data.bpi)
    let tempObj = []
    for(let index in dates) {
      let date = dates[index]
      let price = data.bpi[date]
      let obj = {}
      obj['date'] = date
      obj[this.state.selectedCurrency] = price
      tempObj.push(obj)
    }
    this.setState({
      data: tempObj,
      isLoadingHistory: false
    })
  }
  
  fetchCurrentPrice = async () => {
    const response = await fetch(`https://api.coindesk.com/v1/bpi/currentprice.json?t=${Date.now()}`)
    const data = await response.json()
    this.setState((prevState, props) => ({
      currentPrice: data.bpi[this.state.selectedCurrency].rate
    }))
  }
  
  stopAutoFetch = () => {
    if(this.state.timerId !== null) {
      clearInterval(this.state.timerId)
    }
  }
  
  startAutoFetch = () => {
    let timerId = setInterval(() => {
      this.fetchCurrentPrice()
    }, 5000)
    this.setState({
      timerId: timerId
    })
  }
  
  fetchNowAndAgain = () => {
    this.stopAutoFetch()
    this.fetchCurrentPrice()
    this.startAutoFetch()
  }

  componentDidMount() {
    this.fetchNowAndAgain()
    this.fetchHistoryData()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.selectedCurrency !== this.state.selectedCurrency) {
      return true;
    }
    
    if(nextState.currentPrice !== this.state.currentPrice) {
      return true;
    }
    
    if(nextState.data !== this.state.data ) {
      return true;
    }
      
    return false;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.fetchNowAndAgain()
  }
  
  render() {
    return (
      <div>
      
        <Row style={{ paddingTop: 30 }}>
          <Col span={12} offset={6}>
      
            <Dropdown overlay={this.menu} trigger={['click']}>
              <Button style={{ marginLeft: 8 }}>
                {this.state.selectedCurrency} <Icon type="down" />
              </Button>
            </Dropdown>
            
            <h1 className="current-price">Current price : {this.state.currentPrice}{this.state.currentPrice===''?<Icon type="loading" style={{ fontSize: 24, color:"blue" }} spin />:''}  {this.state.selectedCurrency}</h1>
      
            <Spin spinning={this.state.isLoadingHistory}>
              <LineChart width={680} height={300} data={this.state.data}
               margin={{ top: 35, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={this.state.selectedCurrency} stroke="#82ca9d" />
              </LineChart>
            </Spin>
      
          </Col>
        </Row>
      
      
      </div>
    )
  }
}

export default App;
