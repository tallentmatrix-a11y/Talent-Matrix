import React from 'react'
import {useForm} from 'react-hook-form'

const Login = () => {
    const {register, handleSubmit} = useForm()
    const onSubmit = (data) => console.log(data)
    return (
        <>
        <div className='w-auto min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#1F3F77] to-bg-[#21427C]'>
          <div className='m-5 p-5 bg-[#335288] rounded-xl'>
            <div className='flex flex-col items-center justify-center'>
              <h2 className='text-3xl font-bold text-white'>Welcome Back</h2>
              <h2 className='text-md font-thin text-white'>Login into your account</h2>
            </div>
            <form action="" onSubmit={handleSubmit(onSubmit)} className="w-auto h-auto flex flex-col items-center justify-center m-1 p-1 gap-5">
                <label htmlFor="Email"><input type="email" name="Email" placeholder='Email' {...register('Email',{required:true})} className='text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]'/></label>
                <label htmlFor="Password"><input type="password" name="Password" placeholder='Password' {...register('password',{required:true})} className='text-white bg-[#5B749F] rounded-lg px-2 py-1 w-[300px]'/></label>
                <button className='text-black font-bold bg-linear-to-r from-[#46B4FE] to-[#0DE6FE] w-[300px] rounded-lg px-2 py-1' onClick={handleSubmit(onSubmit)}>Login</button>
            </form>
            <div>
              <h2 className='text-white text-md font-semibold'>OR</h2>
            </div>
            <div className='flex flex-col items-center justify-center'>
              <button className='bg-white text-black w-[300px] font-bold rounded-lg px-2 py-1 my-3'>Sign in with Google</button>
              <button className='bg-blue-500 text-white font-bold w-[300px] rounded-lg px-2 py-1'>Sign in with LinkedIn</button>
            </div>
            <div className='flex flex-col items-center justify-center my-2'>
                <h2 className='text-white font-thin text-md'>Dont't have an account? <span className='text-[#0DE6FE] font-semibold text-md'>Sign Up</span></h2>
            </div>
          </div>
        </div>
        </>
    )
}

export default Login