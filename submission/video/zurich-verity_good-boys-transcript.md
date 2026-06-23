# Zurich Verity Video Transcript

Video: `zurich-verity_good-boys.mp4`  
Duration: 3:31  
Team: Good Boys

There are currently two problems in cybersecurity reinforcing each other.

First, we have agentic engineering, which accelerates the way we ship code, resulting in more pressure on reviews.

The second problem is that AI models can do pentests and cyber audits on production software, and therefore threat actors can leverage this to find vulnerabilities faster and exploit them faster.

This problem has been the challenge of the cyber track at the Hyper Challenge, and we have solved this with Zurich Verity.

What we've done is we've built a custom harness that can exploit the lab.

What you can see here is that we've found 63 findings, each of which contains a PoC. So it's code you can run to verify that the finding actually works.

It's not just a report that claims to have found something. It's always a script or a PoC that shows the findings step by step.

We have mapped all four services and of course hope to have found all the issues. We cannot prove that, but we can prove the 63 issues we have found.

But we went a step further.

We have not only built this custom cybersecurity harness based on previous research that we've done, it's actually also contained in a Smithers workflow, which acts based on PRs, on GitHub PRs.

So let's take a look at this.

What I can do here is, in the Zurich Verity demo repository, I can create a new pull request of this demo branch, which contains a security issue.

What then happens is our workflow directly pulls this branch and does an investigation on it.

It takes the difference between the last main state and this branch to pentest it more efficiently, so it doesn't have to map the whole codebase over and over again. So it's more efficient.

The first time we run it, it maps the whole codebase.

What you can see here now is the pull request actually running. But because we don't want to wait for the pull request, I've run it already before and we can quickly open that.

Now a note on speed.

Speed was not a core factor we optimized for, because this can run in the background and finish overnight. We didn't optimize on speed, we optimized on accuracy and provability of the issues that we find.

Here you can see the exact same PR run through Verity.

First, it can find the issues, the findings, and actually write about them.

It can let you know about what happened exactly, and then it can even block the pull request.

So you can see here Zurich Verity review has blocked the pull request, so it cannot ship into production because it has found a critical issue.

It can also evaluate between different levels of criticality, so it can sometimes block a pull request or not, even if it has found issues.

Here you can see the integration of Zurich Verity into a continuous pentesting loop, so all the software you ship will continuously be pentested before it reaches production, before threat actors can attack it, based on the custom cyber harness that we have built.

This is Zurich Verity.
