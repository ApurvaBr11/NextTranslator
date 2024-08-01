import React from 'react'
import { RxAvatar } from 'react-icons/rx'

const Navbar = () => {
  return (
    <div className="flex justify-center items-center  h-10  absolute top-6 w-full">
        <div className='w-5/6 mx-auto border h-full rounded-full flex justify-between items-center px-2 md:px-12'>
        <div className="">TranslateInto</div>
        <div className="flex gap-5 items-center">
            <div className="md:flex hidden gap-5 items-center ">
            <p>Start Now</p>
            <p>History</p>
            </div>
            <div className="">
                <RxAvatar className='text-xl'/>
            </div>
        </div>
        </div>
    </div>
  )
}

export default Navbar