import Claim from "./components/Claim";
import { useState, useEffect } from "react";
import "./App.css";
import {toast, Toaster} from 'react-hot-toast'

import { getEtokenInfo } from "./api/getEtokenInfo/getEtokenInfo";
import { shortenText } from "./utils/shortenText";
/* import { montserrat, poppins } from "./fonts"; */

export default function App()
  {
    const [availableTokens, setAvailableTokens] = useState("")
    const [tokenId, setTokenId] = useState("")
    const [shortenedTokenId, setShortenedTokenId] = useState("")

    useEffect(()=>{
      getEtokenInfo()
        .then(res => {
          if(res.error === false){
              
              setAvailableTokens(res.data.availableTokens)
              const shortenedText = shortenText(res.data.tokenId)
              setTokenId(res.data.tokenId)
              setShortenedTokenId(shortenedText)
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
            <h1 className={"h1" } >eToken Claim Site</h1>
            <div>
              <p className={"p"} title={tokenId}>
                Here you can claim: {shortenedTokenId}
              </p>
              <p className={"p"}>
                Available etokens: {availableTokens}
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
