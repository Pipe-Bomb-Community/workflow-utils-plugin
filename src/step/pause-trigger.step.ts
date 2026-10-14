import { WorkflowStep, WorkflowTrigger } from "@pipe-bomb/plugin-sdk";
import { PauseIndex } from "../pause-index.js";
import { Step } from "./step.js";

export class PauseTrigger extends Step {
	constructor(private readonly pauseIndex: PauseIndex) {
		super();
	}

	get(): WorkflowStep | WorkflowTrigger {
		return {
			type: "trigger",
			id: "pause-trigger",
			getOptions: () => [
				{
					type: "string",
					id: "id",
				},
				{
					type: "enum",
					id: "event",
					enum: [
						{
							id: "pause",
							languageKey:
								"workflow.plugin.workflow-utils.step.pause-trigger.option.event.enum.pause",
						},
						{
							id: "unpause",
							languageKey:
								"workflow.plugin.workflow-utils.step.pause-trigger.option.event.enum.unpause",
						},
						{
							id: "any",
							languageKey:
								"workflow.plugin.workflow-utils.step.pause-trigger.option.event.enum.any",
						},
					],
				},
			],
			create: (ctx) => {
				return () => {};
			},
		};
	}
}
