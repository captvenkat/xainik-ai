interface IconProps {
  name: 'soldier' | 'medal' | 'trophy' | 'people' | 'money' | 'calendar' | 'email' | 'spy' | 'handshake' | 'target' | 'share' | 'heart'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function Icon({ name, size = 'md', className = '' }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const icons = {
    soldier: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
        <path d="M12 18C13.1046 18 14 17.1046 14 16C14 14.8954 13.1046 14 12 14C10.8954 14 10 14.8954 10 16C10 17.1046 10.8954 18 12 18Z"/>
      </svg>
    ),
    medal: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="6"/>
        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
      </svg>
    ),
    trophy: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 4V2C7 1.45 7.45 1 8 1H16C16.55 1 17 1.45 17 2V4H20V6C20 7.1 19.1 8 18 8H6C4.9 8 4 7.1 4 6V4H7ZM9 3V4H15V3H9Z"/>
        <path d="M6 9V10C6 11.1 6.9 12 8 12H16C17.1 12 18 11.1 18 10V9H20V11C20 13.21 18.21 15 16 15H8C5.79 15 4 13.21 4 11V9H6Z"/>
      </svg>
    ),
    people: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 4C16 5.10457 15.1046 6 14 6C12.8954 6 12 5.10457 12 4C12 2.89543 12.8954 2 14 2C15.1046 2 16 2.89543 16 4Z"/>
        <path d="M20 4C20 5.10457 19.1046 6 18 6C16.8954 6 16 5.10457 16 4C16 2.89543 16.8954 2 18 2C19.1046 2 20 2.89543 20 4Z"/>
        <path d="M8 4C8 5.10457 7.10457 6 6 6C4.89543 6 4 5.10457 4 4C4 2.89543 4.89543 2 6 2C7.10457 2 8 2.89543 8 4Z"/>
        <path d="M12 8C13.1046 8 14 7.10457 14 6C14 4.89543 13.1046 4 12 4C10.8954 4 10 4.89543 10 6C10 7.10457 10.8954 8 12 8Z"/>
        <path d="M16 8C17.1046 8 18 7.10457 18 6C18 4.89543 17.1046 4 16 4C14.8954 4 14 4.89543 14 6C14 7.10457 14.8954 8 16 8Z"/>
        <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"/>
        <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z"/>
        <path d="M16 12C17.1046 12 18 11.1046 18 10C18 8.89543 17.1046 8 16 8C14.8954 8 14 8.89543 14 10C14 11.1046 14.8954 12 16 12Z"/>
        <path d="M8 12C9.10457 12 10 11.1046 10 10C10 8.89543 9.10457 8 8 8C6.89543 8 6 8.89543 6 10C6 11.1046 6.89543 12 8 12Z"/>
      </svg>
    ),
    money: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H9V13H11V11H9V9H11V7H13V9H15V11H13V13H15V15H13V17Z"/>
      </svg>
    ),
    calendar: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V8H19V19Z"/>
        <path d="M7 5H9V7H7V5Z"/>
        <path d="M11 5H13V7H11V5Z"/>
        <path d="M15 5H17V7H15V5Z"/>
      </svg>
    ),
    email: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"/>
      </svg>
    ),
    spy: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V11H1V13H3V15H1V17H3V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V17H23V15H21V13H23V11H21V9H23V7H21V9ZM19 19H5V3H13V9H19V19Z"/>
      </svg>
    ),
    handshake: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V11H1V13H3V15H1V17H3V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V17H23V15H21V13H23V11H21V9H23V7H21V9ZM19 19H5V3H13V9H19V19Z"/>
      </svg>
    ),
    target: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"/>
      </svg>
    ),
    share: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
      </svg>
    ),
    heart: (
      <svg className={`${sizeClasses[size]} ${className}`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    )
  }

  return icons[name] || null
}
