import { WorkflowStep } from "@pipe-bomb/plugin-sdk";
import { Step } from "./step.js";

export class FailStep extends Step {
	get(): WorkflowStep {
		return {
			type: "step",
			id: "fail",
			getOptions: () => [
				{
					id: "message",
					type: "string",
				},
			],
			run: async (ctx) => {
				const message =
					ctx.getOption("message", "string") || "Fail step activated";
				throw new Error(message);
			},
		};
	}
}
