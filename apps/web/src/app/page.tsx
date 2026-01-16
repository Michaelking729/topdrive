// apps/web/src/app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Background visuals */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* soft grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:64px_64px]" />
        {/* gradient wash */}
        <div className="absolute -top-32 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600/20 via-indigo-500/15 to-cyan-400/20 blur-3xl" />
        {/* accent blobs */}
        <div className="absolute -left-52 top-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-blue-600/25 to-indigo-600/10 blur-3xl" />
        <div className="absolute -right-60 top-72 h-[620px] w-[620px] rounded-full bg-gradient-to-br from-cyan-400/25 to-fuchsia-500/10 blur-3xl" />
      </div>

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <span className="font-black tracking-tight">TD</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-black tracking-tight">TOP DRIVE</div>
              <div className="text-xs text-slate-500">
                Ride-hailing • Live in Ijebu-Ode (for now)
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
            <a className="hover:text-slate-900" href="#how">
              How it works
            </a>
            <a className="hover:text-slate-900" href="#bonuses">
              Bonuses
            </a>
            <a className="hover:text-slate-900" href="#safety">
              Safety
            </a>
            <a className="hover:text-slate-900" href="#faq">
              FAQ
            </a>
            <a className="hover:text-slate-900" href="/driver">
              Driver
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/driver"
              className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 md:inline-flex"
            >
              Driver Dashboard
            </a>
            <a
              href="/request"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm shadow-blue-600/20 hover:opacity-95"
            >
              Request a ride
              <span aria-hidden className="text-white/90">
                →
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 md:pt-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Now available: <strong className="font-black">Ijebu-Ode</strong>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              TOP DRIVE is a{" "}
              <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                smarter way
              </span>{" "}
              to get a ride in Ijebu-Ode.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
              Request a ride, get matched fast, and enjoy clear pricing — built for simple
              everyday trips around town. No logistics, no cargo — just rides.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/request"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-slate-800"
              >
                Start a ride request
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>

              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Learn how it works
                <span aria-hidden className="text-slate-500">
                  ↓
                </span>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
              <Stat label="Coverage" value="Ijebu-Ode" />
              <Stat label="Ride type" value="Town rides" />
              <Stat label="Status" value="Live" />
            </div>

            <div className="mt-6 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Note:</span> Location support is
              currently optimized for Ijebu-Ode. More cities will be added soon.
            </div>
          </div>

          {/* Right: “How it works” preview card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/10 to-cyan-400/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-200/70 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                    <SparkIcon />
                  </span>
                  <div className="leading-tight">
                    <div className="text-sm font-extrabold">How it works</div>
                    <div className="text-xs text-slate-500">
                      Request → Match → Ride → Complete
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Ijebu-Ode
                </span>
              </div>

              <div className="p-5">
                <div className="grid gap-4">
                  <StepLine
                    title="1) Request a ride"
                    desc="Enter your pickup and destination inside Ijebu-Ode."
                  />
                  <StepLine
                    title="2) Get matched"
                    desc="A nearby driver accepts. You can see the ride status."
                  />
                  <StepLine
                    title="3) Ride & arrive"
                    desc="Driver picks you up, completes the trip, and you arrive safely."
                  />

                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold text-slate-500">
                      What you see before you request
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <MiniCard title="Estimate" value="Clear & upfront" />
                      <MiniCard title="Status" value="Tracked live" />
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Bonus: Drivers can earn more with daily targets (see Bonuses).
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <a
                      href="/request"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm shadow-blue-600/20 hover:opacity-95"
                    >
                      Request now →
                    </a>
                    <a
                      href="#bonuses"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                      See bonuses
                    </a>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold">Offer Mode</div>
                      <span className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1 text-xs font-black text-slate-900">
                        Neon Accent
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      Optional: set an offer price for your ride. Drivers can accept or propose
                      a better price (coming next).
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-10 bg-gradient-to-r from-transparent via-blue-600/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">
              How TOP DRIVE works
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              TOP DRIVE is built for everyday trips in Ijebu-Ode. You request, you get
              matched, and you ride — simple and reliable.
            </p>
          </div>
          <a
            href="/request"
            className="inline-flex w-fit items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
          >
            Start a request
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <HowCard
            n="01"
            title="Request"
            desc="Choose pickup and destination (currently optimized for Ijebu-Ode)."
          />
          <HowCard
            n="02"
            title="Match"
            desc="A nearby driver accepts your request. You can track the ride status."
            highlight
          />
          <HowCard
            n="03"
            title="Ride"
            desc="Your driver arrives, picks you up, and completes the trip."
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InfoCard
            title="Clear information before you ride"
            desc="You’ll see estimated cost, pickup and destination details, and ride status updates."
          />
          <InfoCard
            title="Built for town rides only"
            desc="TOP DRIVE is strictly ride-hailing — no cargo delivery, no logistics, no shipping."
          />
        </div>
      </section>

      {/* BONUSES */}
      <section id="bonuses" className="mx-auto max-w-6xl px-5 py-14">
        <div className="rounded-[40px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                Bonuses & rewards
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
                Bonuses are designed to improve rider experience and reward great drivers.
                This section explains what’s available and how it works.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Ijebu-Ode launch bonuses
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <BonusCard
              title="New rider bonus"
              desc="First-time riders may receive discounted rides during the Ijebu-Ode launch period."
              tag="Riders"
            />
            <BonusCard
              title="Driver targets"
              desc="Drivers can earn extra rewards for completing daily/weekly trip targets."
              tag="Drivers"
            />
            <BonusCard
              title="Peak support"
              desc="During busy periods, incentives help keep more drivers online for faster matches."
              tag="Both"
              accent
            />
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-extrabold">Important notes</div>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li>• Bonuses can change based on demand, availability, and time of day.</li>
              <li>• Bonuses are shown clearly inside the app when available.</li>
              <li>• We prioritize fairness and transparency for riders and drivers.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section id="safety" className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">
              Safety & reliability
            </h2>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              Safety is part of how TOP DRIVE is designed: clear ride details, status tracking,
              and responsible driver behavior.
            </p>

            <div className="mt-6 grid gap-3">
              <TrustRow
                title="Ride details are visible"
                desc="Pickup, destination, and trip status are shown clearly."
              />
              <TrustRow
                title="Status tracking"
                desc="Track the ride as it moves from accepted → arriving → in progress → completed."
              />
              <TrustRow
                title="Transparent pricing info"
                desc="Estimates and offers are shown clearly before confirming."
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/request"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm shadow-blue-600/20 hover:opacity-95"
              >
                Request a ride
              </a>
              <a
                href="/driver"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Driver dashboard
              </a>
            </div>
          </div>

          <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
            <h3 className="text-2xl font-black tracking-tight">Current coverage</h3>
            <p className="mt-2 text-sm text-slate-600 md:text-base">
              For now, TOP DRIVE is focused on one place to deliver a great experience:
              <span className="font-extrabold text-slate-900"> Ijebu-Ode</span>.
            </p>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-extrabold">Ijebu-Ode focus</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>• Better matching and coverage tuning</li>
                <li>• Local driver onboarding and support</li>
                <li>• Faster iteration based on real user feedback</li>
              </ul>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold">Next cities</div>
                <span className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1 text-xs font-black text-slate-900">
                  Coming soon
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                As soon as stability is strong in Ijebu-Ode, we expand carefully to keep quality high.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-5 py-14">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">FAQ</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Quick answers about how TOP DRIVE works today.
            </p>
          </div>
          <a
            href="/request"
            className="inline-flex w-fit items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
          >
            Request a ride
          </a>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <FaqCard
            q="Where does TOP DRIVE work right now?"
            a="Right now, TOP DRIVE is optimized for Ijebu-Ode. That helps us deliver quality and tune matching."
          />
          <FaqCard
            q="Is TOP DRIVE for delivery or logistics?"
            a="No. TOP DRIVE is strictly for ride-hailing (transporting people), not cargo, not shipping, not logistics."
          />
          <FaqCard
            q="How do I know my ride is confirmed?"
            a="After you request, your ride status updates when a driver accepts and progresses as the trip continues."
          />
          <FaqCard
            q="What are bonuses?"
            a="Bonuses are rewards or discounts shown in the app when available — for riders (discounts) and drivers (targets)."
          />
          <FaqCard
            q="Can I set an offer price?"
            a="Offer Mode is coming next: riders can set an offer price and drivers can accept or counter-offer."
          />
          <FaqCard
            q="What’s next on the roadmap?"
            a="Map routing + autocomplete, live persistence, offers/counter-offers, and mobile app integration."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 md:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/10 blur-3xl" />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight md:text-3xl">
                Ready to request a ride in Ijebu-Ode?
              </h3>
              <p className="mt-2 text-sm text-slate-600 md:text-base">
                Start a request now and see how TOP DRIVE works end-to-end.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="/request"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm shadow-blue-600/20 hover:opacity-95"
              >
                Request a ride →
              </a>
              <a
                href="/driver"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                Driver dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} TOP DRIVE • Ride-hailing prototype • Ijebu-Ode
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
            <a className="hover:text-slate-900" href="/request">
              Request
            </a>
            <a className="hover:text-slate-900" href="/driver">
              Driver
            </a>
            <a className="hover:text-slate-900" href="#how">
              How it works
            </a>
            <a className="hover:text-slate-900" href="#bonuses">
              Bonuses
            </a>
            <a className="hover:text-slate-900" href="#safety">
              Safety
            </a>
            <a className="hover:text-slate-900" href="#faq">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* Components */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-900">{value}</div>
    </div>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-1 text-base font-black text-slate-900">{value}</div>
    </div>
  );
}

function StepLine({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white">
        <CheckIcon />
      </div>
      <div>
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{desc}</div>
      </div>
    </div>
  );
}

function HowCard({
  n,
  title,
  desc,
  highlight,
}: {
  n: string;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {highlight && (
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-400/25 to-fuchsia-500/20 blur-2xl" />
      )}
      <div className="text-xs font-black text-indigo-700">{n}</div>
      <div className="mt-2 text-lg font-black">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-base font-black">{title}</div>
      <div className="mt-2 text-sm text-slate-600">{desc}</div>
    </div>
  );
}

function BonusCard({
  title,
  desc,
  tag,
  accent,
}: {
  title: string;
  desc: string;
  tag: string;
  accent?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      {accent ? (
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-cyan-400/25 to-fuchsia-500/20 blur-2xl" />
      ) : (
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-blue-600/15 to-indigo-600/10 blur-2xl" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="text-base font-black">{title}</div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          {tag}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>

      {accent && (
        <div className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1 text-xs font-black text-slate-900">
          Launch highlight
        </div>
      )}
    </div>
  );
}

function TrustRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4">
      <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-slate-900 text-white">
        <CheckIcon />
      </div>
      <div>
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{desc}</div>
      </div>
    </div>
  );
}

function FaqCard({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-base font-black">{q}</div>
      <div className="mt-2 text-sm text-slate-600">{a}</div>
    </div>
  );
}

/* Icons */
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.2 4.6L18 8l-4.8 1.4L12 14l-1.2-4.6L6 8l4.8-1.4L12 2Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M5 13l.7 2.6L8.5 16l-2.8.8L5 19l-.7-2.2L1.5 16l2.8-.4L5 13Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
