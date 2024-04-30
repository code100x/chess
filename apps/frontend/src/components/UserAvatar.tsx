export const UserAvatar = ({ name , avatar }: { name: string , avatar:string}) => {
  return (
    <div className="flex  gap-4">
    <img className="w-10 h-10 rounded" src={avatar} alt="" />
    <div className="font-medium dark:text-white text-white">
      <div>{name}</div>
    </div>
</div>
  )
};
