import { useEffect, useRef } from 'react';

export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean,
  threshold = 0.1
) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          callback();
        }
      },
      { 
        threshold,
        rootMargin: '100px'
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [callback, hasMore, isLoading, threshold]);

  return observerTarget;
};
