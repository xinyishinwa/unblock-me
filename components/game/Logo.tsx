import PotOfGold from "./PotOfGold";

/** Game logo + tagline used on the menu and level screens. */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="text-center">
      {!compact && (
        <div className="mx-auto mb-1 h-24 w-48 animate-floaty sm:h-28 sm:w-56">
          <PotOfGold />
        </div>
      )}
      <p className="font-display text-lg font-extrabold uppercase tracking-[0.25em] text-white title-stroke sm:text-xl">
        Amulung
      </p>
      <h1
        className={`font-display font-extrabold leading-none text-yellow-300 title-stroke ${
          compact ? "text-4xl sm:text-5xl" : "text-5xl sm:text-7xl"
        }`}
      >
        Pot of Gold
      </h1>
      {!compact && (
        <p className="mt-3 inline-block rounded-full bg-[#6b4220]/85 px-4 py-1 font-display text-base font-bold text-amber-50 shadow sm:text-lg">
          Clear the logs. Find your fortune!
        </p>
      )}
    </div>
  );
}
