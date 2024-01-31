import axios from "axios"
import { API_HOST } from "../../utils/constants";

export async function getEtokenInfo(){
    try {
    const url = `${API_HOST}/v1/getEtokenInfo`


    const res = await axios.get(url,{
        
        })
        if(res.status >= 200 && res.status < 300){
            return {data: res.data, message: "etokens information displayed successfully", error: false}
        }else{
            return {message: "Error while try to connect to server",  error: true}
        }
    } catch (err) {
        if (err.response.status === 504) {
            return {message: 'Error 504: Gateway Timeout', error: true}
        }else {
        
        return {message: "Something went wrong", error: true}
        }
    }
}