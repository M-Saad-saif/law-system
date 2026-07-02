function BackgroundPattern() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block">
      <svg
        className="absolute right-0 top-0 h-full w-[60%] object-cover"
        viewBox="0 0 800 900"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M180 0C320 180 200 420 480 620C680 760 520 900 800 900V0H180Z"
          fill="#042f2e"
          className="opacity-0 animate-sweep-1"
          style={{ opacity: 0.2 }}
          transform="translate(-40, 20)"
        />
        <path
          d="M180 0C320 180 200 420 480 620C680 760 520 900 800 900V0H180Z"
          fill="#0d9488"
          className="opacity-0 animate-sweep-2"
          style={{ opacity: 0.4 }}
          transform="translate(-20, 10)"
        />
        <path
          d="M180 0C320 180 200 420 480 620C680 760 520 900 800 900V0H180Z"
          fill="url(#tealGradient)"
          className="animate-sweep-3"
        />
        <defs>
          <linearGradient
            id="tealGradient"
            x1="180"
            y1="0"
            x2="800"
            y2="900"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0d9488" />
            <stop offset="0.6" stopColor="#0f766e" />
            <stop offset="1" stopColor="#042f2e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default BackgroundPattern;