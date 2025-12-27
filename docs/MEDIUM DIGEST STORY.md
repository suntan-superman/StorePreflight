I Wasn’t Trying to Publish My App. I Was Just Trying to Test It.

For most of my career, I built engineering software for oil & gas.

Heavy-duty systems.
Strict requirements.
Real-world consequences when things go wrong.

For over 20 years, my tools of choice were C++ and C#, mostly on Windows. The workflows were complex, but they were predictable. If you followed the rules, the system behaved the way you expected.

About five years ago, my work shifted hard toward logistics—and with that came mobile apps.

Cross-platform was non-negotiable, so I landed on React Native. Since then, I’ve built eight commercially viable mobile apps across different business domains. Some internal. Some customer-facing. Some critical to daily operations.

I expected mobile app distribution to be bureaucratic.

What I didn’t expect was how misaligned it would be with developer intent.

The Simple Goal That Wasn’t So Simple

This should have been easy.

I wasn’t launching to the public.
I wasn’t marketing anything.
I wasn’t even asking users to find my app.

I just wanted to install a build on a few devices and test it internally.

That’s it.

But as soon as I crossed the line into App Store Connect and Google Play Console, the platforms treated me as if I were preparing a full public release.

And that’s where things started to break down.

Apple and Google Don’t Ask Why

They ask what.

What permissions do you use?
What data do you collect?
What screenshots represent your app?
What’s your marketing copy?

These are reasonable questions—for production apps.

But for internal testing?

Suddenly I was being asked to justify features no one outside my team would ever see. I was navigating privacy disclosures for flows that hadn’t even stabilized yet. I was blocking on metadata that had nothing to do with testing functionality.

The most frustrating part wasn’t the requirements themselves.

It was that the systems never asked the most important question:

Why are you submitting this build?

Google Play Was the Breaking Point

Apple’s process is rigid, but at least it’s familiar.

Google Play surprised me.

I wasn’t trying to distribute my app publicly—yet I found myself deep in declarations, data safety forms, and compliance flows that felt indistinguishable from a production launch.

Internal testing on Google Play is not a lightweight path. And the platform doesn’t do a great job explaining what’s truly required now versus what can wait.

At some point, I realized something uncomfortable:

I wasn’t failing the process.
The process didn’t understand my intent.

The Real Problem Isn’t Documentation

There is no shortage of checklists.

There are blog posts, videos, guides, Reddit threads, and Stack Overflow answers for every App Store rejection you can imagine.

But they all share the same flaw:

They assume a single goal—publish to production.

Internal testing, external beta, phased rollout, enterprise distribution—these are treated as footnotes, not first-class workflows.

As a result, developers are forced to either:

Over-comply

Guess what can be skipped

Or learn by rejection

That’s not guidance. That’s trial by fire.

A Subtle but Important Insight

What finally clicked for me was this:

The platforms don’t validate intent.
They validate artifacts.

If you don’t tell the system why you’re submitting, it assumes the most expensive path.

And most tools built around app submission follow the same assumption.

They check rules.
They validate fields.
They flag missing items.

But they never ask:

“What are you actually trying to do right now?”

From Friction to a System

I didn’t set out to build another checklist.

I’ve used enough of those.

What I wanted was something closer to how experienced engineers actually work:

Scan what exists

Understand the current state

Apply rules in context

Guide the next action—not all actions

That’s what eventually became StorePreflight.

Not as a product idea at first—but as a way to stop wasting time arguing with platforms that couldn’t tell internal testing from production.

The core principle was simple:

Intent determines requirements.

Once you model that explicitly, everything changes.

What Changed When Intent Came First

Internal testing stopped feeling like a failed production launch.

Suddenly:

Missing screenshots weren’t “errors”—they were “not required yet”

Privacy disclosures became contextual, not punitive

Google Play’s process became understandable instead of overwhelming

The system could finally answer:

What’s required now

What can wait

And why

That clarity matters more than automation.

A Broader Lesson for Developer Tools

This experience reshaped how I think about tooling.

Good developer tools don’t just validate correctness.

They validate purpose.

They respect where you are in the lifecycle.
They explain tradeoffs.
They reduce cognitive load instead of adding to it.

Most importantly, they don’t punish you for not doing something you never intended to do.

Closing Thought

I wasn’t trying to publish my app.

I was just trying to test it.

The moment the tools started acknowledging that difference, everything got easier.

If you’ve ever felt blocked by a platform when you were “just trying to move forward,” you’re not alone—and you’re not wrong.

Sometimes the missing feature isn’t another checkbox.

It’s a better question.