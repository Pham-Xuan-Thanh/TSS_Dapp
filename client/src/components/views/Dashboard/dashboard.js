import React, { useState} from 'react'
import { FaCode, FaWatehouse, FaServer } from "react-icons/fa";
import { Statistic, Row, Col, Button } from 'antd';
import { useSelector} from "react-redux"
import {UserOutlined, SolutionOutlined } from '@ant-design/icons';
function Dashboard() {
    let balance = useSelector( state => state.wallet)
    
    return (
        <>
            <div style={{padding : 30}} >
                {/* <span style={{ fontSize: '2rem' }}>LEW LEW! CON ĐỖ NGHÈO KHỈ --- KHÔNG CÓ CL J CẢ</span><br />

                <FaServer style={{ fontSize: '4rem' }} /><br /> */}
                <Row gutter={1}>
                    <Col span={12}>
                        <Statistic title="Active Users" prefix={<UserOutlined />} value={235} loading={balance?.balance === null}/>
                    </Col>
                    <Col span={12}>
                        <Statistic title="Files Owned" prefix={<SolutionOutlined />} value={(balance?.balance) ? balance.balance.filehashes.length : 0} loading={balance?.balance === null}/>
                    </Col>
                </Row>
            </div>
            {/* <div style={{ float: 'right' }}>Thanks For Using This Boiler Plate by John Ahn</div> */}
        </>
    )
}

export default Dashboard
