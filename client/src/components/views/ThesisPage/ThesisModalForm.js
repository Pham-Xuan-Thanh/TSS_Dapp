import React, { useRef, useState, useEffect } from 'react';
import { Formik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';


import { Button, Form, Input, Modal, Alert, Typography } from 'antd';
import EditableTagGroup from "./EditableTagGroup"

import { useSelector} from "react-redux"


// const { Title } = Typography;
const { TextArea } = Input;


const ThesisCreateModal = ({ visible,setVisible, onCancel, dispatchAction, dataCommitted }) => {
    const formikRef = useRef()
    const [form]  = Form.useForm()
    const dispatch = useDispatch()
    const [keywords, setKeywords] = useState(dataCommitted.keywords || [])
    // const user = useSelector( state => state.user)
    
    return (
        <>
            <Modal
                visible={visible}
                title="Create a new Thesis"
                okText="Create"
                cancelText="Cancle"
                getContainer={false}
                onCancel={() => onCancel()}
                onOk={() => {
                    if (formikRef.current) formikRef.current.handleSubmit()
                    
                    // console.log("TRONG MODAL", form.getFieldsValue(true))
                    // onCreate(form.getFieldsValue(true))
                    // form.resetFields();
                    setKeywords([])
                    setVisible(!visible)
                }}
            >
                <Formik 
                    innerRef={formikRef}
                    initialValues={{
                        studentID: dataCommitted.studentID,
                        article: dataCommitted.article,
                        keywords: dataCommitted.keywords,
                        supervisor: dataCommitted.supervisor,
                        chapters:dataCommitted.chapters,
                        description: dataCommitted.description,
                        userid: localStorage.getItem("userId")

                    }}
                    validationSchema={Yup.object().shape({
                        studentID: Yup.number().required("Empty?"),
                        article: Yup.string().required("Thesis Name is required"),
                        keywords: Yup.array().of(Yup.string()),
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
                        supervisor: Yup.string()


                    })}
                    
                    onSubmit={(values, { setSubmitting }) => {
                        console.log("MODAL FORM "  , typeof dispatchAction)
                        setTimeout(() => {
                            let dataToSubmit = {
                                studentID: values.studentID,
                                article: values.article,
                                keywords: keywords,
                                supervisor: values.supervisor,
                                description: values.description,
                                userid: localStorage.getItem("userId")
                            }
                            if (dataCommitted?._id)  dataToSubmit = {...dataToSubmit , _id: dataCommitted._id}

                            dispatch(dispatchAction(dataToSubmit))
                            // .then(resp => {
                            //     if (resp.payload.success) {
                            //     } else {
                                    
                            //         console.log("sao lai k dc", resp.payload)
                            //         alert(<Alert message="Error while uploading data " banner closable></Alert>)
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
                                <Form   form={form}  onSubmit={handleSubmit}>
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

                                    <Form.Item required label="Name">
                                        <Input
                                            id="article"
                                            placeholder="Enter your Thesis Name"
                                            type="text"
                                            value={values.article}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={
                                                errors.article && touched.article ? 'text-input error' : 'text-input'
                                            }
                                        />
                                        {errors.article && touched.article && (
                                            <div className="input-feedback">{errors.article}</div>
                                        )}
                                    </Form.Item>
                                    <EditableTagGroup      initialValues={values.keywords}  passSetKeywords={setKeywords} />
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


                                    <Form.Item required label="Supervisor">
                                        <Input
                                            id="supervisor"
                                            placeholder="Enter your Thesis Name"
                                            type="text"
                                            value={values.supervisor}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={
                                                errors.supervisor && touched.supervisor ? 'text-input error' : 'text-input'
                                            }
                                        />
                                        {errors.supervisor && touched.supervisor && (
                                            <div className="input-feedback">{errors.supervisor}</div>
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




export default ThesisCreateModal