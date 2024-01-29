'use client'

import { useState } from "react";
import {toast} from "react-toastify"
import { sendEtoken } from "../api/claim/sendEtoken";
import {shortenText} from "../utils/shortenText"

import "./style.css"

export default function Claim() {

    const [txId, setTxId] = useState("")
    const [shortenedTxId, setShortenedTxId] = useState("")

    const [formData, setformData] = useState(initialFormValue)

    const onSubmit = async (e) =>{
        e.preventDefault();
        // console.log(formData)
        
            try {
            
            const res = await sendEtoken(formData.address)
            
                if(res.error === false){
                    const shortenedText = shortenText(res.data.txid)
                    setTxId(res.data.txid)
                    setShortenedTxId(shortenedText)
                }else{
                    toast.warning(res.message)
                }

            }
            catch(error){
                toast.error(error.toString())
            }
            
            
        }
    

    const onChange = e =>{
        setformData({ ...formData, [e.target.name]: e.target.value})
    }

    return (
        <div >
            <h2>Claim Etoken</h2>
                {txId === "" ?<form onSubmit={onSubmit} onChange={onChange} className='claim-page-form'>
                    
                    <input className='eCash-address-input'
                    type="text"
                    name="address"
                    placeholder={"eCash Address"}
                    defaultValue={formData.address}/>
                    
        
                    <button 
                    className='claim-page-button'
                    type='submit'>
                    Claim eToken
                    </button>
                </form>
                :(<div className='transaction-executed-container'>
                    <p>Transaction executed successfully</p>
                    <p><a href={`https://explorer.e.cash/tx/${txId}`} target="_blank" rel="noopener noreferrer">
                    Tx: {shortenedTxId}
                    </a>
                    </p>
                </div>)
                }
    </div>
    )
}

function initialFormValue(){
    return{
    address: "",
    }
}
