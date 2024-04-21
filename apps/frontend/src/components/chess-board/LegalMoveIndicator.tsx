const LegalMoveIndicator = ({
  isPiece,
  isMainBoxColor,
}: {
  isPiece: boolean;
  isMainBoxColor: boolean;
}) => {
  return (
    <div className="absolute z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      {isPiece ? (
        <div
          className={`w-[60px] h-[60px] ${isMainBoxColor ? 'border-[#628047]' : 'border-[#C8CAB2]'} border-4 rounded-full`}
        />
      ) : (
        <div
          className={`w-5 h-5 ${isMainBoxColor ? 'bg-[#628047]' : 'bg-[#C8CAB2]'} rounded-full`}
        />
      )}
    </div>
  );
};

export default LegalMoveIndicator;
