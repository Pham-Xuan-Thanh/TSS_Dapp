import React, {useState} from 'react'
import { Statistic, Popconfirm, Col, Button, Table, Tag, notification, Form, Modal, Space } from 'antd';
import { useSelector, useDispatch } from "react-redux"
import { FrownOutlined, GlobalOutlined, DeleteOutlined, EditOutlined, SnippetsOutlined , DownloadOutlined } from '@ant-design/icons';
import DocViewer, {DocViewerRenderers} from 'react-doc-viewer';

import { downloadThesis, editThesis } from '../../../_actions/thesis_actions';
import {ChapterModal, PublishChapterModal } from './ChapterModal';
// import axios from 'axios';

const ChaptersTable = ({thesisID}) => {
    let thesis = useSelector(state => state.thesises.thesises.thesises.filter(thesis => thesis._id === thesisID)[0] || {})
    const dispatch = useDispatch() 
    const [visibleChapterModal , setVisibleChapterModal] = useState(false)
    const [visiblePreviewModal , setVisiblePreviewModal] = useState(false)
    const [propsPreview , setPropsPreview] = useState({})
    const [chapterIDModal , setChapterIDModal] = useState(-1)
    const [publishModal , setPublishModal] = useState(false)
    const dataChapterModal  = thesis

    const handlePreviewChapter = async (chapterID) => {
        const res = await downloadThesis(thesisID , chapterID)
            .then( resp => resp)
            .then( resp =>{ setPropsPreview({
                documents : [{
                    fileData: resp.data || "No thing to loading",
                    fileType :  resp.headers["content-type"] || "text/plain"
                
            }]
        }); console.log("PREVIWE", resp.data)})

        setVisiblePreviewModal(true)
        
    }
    const handleDownloadChapter = async (chapterID) => {
        const res = await downloadThesis(thesisID, chapterID)
        .then((response) => {
            const temp = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = temp;
            console.log(response.headers["content-disposition"].split("\""), )
            link.setAttribute('download',response.headers["content-disposition"].split("\"")[1]); //or any other extension
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    

    }
    const handleEditChapter = (chapterID) => {
        console.log("edit r ne`")
        setChapterIDModal(chapterID)
        setVisibleChapterModal(true)

    }
    const handleDeleteChapter = (chapterID) => {
        console.log("De le te chap to")
        var thesisToSubmit =  thesis
        thesisToSubmit.chapters =  thesis.chapters.filter(chapter => chapter._id !== chapterID )
        dispatch(editThesis({...thesis , userid : localStorage.getItem("userId")}))
    }
    const handleCreateChapter= () => {
        console.log("CREATE CHUA")
        setChapterIDModal(-1)
        setVisibleChapterModal(true)
    }
    const handlePubishChapter = (chapterID) => {
        setChapterIDModal(chapterID)
        setPublishModal(true)
        console.log("Pub lish ne he")
    }
    const columnsChapter = [
        { title: "Chapter ID", dataIndex: "index", key: "index" ,defaultSortOrder: 'ascend' ,sorter: { compare : (a,b) => a.index - b.index}, },

        { title: "Title", dataIndex: "title", key: "title" },
        {
            title: "Action", dataIndex: "abc",
            render: (_, chapters) => {
                var chapter = thesis.chapters.filter(chapter => chapter._id === chapters._id)[0];
                return (
                    <Space size="small">
                        <Button icon={<SnippetsOutlined />} onClick={ () => handlePreviewChapter(chapters._id)} disabled={(chapter.filehash || chapter.filepath) ? false : true}/>                           
                        <Button icon={<DownloadOutlined />} onClick={ () => handleDownloadChapter(chapters._id)} disabled={(chapter.filehash || chapter.filepath) ? false : true}/>
                        <Button icon={<EditOutlined />} onClick={() => handleEditChapter(chapters._id)} />
                        <Popconfirm
                            title="You can't be refunded! You can access through filehash! Are you sure?"
                            onConfirm={() => handleDeleteChapter(chapters._id)}>
                            <Button icon={<DeleteOutlined />} />
                        </Popconfirm>
                        <Button icon={<GlobalOutlined />} onClick={() => handlePubishChapter(chapters._id)} disabled={(chapter.isPublish)}></Button>
                    </Space>
                )
            }
        }
    ]

    const ChaptersTableTitile = () => {
        return (
            <>
            <h4 style={{ float: 'left' }}>List of Chapters </h4>
            <Button style={{ float: 'right' }} type='primary' onClick={() => {handleCreateChapter()}}>Create</Button>


            </>
        )
    }
    return (
            <>
            {/* {console.log("CHAS TABLE", thesises.thesises.filter(thesis => thesis._id === props.thesisID)[0].chapters,dataChapterModal)} */}
            <div style={{width : '100%'}} >

            <Modal 
                width={"100rem"}
                visible={visiblePreviewModal}
                title="Preview"
                footer={[<Button key="BACK" onClick={() => setVisiblePreviewModal(false)} type="primary"  >Return </Button>]}
                onCancel={ () => setVisiblePreviewModal(false)}
                onOk={ () => setVisiblePreviewModal(false)}
            >
                    <DocViewer   
                    pluginRenderers={DocViewerRenderers}
                    config={{header: {disableFileName: false, retainURLParams :false}}}
                    {...propsPreview}></DocViewer>
            </Modal>
            </div>
            <PublishChapterModal
                visible={publishModal}
                setVisible={setPublishModal}
                dataCommitted={dataChapterModal}
                chapterID={chapterIDModal}>

            </PublishChapterModal>
            <ChapterModal 
                visible={visibleChapterModal}
                setVisible={setVisibleChapterModal}
                // onCancle={() => {setVisibleChapterModal(false) ; console("CANCLE NE")}}
                dataCommitted={dataChapterModal}
                chapterID={chapterIDModal}></ChapterModal>
            <Table  style={{paddingLeft : 50  }}
            title={ChaptersTableTitile}
            columns={columnsChapter} 
            dataSource={thesis.chapters}
            pagination={false}
            rowKey="_id"
            
            >
            
            </Table>
            </>)
}

export default ChaptersTable