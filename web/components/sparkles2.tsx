"use client";
import React from "react";
import SparklesCore from "./sparkles";
interface SparklesPreviewProps{
    children:React.ReactNode
}

export function SparklesPreview2({
    children,
}:SparklesPreviewProps) {
  return (
    <div className="h-full relative w-full bg-black flex flex-col items-center justify-center">
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
    {children}
    </div>
    )
}