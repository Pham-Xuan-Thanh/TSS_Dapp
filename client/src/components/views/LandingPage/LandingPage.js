import React from 'react'
import { FaCode, FaWatehouse, FaServer } from "react-icons/fa";

function LandingPage() {
    return (
        <>
            <div className="app">
                <span style={{ fontSize: '2rem' }}>Thesis Storage System</span><br />

                <FaServer style={{ fontSize: '4rem' }} /><br />
            </div>
            <div style={{ float: 'right' }}>Thanks For Using This Boiler Plate by John Ahn</div>
        </>
    )
}

export default LandingPage
