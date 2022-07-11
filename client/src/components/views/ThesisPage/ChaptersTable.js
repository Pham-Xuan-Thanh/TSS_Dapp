import React, { useState } from 'react'
import { Statistic, Popconfirm, Col, Button, Table, Tag, notification, Progress, Form, Modal, Space, Input, Typography, message } from 'antd';
import { useSelector, useDispatch } from "react-redux"
import { FrownOutlined, DeliveredProcedureOutlined, LoadingOutlined, GlobalOutlined, DeleteOutlined, EditOutlined, SnippetsOutlined, DownloadOutlined } from '@ant-design/icons';
import DocViewer, { DocViewerRenderers } from 'react-doc-viewer';


import { eciesDecrypt } from '../../../helper/ecies';
import { getListTxInp } from '../../../_actions/wallet_action';
import { downloadThesis, editThesis, shareChapterByEmail } from '../../../_actions/thesis_actions';
import { ChapterModal, PublishChapterModal } from './ChapterModal';
// import axios from 'axios';

const ChaptersTable = ({ thesisID }) => {
    let thesis = useSelector(state => state.thesises.thesises.thesises.filter(thesis => thesis._id === thesisID)[0] || {})
    const dispatch = useDispatch()
    const [visibleChapterModal, setVisibleChapterModal] = useState(false)
    const [visiblePreviewModal, setVisiblePreviewModal] = useState(false)
    const [propsPreview, setPropsPreview] = useState({})
    const [chapterIDModal, setChapterIDModal] = useState(-1)
    const [publishModal, setPublishModal] = useState(false)
    const dataChapterModal = thesis
    const [form] = Form.useForm()
    const [form1] = Form.useForm()
    const [form2] = Form.useForm()

    const handlePreviewChapter = async (values, chapter) => {
        handleGetChapter(values, chapter)
            .then(resp => {
                setPropsPreview({
                    documents: [{
                        fileData: resp.data || "No thing to loading",
                        fileType: resp.headers["content-type"] || "text/plain"

                    }]
                }); console.log("PREVIWE", resp.data)
                setVisiblePreviewModal(true)
            })


    }

    const handleDownloadChapter = (values, chapter) => {
        handleGetChapter(values, chapter)
            .then((response) => {
                const tmp = new Blob([response.data]);
                const temp = window.URL.createObjectURL(tmp);
                const link = document.createElement('a');
                link.href = temp;
                console.log(response.headers["content-disposition"].split("\""),)
                link.setAttribute('download', response.headers["content-disposition"].split("\"")[1]); //or any other extension
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(err => console.log("chac do k  co  file hash enc", err))
    }
    const handleGetChapter = (values, chapter) => {
        return new Promise((res, rej) => {
            if (chapter.filehash_enc) {
                eciesDecrypt(values.priv_key, chapter.filehash_enc)
                    .then(filehash => {
                        downloadThesis(thesisID, chapter._id, { filehash })
                            .then(resp => {

                                if (!resp.headers["content-disposition"] || (typeof resp.data.success !== "undefined" && resp.data.success === false)) {
                                    message.error("We cant find your chapter in out network !!! Make sure you uploaded or published this")
                                    rej(new Error("Cant find your file"))
                                }
                                else {
                                    return res(resp)
                                }
                            })
                            .catch(err => rej(err))

                    })
            } else {
                downloadThesis(thesisID, chapter._id)
                    .then(resp => {
                        console.log("so anhsa e n :", resp.headers["content-disposition"], typeof resp.data.success !== "undefined", resp.data.success === false)
                        if (!resp.headers["content-disposition"] || (typeof resp.data.success !== "undefined" && resp.data.success === false)) {

                            message.error("We cant find your chapter in out network !!! Make sure you uploaded or published this")
                            rej(new Error("Cant find your file"))
                        }
                        else {
                            res(resp)
                        }
                    })
                    .catch(err => rej(err))

            }
        }).then(res => {
            console.log("xui vl  :", res)
            return res
        })







    }
    
    const handleEditChapter = (chapterID) => {
        console.log("edit r ne`")
        setChapterIDModal(chapterID)
        setVisibleChapterModal(true)

    }
    const handleShareChapter = (values, chapterID) => {
        dispatch(shareChapterByEmail(thesisID, chapterID, values))
            .then(resp => console.log("share ne : ", resp))
            .catch(err => console.log("error rrorr ", err))
    }
    const handleDeleteChapter = (chapterID) => {
        console.log("De le te chap to")
        var thesisToSubmit = thesis
        thesisToSubmit.chapters = thesis.chapters.filter(chapter => chapter._id !== chapterID)
        dispatch(editThesis({ ...thesis, userid: localStorage.getItem("userId") }))
    }
    const handleCreateChapter = () => {
        console.log("CREATE CHUA")
        setChapterIDModal(-1)
        setVisibleChapterModal(true)
    }
    const handlePubishChapter = (chapterID) => {
        setChapterIDModal(chapterID)
        dispatch(getListTxInp())
        setPublishModal(true)
        console.log("Pub lish ne he")
    }
    const columnsChapter = [
        { title: "Chapter ID", dataIndex: "index", key: "index", defaultSortOrder: 'ascend', sorter: { compare: (a, b) => a.index - b.index }, },

        { title: "Title", dataIndex: "title", key: "title" },
        {
            title: "Action", dataIndex: "abc",
            render: (_, chapters) => {
                var chapter = thesis.chapters.filter(chapter => chapter._id === chapters._id)[0];
                var statusFile
                if (!chapter.filehash_enc) {
                    statusFile = <Tag color="red">!Not Published</Tag>
                } else {
                    if (!chapter.isPublish || !(chapter.publishat && chapter.expiredAt)) {
                        statusFile = <Tag icon={<LoadingOutlined />} color="processing" >Pending</Tag>
                    } else {
                        var percent = Math.round((Date.now() - chapter.publishat) * 5 / (chapter.expiredAt - chapter.publishat)) * 20
                        console.log("perveng " , (Date.now() - chapter.publishat) , (chapter.expiredAt - chapter.publishat) ) 
                        percent = Math.min( Math.max(1,percent) , 99)
                        statusFile = <Progress  strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }} percent={percent}  type="circle" width={35}></Progress>
                    }
                }
                return (
                    <>
                        <Space style={{ float: "left" }} size="small">
                            <Popconfirm
                                cancelButtonProps={{ style: { visibility: "hidden" } }}
                                onConfirm={() => { ; form2.submit() }}
                                title={<>
                                    <Typography.Title level={5}>Please enter your private to RETRIEVE from our Network</Typography.Title>
                                    <Form
                                        form={form2}
                                        onFinish={(values) => handlePreviewChapter(values, chapters)}
                                        autoComplete="off"
                                    >
                                        <Form.Item
                                            label="Private Key"
                                            name="priv_key"
                                            rules={[
                                                {
                                                    required: true,
                                                    max: 44,
                                                    message: 'Please input your Private Key!',
                                                },
                                            ]}
                                        >
                                            <Input.Password />
                                        </Form.Item>
                                    </Form>
                                </>}
                            >
                                <Button icon={<SnippetsOutlined />} disabled={(chapter.filehash || chapter.filepath || (chapter.filehash_enc && chapter.isPublish)) ? false : true} />
                            </Popconfirm>
                            <Popconfirm
                                cancelButtonProps={{ style: { visibility: "hidden" } }}
                                onConfirm={() => { ; form1.submit() }}
                                title={<>
                                    <Typography.Title level={5}>Please enter your private to RETRIEVE from out Network</Typography.Title>
                                    <Form
                                        form={form1}
                                        onFinish={(values) => handleDownloadChapter(values, chapters)}
                                        autoComplete="off"
                                    >
                                        <Form.Item
                                            label="Private Key"
                                            name="priv_key"
                                            rules={[
                                                {
                                                    required: true,
                                                    max: 44,
                                                    message: 'Please input your  Private Key!',
                                                },
                                            ]}
                                        >
                                            <Input.Password />
                                        </Form.Item>
                                    </Form>
                                </>}
                            >
                                <Button icon={<DownloadOutlined />} disabled={(chapter.filehash || chapter.filepath || (chapter.filehash_enc && chapter.isPublish)) ? false : true} />

                            </Popconfirm>
                            <Button icon={<EditOutlined />} onClick={() => handleEditChapter(chapters._id)} />
                            <Popconfirm
                                title="You can't be refunded! You can access through filehash! Are you sure?"
                                onConfirm={() => handleDeleteChapter(chapters._id)}>
                                <Button icon={<DeleteOutlined />} />
                            </Popconfirm>
                            <Button icon={<GlobalOutlined />} onClick={() => handlePubishChapter(chapters._id)} ></Button>
                            <Popconfirm
                                okButtonProps={{ htmlType: "submit" }}
                                cancelButtonProps={{ style: { visibility: "hidden" } }}
                                onConfirm={() => { ; form.submit() }}
                                title={<>
                                    <Typography.Title level={3}>Share File with email</Typography.Title>
                                    <Form
                                        form={form}
                                        onFinish={(values) => handleShareChapter(values, chapters._id)}
                                        autoComplete="off"
                                    >
                                        <Form.Item
                                            label="Private Key"
                                            name="priv_key"
                                            rules={[
                                                {
                                                    required: true,
                                                    max: 44,
                                                    message: 'Please input your Private Key!',
                                                },
                                            ]}
                                        >
                                            <Input.Password />
                                        </Form.Item>

                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please input your email!',

                                                },
                                            ]}
                                        >
                                            <Input />
                                        </Form.Item>
                                        {/* <Form.Item>
                                            <Button type="primary" htmlType="submit">
                                                Submit
                                            </Button>
                                        </Form.Item> */}
                                    </Form>
                                </>}
                            >
                                <Button icon={<DeliveredProcedureOutlined />} onClick={() => setTimeout(() => console.log("argegaergsergsrhsth"), 2000)} />
                            </Popconfirm>
                        </Space>
                        <div style={{ float: "right" }} >
                            {statusFile}

                        </div>

                    </>
                )
            }
        }
    ]

    const ChaptersTableTitile = () => {
        return (
            <>
                <h4 style={{ float: 'left' }}>List of Chapters </h4>
                <Button style={{ float: 'right' }} type='primary' onClick={() => { handleCreateChapter() }}>Create</Button>


            </>
        )
    }
    return (
        <>
            {/* {console.log("CHAS TABLE", thesises.thesises.filter(thesis => thesis._id === props.thesisID)[0].chapters,dataChapterModal)} */}
            <div style={{ width: '100%' }} >
                <Modal
                    width={"100rem"}
                    visible={visiblePreviewModal}
                    title="Preview"
                    footer={[<Button key="BACK" onClick={() => setVisiblePreviewModal(false)} type="primary"  >Return </Button>]}
                    onCancel={() => setVisiblePreviewModal(false)}
                    onOk={() => setVisiblePreviewModal(false)}
                >
                    <DocViewer
                        pluginRenderers={DocViewerRenderers}
                        config={{ header: { disableFileName: false, retainURLParams: false } }}
                        {...propsPreview}></DocViewer>
                </Modal>
                <Modal

                >

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
            <Table style={{ paddingLeft: 50 }}
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