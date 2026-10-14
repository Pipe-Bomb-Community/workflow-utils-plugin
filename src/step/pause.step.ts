import { WorkflowStep, WorkflowTrigger } from "@pipe-bomb/plugin-sdk";
import { Step } from "./step.js";
import { PauseIndex } from "../pause-index.js";

export class PauseStep extends Step {
	constructor(private readonly pauseIndex: PauseIndex) {
		super();
	}

	get(): WorkflowStep | WorkflowTrigger {
		return {
			type: "step",
			id: "pause",
			getOptions: () => [
				{
					type: "string",
					id: "id",
				},
				{
					type: "integer",
					id: "max-hours",
				},
				{
					type: "integer",
					id: "max-minutes",
				},
				{
					type: "integer",
					id: "max-seconds",
				},
			],
			run: async (ctx) => {
				const id = ctx.getOption("id", "string");
				if (!id) {
					return;
				}

				const maxSeconds = ctx.getOption("max-seconds", "integer");
				const maxMinutes = ctx.getOption("max-minutes", "integer");
				const maxHours = ctx.getOption("max-hours", "integer");

				const maxPause =
					(maxSeconds ?? 0) + (maxMinutes ?? 0) * 60 + (maxHours ?? 0) * 3_600;
				const hasMaxWait =
					maxSeconds !== null || maxMinutes !== null || maxHours !== null;

				await this.pauseIndex.waitForUnpause(
					id,
					hasMaxWait ? maxPause * 1_000 : null,
				);
			},
		};
	}
}
