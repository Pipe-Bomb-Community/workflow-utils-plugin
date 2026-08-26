import { WorkflowStep } from "@pipe-bomb/plugin-sdk";
import { Step } from "./step.js";

export class CooldownStep extends Step {
	private readonly lastRuns = new Map<string, number>();

	get(): WorkflowStep {
		return {
			type: "step",
			id: "cooldown",
			getOptions: () => [
				{
					type: "integer",
					id: "days",
				},
				{
					type: "integer",
					id: "hours",
				},
				{
					type: "integer",
					id: "minutes",
				},
				{
					type: "integer",
					id: "seconds",
				},
			],
			run: async (ctx) => {
				const days = ctx.getOption("days", "integer") ?? 0;
				const hours = ctx.getOption("hours", "integer") ?? 0;
				const minutes = ctx.getOption("minutes", "integer") ?? 0;
				const seconds = ctx.getOption("seconds", "integer") ?? 0;
				const totalDuration =
					(((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1_000;

				const executionStartTime = Date.now();
				const lastRunTimestamp = this.lastRuns.get(ctx.getStepUuid());

				let actualCooldownStart = executionStartTime;

				if (lastRunTimestamp !== undefined) {
					ctx.updateProgress(0);
					const toWait =
						totalDuration - (executionStartTime - lastRunTimestamp);
					if (toWait > 0) {
						actualCooldownStart = lastRunTimestamp + totalDuration;

						await new Promise<void>((resolve) => {
							const start = Date.now();
							const intervalId = setInterval(() => {
								const elapsed = Date.now() - start;
								ctx.updateProgress(elapsed / toWait);
							}, 1000);

							setTimeout(() => {
								clearInterval(intervalId);
								resolve();
							}, toWait);
						});
					}
				}

				this.lastRuns.set(ctx.getStepUuid(), actualCooldownStart);

				setTimeout(() => {
					const currentTimestamp = this.lastRuns.get(ctx.getStepUuid());
					if (currentTimestamp === actualCooldownStart) {
						this.lastRuns.delete(ctx.getStepUuid());
					}
				}, totalDuration);
			},
		};
	}
}
