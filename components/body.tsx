"use client"

import Option1 from "./option1"
import Option2 from "./option2"
import Option3 from "./option3"
import Submit from "./submit"
import Image from "next/image";

export default function Body() {
    return(
        <header className="bg-white w-full flex justify-center items-center" >
            <div className="w-135 h-180">
                <div className="flex"><span className="text-gray-600 text-xl mb-5">From</span></div>
                <div className=" flex justify-center"><Option1/></div>
                
                <div className="flex">
                    <span className="text-gray-600 text-xl mb-5 mt-10">To</span>
                    <Image src={"/exchange.png"} alt="" width={45} height={10} className="mx-auto mt-8 mb-5 w-7 h-7"></Image>
                    </div>
                <div className="mb-10 flex justify-center"><Option2/></div>

                <div className="flex"><span className="text-gray-600 text-xl mb-5">Amount</span></div>
                <div className="mb-7 flex justify-center"><Option3/></div>

                <div><Submit/></div>
            </div>
        </header>
    )
}