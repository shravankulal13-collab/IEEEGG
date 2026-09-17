import React, { useRef } from 'react';
import './SpotlightCard.css';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(102, 163, 191, 0.35)',
  style,
  onMouseMove,
  onMouseEnter,
  ...props
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const updateMousePosition = (clientX: number, clientY: number) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateMousePosition(e.clientX, e.clientY);
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    updateMousePosition(e.clientX, e.clientY);
    if (onMouseEnter) onMouseEnter(e);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      style={style}
      className={`card-spotlight ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default SpotlightCard;
