import React, { ReactNode } from 'react';
import { spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = {
    children: ReactNode; // Add children to the Props type
};

const BouncingCaption = ({ children }: Props) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    // Create a spring animation for the bounce effect
    const bounce = spring({
        frame,
        fps,
        from: 0,
        to: 1,
        config: {
            damping: 5,
            stiffness: 100,
            mass: 0.5,
        },
    });
    
    // Map the spring value to a translateY value for bouncing
    const translateY = interpolate(bounce, [0, 1], [0, -30]);
    
    return (
        <div style={{ transform: `translateY(${translateY}px)` }}>
            {children}
        </div>
    );
}

export default BouncingCaption;
