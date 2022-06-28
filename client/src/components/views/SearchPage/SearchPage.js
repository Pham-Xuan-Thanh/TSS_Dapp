import React, { useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"
import { Statistic, Popconfirm, Col, Button, Table, Tag, notification, Form, Modal, Space } from 'antd';
import { useLocation } from "react-router-dom";
import { searchList, downloadThesis } from "../../../_actions/thesis_actions"
import { FrownOutlined, GlobalOutlined, DeleteOutlined, EditOutlined, SnippetsOutlined, DownloadOutlined } from '@ant-design/icons';
// import ThesisCreateModal from "../ThesisPage/ThesisModalForm";

function SearchPage(props) {
    const dispatch = useDispatch()
    let thesises = useSelector(state => state.thesises.thesises || {})
    const location = useLocation()
    let noOfThesises = 0
    const query = new URLSearchParams(location.search)

    useMemo(async () => {
        console.log("Hai tay anh dang kiem em o dau", query.get('query'))

        await dispatch(searchList(query.get('query')))
            .then(resp => {
                if (resp.payload.success) {
                    console.log("goiejjfvowefoui", resp.payload)
                    noOfThesises = resp.payload.thesises.length
                }
                else {
                    console.log("Sao k dc v ta", resp.payload)
                }
            })

        
    }, [])


    const handleDownloadChapter = async (thesisID,chapterID) => {
        const res = await downloadThesis(thesisID, chapterID)
            .then((response) => {
                const temp = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = temp;
                console.log(response.headers["content-disposition"].split("\""),)
                link.setAttribute('download', response.headers["content-disposition"].split("\"")[1]); //or any other extension
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
    }

    const thesisColumns = [
        { title: "Name", dataIndex: "article", key: "name" },
        { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Keywords", dataIndex: "keywords", key: "keyword",
            render: keywords => {
                keywords = keywords || []
                return (
                    <>
                        {keywords.map(keyword => {
                            let color = keyword.length > 10 ? 'geekblue' : 'green';
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
        { title: "Author", dataIndex: ["userid","name"], key: "author" },
        { title: "Supervisor", dataIndex: "supervisor", key: "supervisor" }
    ]

    const chapterColumns = [
        { title: "Index", dataIndex: "index", key: "index" ,defaultSortOrder: 'ascend' ,sorter: { compare : (a,b) => a.index - b.index} },
        { title: "Title", dataIndex: "title", key: "title" },
        {
            title: "Download", dataIndex: "ahfoiewhdo", key: "download",
            render: (_, chapters) => {
                return (
                    <Space size="small">
                        <Button icon={<DownloadOutlined />} onClick={() => handleDownloadChapter(chapters.thesisID,chapters._id)} />
                    </Space>
                )
            }
        }
    ]
    return (
        <>
                <h3>{noOfThesises} results found</h3>

            <Table
                columns={thesisColumns}
                dataSource={thesises?.thesises ? thesises.thesises : []}
                expandable={{
                    expandedRowRender: thesis => {
                        thesis.chapters.map( chapter => chapter.thesisID = thesis._id)
                        return <Table 
                                    columns={chapterColumns}
                                    dataSource={thesis.chapters}
                                    rowKey="index" />
                        

                    }
                }}
                rowKey="article"
            >

            </Table>
        </>
    )
}

export default SearchPage
