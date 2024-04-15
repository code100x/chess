"use client";
import { CardWrapper } from "./card-wrapper";
import {BeatLoader} from "react-spinners";
import { useEffect,useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { NewVerification } from "@/actions/new-verification";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const NewVerificationForm = () =>{
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [error,setError] = useState<string | undefined>("");
    const [success,setSuccess] = useState<string | undefined>("");

    // console.log(token);
    const onSubmit = useCallback(()=>{
        if(success || error) return;
        if(!token){
            setError("Missing Token")
            return
        } 
        NewVerification(token)
        .then((data) => {
            setSuccess(data.success)
            setError(data.error)
        })
        .catch(()=>{
            setError("Something went wrong")
        })
    },[token,success,error]);

    useEffect(()=>{
        onSubmit();
    },[onSubmit])



    return(
        <CardWrapper 
        headerLabel = "Confirm your verification"
        backButtonlabel = "Back to Login"
        backButtonHref = "/auth/login"
        >
            <div className="flex items-center w-full justify-center">
            {!success && !error && (
                <BeatLoader color="#a963e1"/>
            )}
            <FormSuccess message = {success}/>
            {!success && (
            <FormError message={error}/>
            )}
            </div>
        </CardWrapper>
    )
}   