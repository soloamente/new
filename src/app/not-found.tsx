import Link from "next/link";

export default function NotFound() {
  // Number of buttons to render in each section
  const leftButtonsCount = 190;
  const centerTopButtonsCount = 85; // Top row buttons
  const centerBottomButtonsCount = 85; // Bottom row buttons
  const rightButtonsCount = 190;

  // Button component to avoid repetition
  const Button = () => (
    <Link
      href="/"
      className="bg-card flex items-center justify-center gap-2.5 rounded-full py-1.75 pr-2.5 pl-3.75 text-sm hover:opacity-40"
    >
      Go back
    </Link>
  );

  return (
    <div className="grid w-full grid-cols-3 flex-col items-center justify-center">
      {/* Left side */}
      <div className="grid w-full flex-1 grid-cols-5">
        {Array.from({ length: leftButtonsCount }, (_, i) => (
          <Button key={`left-${i}`} />
        ))}
      </div>
      {/* Center side */}
      <div className="flex w-full flex-1 flex-col">
        <div className="grid w-full grid-cols-5">
          {/* Top row buttons */}
          {Array.from({ length: centerTopButtonsCount }, (_, i) => (
            <Button key={`center-top-${i}`} />
          ))}
        </div>
        {/* Center row - 404 */}
        <div className="grid grid-cols-5 items-center justify-center">
          {/* Left side vertical buttons */}
          <div className="grid grid-rows-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Button key={`center-left-${i}`} />
            ))}
          </div>
          <h1 className="col-span-3 text-center text-9xl font-bold tracking-widest">
            404
          </h1>
          {/* Right side vertical buttons */}
          <div className="grid grid-rows-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Button key={`center-right-${i}`} />
            ))}
          </div>
        </div>
        <div className="grid w-full grid-cols-5">
          {/* Bottom row buttons */}
          {Array.from({ length: centerBottomButtonsCount }, (_, i) => (
            <Button key={`center-bottom-${i}`} />
          ))}
        </div>
      </div>
      {/* Right side */}
      <div className="grid w-full flex-1 grid-cols-5">
        {Array.from({ length: rightButtonsCount }, (_, i) => (
          <Button key={`right-${i}`} />
        ))}
      </div>
    </div>
  );
}
