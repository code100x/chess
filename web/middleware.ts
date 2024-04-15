import authConfig from "./auth.config";
import NextAuth from "next-auth";

const {auth} = NextAuth(authConfig)
import {
    DEFAULT_LOGIN_REDIRECT,
    publicRoutes,
    apiAuthPrefix,
    authRoutes
} from "@/routes"

export default auth((req) => {
    const {nextUrl} = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
    const isAuthRoutes = authRoutes.includes(nextUrl.pathname);

    if(isApiAuthRoute){
        return null;
    }
    if(isAuthRoutes){
        if(isLoggedIn){
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT,nextUrl));
        }
        return null;
    }
    if(!isLoggedIn && !isPublicRoute){
        let callbackUrl = nextUrl.pathname;
        if(nextUrl.search){
            callbackUrl+=nextUrl.search
        }
        const encodedUrlComponent = encodeURI(callbackUrl);

        return Response.redirect(new URL(
            `/auth/login?callbackUrl=${encodedUrlComponent}`,
            nextUrl
        ));
    }   
    return null;

})

export const config = {
matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}