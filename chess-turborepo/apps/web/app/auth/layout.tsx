import { SparklesPreview2 } from "@/components/sparkles2";

const AuthLayout = ({
    children
}:{
    children:React.ReactNode
}) => {
    return ( 
        <>
        <SparklesPreview2 >
            {children}
        </SparklesPreview2>
        </>
    );
}

export default AuthLayout;