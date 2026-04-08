import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getInitials, getAvatarStyle } from '../../utils/avatarUtils.js';
import { avatarService } from '../../services/avatarService.js';

/**
 * Avatar Component — Displays user avatar
 *
 * Priority: uploaded src → initials fallback
 */
const Avatar = ({
    src,
    name = '',
    gender = 'other',
    size = 'md',
    className = '',
    onClick
}) => {
    const [failedSrc, setFailedSrc] = useState(null);
    const [resolvedSrc, setResolvedSrc] = useState(null);
    const initials = getInitials(name);
    const style = getAvatarStyle(gender);

    const sizeClasses = {
        xs: 'avatar-xs',
        sm: 'avatar-sm',
        md: 'avatar-md',
        lg: 'avatar-lg',
        xl: 'avatar-xl'
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;

    useEffect(() => {
        let isMounted = true;

        const resolveSrc = async () => {
            if (!src) {
                if (isMounted) setResolvedSrc(null);
                return;
            }

            if (src.startsWith('http')) {
                if (isMounted) setResolvedSrc(src);
                return;
            }

            const signedUrl = await avatarService.getUrl(src);
            if (isMounted) {
                setResolvedSrc(signedUrl || null);
            }
        };

        resolveSrc();

        return () => {
            isMounted = false;
        };
    }, [src]);

    const shouldShowImage = resolvedSrc && failedSrc !== resolvedSrc;

    // Show uploaded photo if available and valid
    if (shouldShowImage) {
        return (
            <div
                className={`avatar ${sizeClass} ${className}`}
                onClick={onClick}
                title={name}
                style={{ padding: 0, overflow: 'hidden' }}
            >
                <img
                    src={resolvedSrc}
                    alt={name}
                    onError={() => setFailedSrc(resolvedSrc)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'inherit',
                        display: 'block',
                    }}
                />
            </div>
        );
    }

    // Fallback to initials
    return (
        <div
            className={`avatar ${sizeClass} ${className}`}
            style={style}
            onClick={onClick}
            title={name}
        >
            {initials}
        </div>
    );
};

Avatar.propTypes = {
    src: PropTypes.string,
    name: PropTypes.string,
    gender: PropTypes.oneOf(['male', 'female', 'other']),
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
    className: PropTypes.string,
    onClick: PropTypes.func
};

export default Avatar;
