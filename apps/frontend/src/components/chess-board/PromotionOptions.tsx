type Props = {
  onSelect: (value: string) => void;
  myColor: 'w' | 'b';
};

const PromotionOptions = ({ onSelect, myColor }: Props) => {
  const pieces = ['q', 'r', 'b', 'n'];
  return (
    <div
      className={`flex flex-col items-center gap-4 absolute z-10  ${myColor === 'w' ? 'bg-stone-600' : 'bg-gray-300'} top-0 p-2  shadow-xl `}
    >
      {pieces.map((piece) => {
        return (
          <div onClick={() => onSelect(piece)}>
            <img className="w-16" src={`/${myColor === 'b' ? `b${piece}` : `w${piece}`}.png`} />
          </div>
        );
      })}
    </div>
  );
};

export default PromotionOptions;
