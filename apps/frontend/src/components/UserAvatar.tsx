export const UserAvatar = ({ name , rating}: { name: string , rating:number}) => {
  return <div className="text-white">{name} ({rating})</div>;
};
