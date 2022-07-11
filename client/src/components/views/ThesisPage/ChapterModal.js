import React, { useRef, useState ,useMemo } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import axios from "axios"
import { editThesis, publishChapter, pushChapter2IPFS } from '../../../_actions/thesis_actions';
import { createPublishTransaction } from '../../../_actions/transaction_actions';
import Icon, { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Tabs, Form, Input, Modal, Tag, Progress, Upload, message, Card, Tooltip, Typography, Checkbox, Select, Space, Divider } from 'antd';
import { useSelector } from "react-redux"

// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const { TabPane } = Tabs
const { Option } = Select


// const { Title } = Typography;
const { TextArea } = Input;

let fileUploadpath, fileExtension, fileSize

const ChapterModal = ({ visible, setVisible, dataCommitted, chapterID }) => {
    const formikRef = useRef()
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const [selectedFile, setSelectedFile] = useState(null)
    const [progress, setProgress] = useState(0);
    const [editorState, setEditorState] = useState()
    const uploaded = useRef(false)
    const uploadmethod = useRef(true)


    const handleUpload = async (file) => {
        // const { onProgress } = options;
        const formData = new FormData
        const config = {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                const percent = Math.floor((event.loaded / event.total) * 100);
                setProgress(percent);
                if (percent === 100) {
                    setTimeout(() => setProgress(0), 1000);
                }
                setProgress({ percent: (event.loaded / event.total) * 100 });
            },
        };

        formData.append('chapter', file);

        // console.log("SLESA FILE", selectedFile)
        const request = await axios.post(
            '/api/thesis/chapter/upload',
            formData,
            config
        ).then(resp => resp.data)
        // .catch(err => console.log("catacupload",  err))

        return request
    }

    const uploadProps = {
        accept: ".doc,.docx,.pdf,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        beforeUpload: (file) => {
            if (file.type != "application/pdf" &&
                file.type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
                file.type != "application/msword" && file.size < 10 * 1024 * 1024) {
                message.error(`${file.name} is not allowed to upload!!! Check again`)
                return Upload.LIST_IGNORE
            }
            return false


        },
        maxCount: 1,

        onChange: (file, filelist, event) => { setSelectedFile(file) },
        withCredentials: true

    }
    // const user = useSelector( state => state.user)

    return (
        <>

            <Modal
                visible={visible}
                title="Create a new Chapter"
                okText="Create"
                cancelText="Cancle"
                destroyOnClose={true}
                getContainer={false}
                onCancel={() => { setVisible(false); setSelectedFile(null) }}
                onOk={async () => {
                    var fileTyped
                    if (!uploadmethod.current) {

                        fileTyped = new File([new Blob([editorState])], `${URL.createObjectURL(new Blob())}.txt`, { type: "text/plain", lastModified: new Date().getTime(), })

                        console.log("Mot nguoi tung thuong nhieu the ,roi cung hoa nguoi dung", selectedFile)

                    } else {
                        fileTyped = selectedFile ? selectedFile.file : null
                    }

                    await handleUpload(fileTyped)
                        .then(resp => { console.log("BO anh hut rat nhieu thuoc", resp); uploaded.current = true; fileExtension = resp.originalname.split(".").slice(-1)[0]; fileUploadpath = resp.path; fileSize = resp.size; console.log("aaaaa", resp, fileSize) })
                        .catch(err => { console.log("Me anh mat khoc le nhoa`", err); fileUploadpath = ""; fileExtension = "txt"; fileSize = 0 })
                    // console.log("TRONG MODAL", form.getFieldsValue(true))
                    // onCreate(form.getFieldsValue(true))
                    // form.resetFields();
                    if (formikRef.current) formikRef.current.handleSubmit()
                    if (uploaded) { { message.success("File will store until you logout"); setVisible(false); setSelectedFile(null); setEditorState("") } } else { return message.warning("You must UPLOAD file to submit") }
                    console.log("Ngay buon thang nho nam thuong", fileTyped, selectedFile)

                }}
            >
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        studentID: dataCommitted.studentID || -1,
                        title: dataCommitted?.chapters.filter(chapter => chapter._id === chapterID)[0]?.title || "",
                        index: dataCommitted?.chapters.filter(chapter => chapter._id === chapterID)[0]?.index || 0,
                        description: dataCommitted?.chapters.filter(chapter => chapter._id === chapterID)[0]?.description || "",
                        editor: editorState || "",
                    }}
                    validationSchema={Yup.object().shape({
                        studentID: Yup.number().required("Empty?"),
                        title: Yup.string().required("Title is required"),
                        index: Yup.number("Just a number").required("Index is require"),
                        // chapters: Yup.mixed()
                        //                 .test("fileSiza","File size too LARGE to upload!! size <5MB", (value)=> {
                        //                     if ( value && value?.length > 0) {
                        //                         for ( let i = 0 ; i < value.length ;  i++) {
                        //                             if ( value[i] > 5242880) {
                        //                                 return false 
                        //                             }
                        //                         }
                        //                     }
                        //                     return true
                        //                 })
                        //                 .test("fileType","Unsupported File formart :< only .pdf, .doc, .docx", (value) => {
                        //                     if (value && value?.length > 0) {
                        //                         for (let i = 0; i < value.length ; i++) {
                        //                             if (value[i].type != "application/pdf" &&
                        //                                 value[i].type != "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
                        //                                 value[i].type != "application/msword" ) {
                        //                                     return false
                        //                                 }
                        //                         }
                        //                     }
                        //                     return true
                        //                 }),
                        description: Yup.string(),


                    })}

                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            let dataToSubmit = {
                                studentID: dataCommitted.studentID,
                                article: dataCommitted.article,
                                keywords: dataCommitted.keywords,
                                supervisor: dataCommitted.supervisor,
                                description: dataCommitted.description,
                                userid: localStorage.getItem("userId"),
                                chapters: dataCommitted.chapters,
                                _id: dataCommitted._id
                            }

                            dataToSubmit.chapters = [...dataToSubmit.chapters?.filter(chapter => chapter._id !== chapterID), {
                                title: values.title,
                                description: values.description, index: values.index, filepath: fileUploadpath, fileextension: fileExtension, size: fileSize, isPublish: false
                            }]
                            dispatch(editThesis(dataToSubmit))

                            // .then(resp => {
                            //     if (resp.payload.success) {
                            //         message.success("Submit successfully")
                            //     } else {
                            //         message.error("Submit failed")
                            //     }
                            // }

                            // )
                            setSubmitting(false);
                        }, 300)
                    }}
                >
                    {props => {
                        const {
                            values,
                            touched,
                            errors,
                            dirty,
                            isSubmitting,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            handleReset,
                        } = props;

                        return (
                            <div    >

                                {/* <Title level={2}> Create New Thesis </Title> */}
                                <Form form={form} onSubmit={handleSubmit}>
                                    <Form.Item required label="Student ID">
                                        <Input
                                            id="studentID"
                                            placeholder="Enter your Student ID"
                                            type="text"
                                            value={values.studentID}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={dataCommitted.studentID}
                                            className={
                                                errors.studentID && touched.studentID ? 'text-input error' : 'text-input'
                                            }
                                        />
                                        {errors.studentID && touched.studentID && (
                                            <div className="input-feedback">{errors.studentID}</div>
                                        )}
                                    </Form.Item>
                                    <Form.Item required label="Title">
                                        <Input
                                            id="title"
                                            placeholder="Enter your Title"
                                            type="text"
                                            value={values.title}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={
                                                errors.title && touched.title ? 'text-input error' : 'text-input'
                                            }
                                        />
                                        {errors.title && touched.title && (
                                            <div className="input-feedback">{errors.title}</div>
                                        )}
                                    </Form.Item>
                                    <Form.Item required label="Index">
                                        <Input
                                            id="index"
                                            placeholder="Enter your Index"
                                            type="text"
                                            value={values.index}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={
                                                errors.index && touched.index ? 'text-input error' : 'text-input'
                                            }
                                        />
                                        {errors.index && touched.index && (
                                            <div className="input-feedback">{errors.index}</div>
                                        )}
                                    </Form.Item>
                                    <Form.Item required >
                                        <Tabs onChange={(key) => {
                                            if (key === "upload") uploadmethod.current = true; else uploadmethod.current = false
                                        }}>
                                            <TabPane tab="Upload" key="upload" >
                                                <Upload.Dragger name='chapter'
                                                    {...uploadProps}
                                                    defaultFileList={selectedFile}


                                                >{selectedFile ? null : <div>Upload <span><h5>.doc, .docx, .pdf</h5></span></div>}</Upload.Dragger>
                                                {progress > 0 ? <Progress percent={progress} /> : null}
                                            </TabPane>
                                            <TabPane tab="Editor" key="editor" >
                                                <TextArea
                                                    id="editor"

                                                    placeholder="Type your document here"
                                                    type="text"
                                                    value={editorState}
                                                    onChange={(e) => { setEditorState(e.target.value) }}
                                                    onBlur={handleBlur}
                                                    autoSize={{ minRows: 2, maxRows: 3 }}
                                                    className={
                                                        errors.editor && touched.editor ? 'text-input error' : 'text-input'
                                                    }
                                                />
                                                {errors.editor && touched.editor && (
                                                    <div className="input-feedback">{errors.editor}</div>
                                                )}
                                            </TabPane>
                                        </Tabs>
                                    </Form.Item>

                                    <Form.Item required label="Description">
                                        <TextArea
                                            id="description"

                                            placeholder="Enter Thesis Decription"
                                            type="text"
                                            value={values.description}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            autoSize={{ minRows: 2, maxRows: 3 }}
                                            className={
                                                errors.description && touched.description ? 'text-input error' : 'text-input'
                                            }
                                        />
                                        {errors.description && touched.description && (
                                            <div className="input-feedback">{errors.description}</div>
                                        )}
                                    </Form.Item>




                                </Form>
                            </div>
                        )
                    }}
                </Formik>
            </Modal>
        </>
    )

}


const PublishChapterModal = ({ visible, setVisible, dataCommitted, chapterID }) => {

    const wallet = useSelector(state => state.user.userData)
    const formikRef = useRef()

    const [form] = Form.useForm()
    const dispatch = useDispatch()
    // useMemo( () => {
       

        

    // }, [])
    var options = useSelector(state => state.wallet.tx_inps) ||  []

   
    const [isPublish, setIsPublish] = useState(true)
    const [choseTxInps, setChoseTxInps] = useState([])

    var chapter = dataCommitted.chapters?.filter(chapter => chapter._id === chapterID)[0] || {}
    var publishFee = Math.max(Math.round(chapter.size / 1024 / 1024 / 1024 * 1000), 1)
    const [listEmail, setListEmail] = useState([])
    let index = 0
    // options = [
    //     {
    //         "tx_id": "ddd0951b7e30efcd613f857b546e6ff1339c9772f028ada067f2d3ce86382d3f",
    //         "vout": 0,
    //         "value": 2
    //     },
    //     {
    //         "tx_id": "1aa30516947c304c8ca257659a07b8e0db1f4ba1e877ff4e50d112a120654ad1",
    //         "vout": 0,
    //         "value": 8
    //     },
    //     {
    //         "tx_id": "68c59915c0e88342505d99617a5296675dfb92e6bbf507230a9bc541265ffc77",
    //         "vout": 0,
    //         "value": 2
    //     },
    //     {
    //         "tx_id": "86f5760de5682011f2478105db8b203db87058d568012ec844c80fe2ca9f125b",
    //         "vout": 0,
    //         "value": 10
    //     },
    //     {
    //         "tx_id": "88b115d9a4fb5b9a4d7bd3891a4d5528548bb799b6ab92e9eae7f53dd48e9105",
    //         "vout": 0,
    //         "value": 10
    //     },
    //     {
    //         "tx_id": "8c35acfe213c87e24d745b6c014df082e5fdeb20c59f21bfc36f231af492504c",
    //         "vout": 0,
    //         "value": 2
    //     }
    // ]
    const TotlaFee = () => {
        var sum = 0
        options.map(option => {
            if (choseTxInps.includes(option.tx_id))
                sum += option.value
        })
        return sum
    }
    const GetTxinps = () => {
        return options.filter(option => choseTxInps.includes(option.tx_id))
    }
    var isAcceptable = (TotlaFee() >= publishFee)

    const TXinpProps = {
        mode: 'multiple',
        style: {
            width: '100%',
        },
        value: choseTxInps,
        // filterOption : true,
        // optionFilterProp : "key" ,
        onChange: (newValue, options) => {
            setChoseTxInps(newValue);
        },
        placeholder: 'Select Item...',
        maxTagCount: 'responsive',
    };


    const SelectAllowUser = ({ listEmail, setListEmail }) => {
        const [items, setItems] = useState(listEmail || []);
        const [name, setName] = useState('');
        const onNameChange = (event) => {
            setName(event.target.value);
        };

        const addItem = (e) => {
            e.preventDefault();
            setItems([...items, name || `New item ${index++}`]);
            setListEmail(items)
            setName('');
        };

        return (
            <Select
                style={{
                    width: 300,
                }}
                placeholder="Please Enter User Allowed Address"
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        <Divider
                            style={{
                                margin: '8px 0',
                            }}
                        />
                        <Space
                            align="center"
                            style={{
                                padding: '0 8px 4px',
                            }}
                        >
                            <Input placeholder="Please enter Address" value={name} type="text" onChange={onNameChange} />
                            <Typography.Link
                                onClick={addItem}
                                style={{
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <PlusOutlined /> Add User
                            </Typography.Link>
                        </Space>
                    </>
                )}
            >
                {items.map((item) => (
                    <Option key={item}>{item}</Option>
                ))}
            </Select>
        );

    }
    // console.log("cccc", isPublish , isAcceptable)
    return (
        <>

            <Modal
                visible={visible}
                title="Publish File to Network"
                okButtonProps={{ disabled: !(isAcceptable || !isPublish) }}
                okText={(isPublish) ? "Publish" : "Send"}
                cancelText="Cancle"
                destroyOnClose={true}
                getContainer={false}
                onCancel={() => { setVisible(false); }}
                onOk={async () => {

                    if (formikRef.current) formikRef.current.handleSubmit()
                    setVisible(false)
                    setChoseTxInps([])

                }}
            >
                <Formik
                    innerRef={formikRef}
                    initialValues={{
                        password: ""
                    }}
                    validationSchema={Yup.object().shape({
                        password: Yup.string(),
                        allowUsers: Yup.array().of(Yup.string().email("Email is invalid"))


                    })}

                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {


                            let dataToSubmit = {
                                password: values.password,
                                listAllowedPublicKey: listEmail || [],
                                listTxInps : GetTxinps()
                            }

                            if (isPublish) {
                                dataToSubmit.amount = publishFee
                                dataToSubmit.totalfee = TotlaFee()
                                dataToSubmit.ownerAddress = wallet.address 
                                dataToSubmit.ownerPublicKey = wallet.pub_key
                                dispatch(pushChapter2IPFS(dataCommitted._id, chapterID, true))
                                    .then( response => {
                                        if (response.payload.success) {
                                            dataToSubmit.ipfs_hash = response.payload.ipfshash
                                            console.log("Data to trc khi tao transaction:" , dataToSubmit)
                                            dataToSubmit = createPublishTransaction(dataToSubmit)
                                            console.log("data TO cmmit sau tao tx: " , JSON.stringify( dataToSubmit))
                                            dispatch(publishChapter(dataCommitted._id, chapterID,dataToSubmit))
                                        } else {
                                            console.log("else" , response.payload)
                                            message.error("Cant add file to IPFS network !!! Confirm your file stable in database")
                                            setVisible(false)
                                        }
                                    })
                                    .catch( err => console.log("sui seo la :" , err))
                            } else {

                                dispatch(pushChapter2IPFS(dataCommitted._id, chapterID))
                                    .then(resp => {
                                        console.log("every thing we need is:", resp.payload)
                                        if (resp.payload.notListDB) return message.error("Cannt Retrieve from DB")
                                        if (resp.payload.notExist) return message.error("Upload file to push file")
                                        if (resp.payload.notsend2IPFS) return message.error("Cannt send file to IPFS")
                                        if (resp.payload.notUpdate) return message.error("Cannt update to Database ")
                                        setVisible(false)
                                    })

                                console.log("cc ne", dataToSubmit)
                            }

                            // .then(resp => {
                            //     if (resp.payload.success) {
                            //         message.success("Submit successfully")
                            //     } else {
                            //         message.error("Submit failed")
                            //     }
                            // }

                            // )
                            setSubmitting(false);
                        }, 300)
                    }}
                >
                    {props => {
                        const {
                            values,
                            touched,
                            errors,
                            dirty,
                            isSubmitting,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            handleReset,
                        } = props;

                        return (
                            <div    >
                                <Card title="Publish fee" extra={<Tooltip placement='topLeft' title={<span >Total fee = FileSize / 1GB * 100TSScoin </span>}> <InfoCircleOutlined /> </Tooltip>} >
                                    <Typography.Title>
                                        {publishFee} TSS
                                    </Typography.Title>
                                    {

                                        !isAcceptable ?
                                            <Tag color="red" >Not enough Money</Tag> :
                                            <>
                                                <Tag color="green">Accepted</Tag>
                                            </>
                                    }

                                    <Select {...TXinpProps} >
                                        {
                                            options.map(option => {
                                                return (
                                                    <Select.Option value={option.tx_id} key={option.tx_id}> 0x<Typography.Text ellipsis={{suffix : option.tx_id.slice(-4).trim()}} > {option.tx_id.slice(0,8)}...</Typography.Text>  ${option.value}  </Select.Option>
                                                )
                                            })
                                        }
                                    </Select>
                                    <Space direction="horizontal" align="start" size="middle">
                                        <Typography > = {TotlaFee()}</Typography>
                                    </Space>

                                    {/* {console.log("day en", options)} */}
                                </Card>
                                {/* <Title level={2}> Create New Thesis </Title> */}
                                <Form form={form} onSubmit={handleSubmit}>
                                    <Form.Item   >
                                        <Checkbox id="isPublish" onChange={() => { setIsPublish(!isPublish) }} checked={isPublish} >{(isPublish) ? "Pay to publish" : "Only push temporary to IPFS"}</Checkbox>
                                    </Form.Item>
                                    <Form.Item required label="Confirm by your Private Key">
                                        <Input
                                            id="password"
                                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                            placeholder="Enter your private key"
                                            type="password"
                                            value={values.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={
                                                errors.password && touched.password ? 'text-input error' : 'text-input'
                                            }
                                            disabled={!isPublish}
                                        />
                                        {errors.password && touched.password && (
                                            <div className="input-feedback">{errors.password}</div>
                                        )}
                                    </Form.Item>
                                    <Form.Item label={<><Typography.Text>Allowed Users</Typography.Text><Tooltip placement='top' title={<span >Verified by Address </span>}> <InfoCircleOutlined /> </Tooltip></>}>
                                        <SelectAllowUser id="allowUsers" listEmail={listEmail} setListEmail={setListEmail} ></SelectAllowUser>
                                    </Form.Item>


                                </Form>
                            </div>
                        )
                    }}
                </Formik>
            </Modal>
        </>
    )
}

export { ChapterModal, PublishChapterModal, }