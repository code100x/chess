import { ReactNode, MouseEventHandler } from 'react';

interface GameModeComponent {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  disabled: boolean;
}

const GameModeComponent = ({
  icon,
  title,
  description,
  onClick,
  disabled,
}: GameModeComponent) => (
  <div
    onClick={onClick}
    className="-mx-2 mt-1 bg-bgAuxiliary2 flex items-start space-x-4 rounded-sm p-2 transition-all shadow-lg"
  >
    {icon}

    <div className="space-y-1">
      <p className="text-sm pt-1 font-medium leading-none text-slate-400">
        {title}
      </p>
      <p className="text-xs pt-2 text-muted-foreground">{description}</p>
      {disabled && (
        <p className="text-xs text-red-500 font-semibold">Coming Soon ...</p>
      )}
    </div>
  </div>
);

export default GameModeComponent;
