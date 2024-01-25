import {NextResponse} from 'next/server'
import db from '@/libs/prisma'

export async function POST(request){
    const data = await request.json()

    data.id = new Date().getTime();
    data.ip = String(new Date().getTime())

    console.log("data from POST(): ", data)
    const newUser = await db.user.create({
        data
    })

    console.log(data)
    return NextResponse.json(newUser)
}