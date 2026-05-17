interface WaveDividerProps {
  /** Color of the WAVES themselves */
  fill?: string;
  /** Direction — top means waves sit on top of the next section */
  position?: "top" | "bottom";
  /** Slow it down for a more subtle effect */
  speed?: "normal" | "slow";
  /** Optional className for the wrapper */
  className?: string;
}

const WaveDivider = ({
  fill = "hsl(0 0% 96%)",
  position = "top",
  speed = "normal",
  className = ""
}: WaveDividerProps) => {
  const flip = position === "top" ? "rotate(180deg)" : "rotate(0deg)";
  return (
    <div
      className={`w-full overflow-hidden pointer-events-none leading-none ${className}`}
      style={{ height: "80px", transform: flip }}
      aria-hidden="true"
    >
      {/* Two stacked waves — opposite directions for shimmer */}
      <svg
        className={`absolute inset-0 w-[200%] h-full ${speed === "slow" ? "animate-wave-slow" : "animate-wave"}`}
        viewBox="0 0 2400 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 C1400,80 1600,0 1800,40 C2000,80 2200,0 2400,40 L2400,80 L0,80 Z"
          fill={fill}
          opacity="0.55"
        />
      </svg>
      <svg
        className={`absolute inset-0 w-[200%] h-full ${speed === "slow" ? "animate-wave" : "animate-wave-slow"}`}
        viewBox="0 0 2400 80"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 C300,90 600,10 900,50 C1200,90 1500,10 1800,50 C2100,90 2400,10 2700,50 L2700,80 L0,80 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
};

export default WaveDivider;
