export enum responseStatus {
    Ok = "ok",
    Error = "error",
}

export enum dbResStatus {
    Ok = "ok",
    Error = "error",
}

export enum WORKER_PROCESSES {
    SEND_OTP = "send_otp",
    INSERT_NEW_GAME = "insertGame",
    DB_ADD_PLAYER = "addPlayer"
}

export enum GameRole {
    White = "white",
    Black = "black",
    Audience = "audience"
}