import { useEffect, useRef, forwardRef } from 'react';
import { useSpring, useTransform, useMotionValue } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (v: number) => string;
  className?: string;
}

export const AnimatedNumber = forwardRef<HTMLSpanElement, AnimatedNumberProps>(
  ({ value, format = (v) => v.toString(), className }, forwardedRef) => {
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { stiffness: 100, damping: 30, duration: 0.6 });
    const display = useTransform(spring, (latest) => format(latest));
    const innerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      motionValue.set(value);
    }, [value, motionValue]);

    useEffect(() => {
      const unsubscribe = display.on('change', (v) => {
        if (innerRef.current) innerRef.current.textContent = v;
      });
      return unsubscribe;
    }, [display]);

    return <span ref={innerRef} className={className}>{format(0)}</span>;
  }
);

AnimatedNumber.displayName = 'AnimatedNumber';
