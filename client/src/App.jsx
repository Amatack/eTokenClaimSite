import Claim from "./components/Claim";
import { useState, useEffect } from "react";
import "./App.css";
import {toast, Toaster} from 'react-hot-toast'


import { getEtokenInfo } from "./api/getEtokenInfo/getEtokenInfo";
/* import { montserrat, poppins } from "./fonts"; */

export default function App()
  {
    const [availableTokens, setAvailableTokens] = useState("")
    const [tokenId, setTokenId] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenTicker, setTokenTicker] = useState("")

    useEffect(()=>{
      getEtokenInfo()
        .then(res => {
          if(res.error === false){
              setAvailableTokens(res.data.availableTokens)
              setTokenName(res.data.tokenName)
              setTokenTicker(res.data.tokenTicker)
              setTokenId(res.data.tokenId)
              
              return
          }
          toast.error(res.message)
          return
        })
        .catch((err) => {
            toast.error(err.toString())
        })
    },[])
  return (
    <html lang="en">
      <body /* className={`${montserrat.className} antialiased`} */>
        
        <main className={"main"}>
          <article className={"article"}>
            <h1 className={"h1" } >eToken Claim App</h1>
            <div>
              <p className={"p"} title={tokenId}>
                
                eToken to claim: {tokenName} ({tokenTicker})
              </p>
              <p className={"p"}>
                Available eTokens: {availableTokens}
              </p>
              <Claim 
                setAvailableTokens={setAvailableTokens}
              />
              
            </div>
          </article>
        
          <Toaster
            position="top-center"
          />
        </main>
        
      </body>
    </html>
  );
}
