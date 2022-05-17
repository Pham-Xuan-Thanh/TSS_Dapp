/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useState} from 'react';
import { Menu } from 'antd';
import {  EyeInvisibleOutlined, 
          EyeOutlined,
          SettingOutlined,
          IdcardOutlined,
          CopyOutlined  } from '@ant-design/icons'
import axios from 'axios';
import { USER_SERVER } from '../../../Config';
import { withRouter, Link } from 'react-router-dom';
import { useSelector } from "react-redux";

function RightMenu(props) {
  const user = useSelector(state => state.user)
  const wallet = useSelector(state => state.wallet)
  const [visible, setVisible] = useState(false)
  const [openKeys , setOpenKeys] = useState([])



  const handleVisible = () => {
    setVisible(!visible)
  }
  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {
      if (response.status === 200) {
        props.history.push("/login");
      } else {
        alert('Log Out Failed')
      }
    });
  };

  if (user.userData && !user.userData?.isAuth) {
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="mail">
          {/* <a href="/login">Signin</a> */}
          <Link to="/login" > Signin</Link>
        </Menu.Item>
        <Menu.Item key="app">
          <Link to="/register" >Signup</Link>
          {/* <a href="/register">Signup</a> */}
        </Menu.Item>
      </Menu>
    )
  } else {
    return (
      <Menu mode={props.mode}
          openKeys={openKeys}
          onOpenChange={()=> setOpenKeys([...openKeys,'submenu']) }
          onMouseLeave={() => setOpenKeys([])}
          >

        <Menu.SubMenu key="submenu" title="Account" icon={<SettingOutlined/>}>
        { (wallet?.balance) ?<Menu.Item key="balance" onClick={handleVisible} 
            icon={visible ? <EyeOutlined/> : <EyeInvisibleOutlined /> }
            title="abc">
              {visible ? `${ wallet.balance.amount}$`: `*****`}
        </Menu.Item> : <></>}
        { (user.userData?.isAuth) ?          
          <Menu.Item key="wallet" icon={<IdcardOutlined />}>
             {user.userData.address} <CopyOutlined onClick={() => {   navigator.clipboard.writeText(`${user.userData.address}`)}}  />
          </Menu.Item>
          : <></>
        } 
        <Menu.Item key="changeWallet" title="Change Wallet">
          Change Wallet
          <Link to="/addwallet"></Link>
        </Menu.Item>
        
        <Menu.Item key="logout" >
          <a onClick={logoutHandler}>Logout</a>
        </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    )
  }
}

export default withRouter(RightMenu);

