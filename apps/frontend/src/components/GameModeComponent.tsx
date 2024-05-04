import { ReactNode, MouseEventHandler } from 'react';

interface GameModeComponent {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const GameModeComponent = ({
  icon,
  title,
  description,
  onClick,
}: GameModeComponent) => (
  <div
    onClick={onClick}
    className={`-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground ${
      onClick ? 'cursor-pointer' : 'cursor-default'
    }`}
  >
    {icon}
    <div className="space-y-1">
      <p className="text-sm font-medium leading-none">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default GameModeComponent;
