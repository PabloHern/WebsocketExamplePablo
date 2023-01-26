import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { Card, Avatar, Input, Typography, Button, Divider } from 'antd';
import 'antd/dist/reset.css';
import './App.css'

const { Search } = Input;
const { Text } = Typography;
const { Meta } = Card;

const client = new W3CWebSocket('ws://127.0.0.1:8000');

export default class App extends Component {

  state = {
    userName: '',
    isLoggedIn: false,
    myMessage: null,
    messages: [],
    user_id: {},
    users: [],
    count: 1,
  }


  onButtonClicked = (prevState) => {
    this.setState({ count: prevState + 1 })
    client.send(JSON.stringify({
      type: "message",
      msg: this.state.count,
      user: this.state.userName
    }));

  }
  componentDidMount() {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      if (this.state.users[dataFromServer.id] == null) {
        this.state.user_id[dataFromServer.id] = dataFromServer.user;
        this.state.users[dataFromServer.id] = 0;
      }
      console.log('got reply! ', dataFromServer);
      console.log(this.state.users);
      if (dataFromServer.type === "message" && dataFromServer.user == this.state.userName) {
        console.log("luismiguel")
        console.log("comida");
        this.setState({ myMessage: dataFromServer })
        this.state.users[dataFromServer.id] = dataFromServer.msg;
      } else if (dataFromServer.type === "message") {
        this.state.users[dataFromServer.id] = dataFromServer.msg;
        console.log(this.state.users.map(message => message));
      }
    };
  }
  render() {
    return (
      <div className="main" id='wrapper'>
        {this.state.isLoggedIn ?
          <div>
            <div className="title">
              <Text id="main-heading" type="secondary" style={{ fontSize: '36px' }}>Megaclicker</Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 50 }} id="messages">
              <Divider style={{ width: 300, paddingTop: 20 }}>
                <Button style={{ width: 300, height: 100 }} onClick={value => this.onButtonClicked(this.state.count)}>CLICK ME PLEASE</Button>
              </Divider>
              {this.state.myMessage ?
                <>
                  <Card key={this.state.myMessage.msg} style={{ width: 300, margin: '16px 4px 0 4px', alignSelf: this.state.userName === this.state.myMessage.user ? 'flex-start' : 'flex-start' }} loading={false}>
                    <Meta
                      avatar={
                        <Avatar style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>{this.state.myMessage.user[0].toUpperCase()}</Avatar>
                      }
                      title={this.state.myMessage.user + ":"}
                      description={this.state.myMessage.msg}
                    />
                  </Card></>
                : <div></div>}

              {this.state.users.map(message =>
                <Card style={{ width: 300, margin: '16px 4px 0 4px', alignSelf: this.state.userName === this.state.user_id[message] ? 'flex-start' : 'flex-start' }} loading={false}>
                  <Meta
                    title={this.state.user_id[message] + ":"}
                    description={message}
                  />
                </Card>
              )}

            </div>
          </div>
          :
          <div style={{ padding: '200px 40px' }}>
            <Search
              placeholder="Enter Username"
              enterButton="Login"
              size="large"
              onSearch={value => this.setState({ isLoggedIn: true, userName: value })}
            />
          </div>
        }
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));