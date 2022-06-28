import React, { useState, useMemo } from 'react'
// import { FaCode, FaWatehouse, FaServer } from "react-icons/fa";
import { Statistic, Popconfirm, Col, Button, Table, Tag, notification, Form, Modal, Space } from 'antd';
import { useSelector, useDispatch } from "react-redux"
import { FrownOutlined, SolutionOutlined, DeleteOutlined, EditOutlined, SnippetsOutlined, DownloadOutlined } from '@ant-design/icons';

import { createThesis, listThesises, deleteThesis, editThesis } from '../../../_actions/thesis_actions';
import ThesisCreateModal from './ThesisModalForm';
import ChaptersTable from './ChaptersTable';




function Thesis({ user }) {
    let balance = useSelector(state => state.wallet)
    let thesises = useSelector(state => state.thesises.thesises || {})
    const dispatch = useDispatch()
    // const [visibleCreateThesis, setVisibleCreateThesis] = useState(false)
    const [visibleModal, setVisibleModal] = useState(false)
    const [dataModal, setDataModal] = useState({ studentID: user.studentID } || {})
    const [dispatchModal, setDispatchModal] = useState()
    useMemo(async () => {
        await dispatch(listThesises())
            .then(resp => {
                console.log("MEMO", resp.payload)

                return resp.payload
            })

    }, [])
    
    const columns = [
        { title: "Name", dataIndex: "article", key: "article" },
        { title: "Student ID", dataIndex: "studentID", key: "sid" },
        {
            title: "Keywords", dataIndex: "keywords", key: "keywords",
            render: keywords => {
                keywords = keywords || []
                return (
                    <>
                        {keywords.map(keyword => {
                            let color = keyword.length > 5 ? 'geekblue' : 'green';
                            if (keyword === 'loser') {
                                color = 'volcano';
                            }
                            return (
                                <Tag color={color} key={keyword}>
                                    {keyword.toUpperCase()}
                                </Tag>
                            );
                        })}
                    </>
                )
            }
        },
        { title: "Supervisor", dataIndex: "supervisor", key: "supervisor" },
        {
            title: "Action", dataIndex: "av ascasdasd",
            render: (_, record) => {
                return (
                    <>
                        <Button icon={<EditOutlined />} onClick={() => handleEditThesis(record._id)} />
                        <Popconfirm
                            title="Are you sure?"
                            onConfirm={() => handleDeleteThesis(record._id)}>
                            <Button icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </>
                )
            }
        }
    ]
    const handleCreateThesis = () => {
        setVisibleModal(true)
        setDataModal({ studentID: document.cookie.split("; ").find(row => row.startsWith('studentID=')).split("=")[1] })
        setDispatchModal(() => (inpData) => createThesis(inpData))
    }
    function TableTitle() {
        return (
            <>
                <h3 style={{ float: 'left' }}>List of Theses </h3>
                <Button style={{ float: 'right' }} type='primary' onClick={handleCreateThesis}>Create</Button>


            </>
        )
    }

    const handleEditThesis = async (thesisID) => {
        var thesistoEdit = thesises.thesises.filter(thesis => thesis._id === thesisID)[0]
        setVisibleModal(true)
        setDataModal(thesistoEdit)
        setDispatchModal(() => (edited) => editThesis(edited))
    }

    const handleDeleteThesis = async (thesisID) => {

        await dispatch(deleteThesis(thesisID))
            .then(resp => {
                console.log("delete", resp)
                if (!resp.payload.success) {
                    notification['error']({
                        message: "DELETE ERROR",
                        description: "Unexpected error occur when processing",
                        icon: <FrownOutlined style={{ color: "#db045e" }} />
                    })
                }
            })

    }


    return (
        <>
            <div style={{ padding: 15 }} >

                {/* <span style={{ fontSize: '2rem' }}>LEW LEW! CON ĐỖ NGHÈO KHỈ --- KHÔNG CÓ CL J CẢ</span><br />
                
                <FaServer style={{ fontSize: '4rem' }} /><br /> */}
                <Statistic title="Files Owned" prefix={<SolutionOutlined />} value={(balance?.balance?.filehashes) ? balance.balance.filehashes.length : 0} loading={balance?.balance === null} />
                <br />
                <ThesisCreateModal
                    visible={visibleModal}
                    setVisible={setVisibleModal}
                    onCancel={() => { setVisibleModal(false) }}
                    dataCommitted={dataModal}
                    dispatchAction={dispatchModal} />
                <Table
                    title={TableTitle}
                    columns={columns}
                    dataSource={(thesises?.thesises) ? thesises.thesises : []}
                    expandable={{
                        expandedRowRender: thesis => <ChaptersTable thesisID={thesis._id} ></ChaptersTable>
                    }}
                    rowKey="article"
                >

                </Table>

            </div>
            {/* <div style={{ float: 'right' }}>Thanks For Using This Boiler Plate by John Ahn</div> */}
        </>
    )
}

export default Thesis