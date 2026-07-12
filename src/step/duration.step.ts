import { WorkflowStep } from "@sdk";
import { Step } from "./step.js";

export class DurationStep extends Step {
	get(): WorkflowStep {
		return {
			type: "step",
			id: "delay",
			getOptions: () => [
				{
					type: "integer",
					id: "duration",
				},
			],
			run: async (ctx) => {
				const duration = ctx.getOption("duration", "integer");
				if (duration == null) {
					ctx.getLogger().warn("Duration is not set, skipping step");
					return;
				}

				const start = Date.now();
				const durationMs = duration * 1000;

				await new Promise<void>((resolve) => {
					ctx.updateProgress(0);

					const intervalId = setInterval(() => {
						const elapsed = Date.now() - start;
						ctx.updateProgress(elapsed / durationMs);
					}, 1000);

					setTimeout(() => {
						clearInterval(intervalId);
						resolve();
					}, durationMs);
				});
			},
		};
	}
}
