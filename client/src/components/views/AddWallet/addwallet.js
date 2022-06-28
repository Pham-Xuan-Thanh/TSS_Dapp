import React, { useState } from 'react'
import { getAddress, createWallet } from '../../../_actions/wallet_action';
import {  FaServer } from "react-icons/fa";
import Icon from '@ant-design/icons';
import { Form, Input, message, Checkbox, Typography } from 'antd';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from "react-redux";


const { Title } = Typography;

function AddWallet(props) {
    const [formErrorMessage, setFormErrorMessage] = useState('')

    const dispatch = useDispatch();
    const [addwallet, setAddwallet] = useState(true)

    const handleAddWallet = () => {
        setAddwallet(!addwallet)
    }
    return (
        <>
            <div className="app">
                <span style={{ fontSize: '2rem' }}>ADDWALLET HAY K? BỐ  VÃ CHẾT GIỜ</span><br />

                <FaServer style={{ fontSize: '4rem' }} /><br />
            <Title level={2}>Create new or Add your Wallet</Title>

            <Formik
                initialValues={{ priv_key: "", password: "" }}
                validationSchema={Yup.object().shape({
                    password: Yup.string()
                        .min(6, 'Password must be at least 6 characters')
                        .required('Password is required'),
                    priv_key: Yup.string()
                })}
                onSubmit={(values, { setSubmitting }) => {
                    setTimeout(() => {
                        let dataToSubmit = {
                            priv_key: values.priv_key,
                            password : values.password,
                            user_id : localStorage.getItem("userId")
                        }
                        const res = addwallet ? dispatch(getAddress(dataToSubmit)) : dispatch(createWallet(dataToSubmit))
                        res
                            .then(response => {
                                if (response.payload.success) {
                                    window.localStorage.setItem('addressWallet', response.payload.address);
                                    message.info("Add wallet Successfully !!!")
                                    props.history.push("/dashboard")
                                }
                                else
                                {setFormErrorMessage('Check out your Password again ')
                                    // setTimeout(() => { alert(JSON.stringify(values, null, 2)) }, 3000)
                                props.history.push("/addwallet")}
                            })
                            .catch( err =>  {
                                setFormErrorMessage('Sorry!! Suddenly unexpected accident occured :<')
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
                            <Checkbox id="addwallet" onChange={handleAddWallet} checked={addwallet} >Add exist Wallet with private key</Checkbox>
                            
                        </Form.Item>
                        <Form.Item >
                            <Input
                                id="priv_key"
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Enter your Secret Key"
                                type="text"
                                value={values.priv_key}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.priv_key && touched.priv_key ? 'text-input error' : 'text-input'
                                }
                                
                                disabled={!addwallet}
                            />
                            {errors.priv_key && touched.priv_key && (
                                <div className="input-feedback">{errors.priv_key}</div>
                            )}
                        </Form.Item>

                        <Form.Item required>
                            <Input
                                id="password"
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Enter your password"
                                type="password"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={
                                    errors.password && touched.password ? 'text-input error' : 'text-input'
                                }
                            />
                            {errors.password && touched.password && (
                                <div className="input-feedback">{errors.password}</div>
                            )}
                        </Form.Item>

                        {formErrorMessage && (
                            <label ><p style={{ color: '#ff0000bf', fontSize: '0.7rem', border: '1px solid', padding: '1rem', borderRadius: '10px' }}>{formErrorMessage}</p></label>
                        )}
                        
                        <button style={{float : "right"}} type="submit" disabled={isSubmitting}>
                            SUBMIT
                        </button>
                    </form>
                )}
            </Formik>
            </div>

        </>
    )
}

export default AddWallet
