import { WorkflowStep, WorkflowTrigger } from "@pipe-bomb/plugin-sdk";
import { Step } from "./step.js";
import { PauseIndex } from "../pause-index.js";

export class SetPauseStep extends Step {
	constructor(private readonly pauseIndex: PauseIndex) {
		super();
	}

	get(): WorkflowStep | WorkflowTrigger {
		return {
			type: "step",
			id: "set-pause",
			getOptions: () => [
				{
					type: "string",
					id: "id",
				},
				{
					type: "boolean",
					id: "paused",
				},
			],
			run: async (ctx) => {
				const id = ctx.getOption("id", "string");
				const paused = ctx.getOption("paused", "boolean");

				if (id) {
					this.pauseIndex.setPaused(id, !!paused);
				}
			},
		};
	}
}
