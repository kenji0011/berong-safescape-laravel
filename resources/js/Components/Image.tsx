import React, { ImgHTMLAttributes } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
    fill?: boolean;
    priority?: boolean;
    fetchPriority?: 'high' | 'low' | 'auto';
}

export default function Image({
    src,
    alt,
    width,
    height,
    className,
    fill,
    priority = false,
    loading,
    decoding,
    fetchPriority,
    ...props
}: ImageProps) {
    const style: React.CSSProperties = fill ? { width: '100%', height: '100%' } : {};
    const resolvedLoading = loading || (priority ? 'eager' : 'lazy');
    const resolvedDecoding = decoding || 'async';
    const resolvedFetchPriority = fetchPriority || (priority ? 'high' : 'auto');

    return (
        <img 
            src={src} 
            alt={alt || ''} 
            width={width} 
            height={height} 
            className={className} 
            style={style}
            loading={resolvedLoading}
            decoding={resolvedDecoding}
            fetchPriority={resolvedFetchPriority}
            {...props} 
        />
    );
}
