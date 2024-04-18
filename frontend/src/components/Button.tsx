
export const Button = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => {
    return <button onClick={onClick} className="px-8 py-3 text-2xl bg-[#81b64c] hover:bg-[#a3d160] border-b-[5px] border-b-[#5d9948]  hover:bg-green-700 text-white font-bold rounded">
        {children}
    </button>
}