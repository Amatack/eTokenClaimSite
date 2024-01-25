'use client'

import { useForm } from "react-hook-form"
import './styles.css'

export default function RegisterPage(){

    const {register, handleSubmit, formState:{errors}} = useForm()

    const onSubmit = handleSubmit(async (data) =>{
        const res = await fetch('/api/auth/register',{
            method: 'POST',
            body: JSON.stringify(data),
            headers:{
                "Content-type": "application/json"
            }
        })
        const resJSON = await res.json()
        console.log(resJSON)
    })

    return(
        <div>
            <form  onSubmit={onSubmit}>
                <label htmlFor="eCashAddress" className="text">
                    eCashAddress:
                </label>
                <input type="text" id="eCashAddress" placeholder="eCash Address"
                    {...register("eCashAddress", {required: {
                        value: true,
                        message: 'eCash Address is required'
                    }})}
                />
                {
                    errors.eCashAddress && (
                        <span>
                            {errors.eCashAddress.message}
                        </span>
                    )
                }
                
                

                <button className="button">
                    Register
                </button>
            </form>

        </div>
    )
}