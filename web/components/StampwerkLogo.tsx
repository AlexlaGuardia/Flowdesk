interface LogoProps {
  size?: number;
  className?: string;
}

export default function StampwerkLogo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer stamp border — rounded square */}
      <rect x="1" y="1" width="30" height="30" rx="4" fill="#3D1810" stroke="#8B3A2A" strokeWidth="2" />

      {/* Inner frame */}
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#5C2419" stroke="#722E21" strokeWidth="1" />

      {/* Pixel grid "SW" letterform */}
      {/* S */}
      <rect x="7" y="9" width="3" height="3" fill="#E5AE9F" />
      <rect x="10" y="9" width="3" height="3" fill="#E5AE9F" />
      <rect x="7" y="12" width="3" height="3" fill="#E5AE9F" />
      <rect x="10" y="14" width="3" height="3" fill="#E5AE9F" />
      <rect x="7" y="17" width="3" height="3" fill="#E5AE9F" />
      <rect x="10" y="17" width="3" height="3" fill="#E5AE9F" />

      {/* W */}
      <rect x="16" y="9" width="3" height="3" fill="#E5AE9F" />
      <rect x="22" y="9" width="3" height="3" fill="#E5AE9F" />
      <rect x="16" y="12" width="3" height="3" fill="#E5AE9F" />
      <rect x="22" y="12" width="3" height="3" fill="#E5AE9F" />
      <rect x="16" y="15" width="3" height="3" fill="#E5AE9F" />
      <rect x="19" y="15" width="3" height="3" fill="#E5AE9F" />
      <rect x="22" y="15" width="3" height="3" fill="#E5AE9F" />
      <rect x="16" y="18" width="3" height="2" fill="#E5AE9F" />
      <rect x="19" y="17" width="3" height="3" fill="#E5AE9F" />
      <rect x="22" y="18" width="3" height="2" fill="#E5AE9F" />

      {/* Bottom accent line */}
      <rect x="7" y="23" width="18" height="2" rx="1" fill="#8B3A2A" />
    </svg>
  );
}
