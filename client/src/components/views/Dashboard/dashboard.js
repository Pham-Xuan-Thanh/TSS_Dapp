import React, { useState} from 'react'
import { FaCode, FaWatehouse, FaServer } from "react-icons/fa";
import { Statistic, Row, Col, Button } from 'antd';
import { useSelector} from "react-redux"
import {UserOutlined, SolutionOutlined } from '@ant-design/icons';
// import { ECIES } from 'hybrid-ecies';
// let ecies = new ECIES()
// const tmp = "04d0be5e8b5d09cbf3f91474f5bb4d2c391727b93f56b738229c220e2334d549132615a1b44901ed5b43ac91fbadebeea1596d6075a336a9c3b8eda92fc83ef76419c30a268fae799daa9a6bef04d736d3d699c704fc404ef130a65d40a5dd22c21283e015cb72cd10c359ede88105dce1a8408bf2eb1d77712282f006f0bf3c4f37ebf43cf1dc2216e00c413e88768f4280d95823b4be0f4d351ca1845891"
// const priv =  "7jczDSiSxs6ZNzQdTT6TydNHgNLKBNLjPWzJ2JHkiX"
function Dashboard() {
    let balance = useSelector( state => state.wallet.balance)
    
    return (
        <>
            <div style={{padding : 30}} >
                {/* <p> {ecies.decryptAES256(priv,tmp)} </p> */}
                {console.log("dashborcc" , balance)}
                {/* <span style={{ fontSize: '2rem' }}>LEW LEW! CON ĐỖ NGHÈO KHỈ --- KHÔNG CÓ CL J CẢ</span><br />
                
                <FaServer style={{ fontSize: '4rem' }} /><br /> */}
                <Row gutter={1}>
                    <Col span={12}>
                        <Statistic title="Active Users" prefix={<UserOutlined />} value={235} loading={balance?.balance === null}/>
                    </Col>
                    <Col span={12}>
                        <Statistic title="Files Owned" prefix={<SolutionOutlined />} value={(balance?.filehashes) ? balance.filehashes.length : 0} loading={balance === null}/>
                    </Col>
                </Row>
            </div>
            {/* <div style={{ float: 'right' }}>Thanks For Using This Boiler Plate by John Ahn</div> */}
        </>
    )
}

export default Dashboard
