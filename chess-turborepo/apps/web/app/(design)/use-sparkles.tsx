"use client";
import React from "react";
import  SparklesCore  from '../../components/sparkles';
import { ThreeDCardDemo } from "./use-3dcard";
import { LoginButton } from "@/components/auth/login-button";
import { StartNowButton } from "./landing-start-button";
import Lottie from "lottie-react";
import animationData from "@/public/lottie/moving-file/chess2.json";
import Link from "next/link";
import {motion} from "framer-motion";
import Logo from "../(marketing)/_components/logo";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export function SparklesPreview() {
  return (
    <div className="h-screen relative w-full flex flex-col items-center justify-center">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
        />
      </div>
      <div className="top-0 fixed left-0 p-4 justify-between flex right-0 mt-2">
      <Logo/>
      <Link href="https://github.com/code100x/chess" target="_blank">
      {/* <Button variant="outline" size="default">⭐️ on <GithubIcon className="h-4 w-4 ml-2"/></Button> */}
      <button className="Btn">
  <span className="leftContainer">
    <svg fill="white" viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"></path></svg>
    <span className="like">Star</span>
  </span>
  <span className="likeCount">
    <FaGithub className="text-black h-5 w-5 ml-2"/>
  </span>
</button>
      </Link>
      </div>
      <div className="cursor-pointer">
      </div>
      <div className="flex justify-center items-center">
      <Lottie
        animationData={animationData}
        className="flex justify-center h-40 items-center"
        loop={true}
      />
      </div>
      <div className="flex flex-col items-center justify-center 
      w-full mb-6 z-50">
      <div className="inline-flex gap-x-4">
      <h1 className="mb-2 flex text-4xl font-bold sm:text-5xl xl:text-7xl/none bg-clip-text text-transparent bg-gradient-to-tr from-violet-600 to-neutral-300/90 capitalize max-sm:text-[1.4rem] md:max-w-3xl lg:max-w-5xl">
        Chess for Champions 
      </h1>
      <span className="text-6xl mt-2 font-bold hidden lg:flex text-white">♟️</span>
      </div>
      <p className="max-w-[720px] leading-7 font-medium text-center text-[16px] bg-clip-text text-transparent bg-gradient-to-br from-violet-200  to-slate-500 max-sm:text-xs">
      The ultimate multiplayer chess platform that brings together players from around the world for thrilling, real-time gameplay! 👨🏻‍💻</p>
      </div>
      {/* <div className="flex flex-col items-center justify-center w-full"> */}
      <LoginButton asChild>
        {/* Can put mode="modal" if wanted later */}
      <StartNowButton/>
      </LoginButton>
      {/* </div> */}
    </div>
  );
}
