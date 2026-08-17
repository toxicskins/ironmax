export const metadata = { title: "Responsible Gaming — IRONMAX" };

export default function ResponsibleGamingPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Responsible Gaming</h1>
      <p className="text-sm text-zinc-500 mb-8">IRONMAX points have no cash value — but the habits still matter.</p>

      <div className="flex flex-col gap-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <p>
            IRONMAX is entertainment software. You can never win real money, and points can never be
            withdrawn or exchanged for cash. Still, the games are built to feel like a real casino,
            and that experience can be habit-forming for some people even without real-money stakes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Good habits</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Set a points budget before you start a session, and stop when you hit it.</li>
            <li>Treat losses as final — chasing a loss with a bigger bet is how budgets disappear.</li>
            <li>Take breaks. If a session stops feeling fun, that's the signal to stop.</li>
            <li>Never spend money you need for essentials on point top-ups.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">If it stops feeling like fun</h2>
          <p>
            If you notice you're spending more time or money than you intended, or you feel unable
            to stop, that's worth taking seriously even on a no-cash-out platform. Independent
            resources like{" "}
            <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
              BeGambleAware
            </a>{" "}
            offer free, confidential support regardless of what you were playing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Need a break from IRONMAX specifically?</h2>
          <p>
            Contact us and we'll help you pause or close your account —{" "}
            <a href="/contact" className="text-amber-400 hover:underline">Contact page</a>.
          </p>
        </section>

        <section>
          <p className="font-semibold text-zinc-200">18+. This platform is not intended for minors.</p>
        </section>
      </div>
    </div>
  );
}
