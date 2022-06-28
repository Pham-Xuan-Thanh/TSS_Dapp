import React, { useState } from 'react'
import { getAddress, createWallet } from '../../../_actions/wallet_action';
import { FaWallet } from "react-icons/fa";
import Icon, { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Form, Input, message, Checkbox, Typography, Modal, Space } from 'antd';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { useDispatch } from "react-redux";


const { Title, Paragraph } = Typography;

function AddWallet(props) {
    const [formErrorMessage, setFormErrorMessage] = useState('')

    const dispatch = useDispatch();
    const history = useHistory();
    const [addwallet, setAddwallet] = useState(true)
    const [privKeyModal, setPrivKeyModal] = useState(null)
    const [hide, setHide] = useState(true)


    const handleAddWallet = () => {
        setAddwallet(!addwallet)
    }
    const handleCancleModal = () => {
        setPrivKeyModal(null)
        history.push("/dashboard")

    }
    return (
        <>

            <div className="app">

                <FaWallet style={{ fontSize: '4rem' }} /><br />
                <Title level={2}>Create new or Add your Wallet</Title>

                <Formik
                    initialValues={{ priv_key: "", password: "" }}
                    validationSchema={Yup.object().shape({

                        address: Yup.string()
                    })}
                    onSubmit={(values, { setSubmitting }) => {
                        setTimeout(() => {
                            let dataToSubmit = {
                                address: values.address
                            }
                            const res = addwallet ? dispatch(getAddress(dataToSubmit)) : dispatch(createWallet())
                            res.then(response => {
                                if (response.payload.success) {
                                    window.localStorage.setItem('addressWallet', response.payload.address);
                                    message.info("Add wallet Successfully !!!")
                                    if (!addwallet) {
                                        setPrivKeyModal(response.payload.priv_key)
                                    } else {
                                        history.push("/dashboard")

                                    }

                                }
                                else {
                                    setFormErrorMessage('Wrong Address type!!!')

                                    // setTimeout(() => { alert(JSON.stringify(values, null, 2)) }, 3000)
                                    history.push("/addwallet")
                                }
                            })
                                .catch(err => {

                                    setFormErrorMessage('Sorry!! Suddenly unexpected error occured :<')
                                    setTimeout(() => {
                                        setFormErrorMessage("")
                                    }, 3000);
                                })


                            // alert(JSON.stringify(values, null, 2));
                            setSubmitting(false);
                        }, 400);
                    }}


                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <form onSubmit={handleSubmit}>

                            <Form.Item>
                                <Checkbox id="addwallet" onChange={handleAddWallet} checked={addwallet} > {addwallet ? "Add your address" : "Create New"}</Checkbox>

                            </Form.Item>
                            <Form.Item label="Address">
                                <Input
                                    id="address"
                                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                    placeholder="Enter your address"
                                    type="text"
                                    value={values.address}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={
                                        errors.address && touched.address ? 'text-input error' : 'text-input'
                                    }

                                    disabled={!addwallet}
                                />
                                {errors.address && touched.address && (
                                    <div className="input-feedback">{errors.address}</div>
                                )}
                            </Form.Item>



                            <button style={{ float: "right" }} type="submit" disabled={isSubmitting}>
                                SUBMIT
                            </button>
                        </form>
                    )}
                </Formik>
            </div>
            <Modal
                title="Create Wallet Successfully"
                visible={privKeyModal !== null ? true : false}
                footer={<></>}
                onCancel={handleCancleModal}
            >
                <h3> Your private key is very IMPORTANT!!! Dont disclose to any one else </h3>
                <Paragraph copyable={{ text: privKeyModal }}>{hide ? <Space>{privKeyModal}  </Space> : <Space> *********************</Space>} {hide ? <EyeOutlined onClick={() => { setHide(false) }} /> : < EyeInvisibleOutlined onClick={() => { setHide(true) }} />}</Paragraph>
            </Modal>
        </>
    )
}

export default AddWallet
