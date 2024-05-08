export const getResult = (status: string, result: any) => {
    if(status === 'RESIGNED') return "Resign";
    if (status !== 'COMPLETED') return 'Timeout';
    switch (result) {
        case "DRAW":
            return "Draw"
        case "WHITE_WINS":
        case "BLACK_WINS":
            return "CheckMate"
        default:
            return ""
    }
}   