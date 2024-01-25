import {NextResponse} from "next/server"

export function GET(){
    console.log("My Message")
    return NextResponse.json('Hello world')
}