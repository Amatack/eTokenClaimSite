import { useState } from "react";
import {toast} from 'react-hot-toast'
import { sendEtoken } from "../../api/claim/sendEtoken";
import { getEtokenInfo } from "../../api/getEtokenInfo/getEtokenInfo";
import {shortenText} from "../../utils/shortenText"

import "./style.css"

const Claim = (props) => {

    const {setAvailableTokens} = props

    const [txId, setTxId] = useState("")
    const [txId2, setTxId2] = useState("")
    const [shortenedTxId, setShortenedTxId] = useState("")
    const [shortenedTxId2, setShortenedTxId2] = useState("")
    const [isVisible, setIsVisible] = useState(true);
    

    const [address, setAddress] = useState("")

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
        }
    };

    const handleClick = () => {
        setIsVisible(false);
    };

    const onSubmit = async (e) =>{
        e.preventDefault();
        // console.log(formData)
        handleClick()
            try {
            
            if(address.length !== 48){
                toast.error("Enter a valid eCash address")
                return
            }

            const res = await sendEtoken(address)
            
                if(res.error === false){
                    const shortenedText = shortenText(res.data.txid)
                    const shortenedText2 = shortenText(res.data.txid2)
                    setTxId(res.data.txid)
                    setTxId2(res.data.txid2)
                    setShortenedTxId(shortenedText)
                    setShortenedTxId2(shortenedText2)
                }else{
                    toast.error(res.message)
                }

            getEtokenInfo()
                .then(res => {
                    if(res.error === false){
                        
                        setAvailableTokens(res.data.availableTokens)
                        return
                    }
                    toast.error(res.message)
                    return
                })
                .catch((err) => {
                    toast.error(err.toString())
                })
            
            }
            catch(error){
                toast.error(error.toString())
            }
            
            
        }
    

    const onChange = e =>{
        setAddress(e.target.value)
    }

    return (
        <div className="claim-component">
            
                {txId === "" ?<form onSubmit={onSubmit} onChange={onChange} className='claim-page-form'>
                    
                    <input 
                    autoComplete='off'
                    className='eCash-address-input'
                    type="text"
                    name="address"
                    onKeyDown={handleKeyPress}
                    placeholder={"eCash Address"}
                    defaultValue={address}/>
                    
        
                    {isVisible && <button 
                    className='claim-page-button'
                    type='submit'>
                    Claim eToken
                    </button>}
                </form>
                :(<div className='transaction-executed-container'>
                    <p>✅Transactions executed successfully</p>
                        <p> <a href={`https://explorer.e.cash/tx/${txId}`} target="_blank" rel="noopener noreferrer">
                            Tx: {shortenedTxId}
                            </a>
                        </p>
                        <p> <a href={`https://explorer.e.cash/tx/${txId2}`} target="_blank" rel="noopener noreferrer">
                            Tx: {shortenedTxId2}
                            </a>
                        </p>
                </div>)
                }
        </div>
    )
}

export default Claim