import { Logger, WorkflowStep, WorkflowTrigger } from "@pipe-bomb/plugin-sdk";
import { Step } from "./step.js";

const LOG_LEVELS: (keyof Logger)[] = [
	"debug",
	"error",
	"fatal",
	"log",
	"verbose",
	"warn",
] as const;

export class LogStep extends Step {
	get(): WorkflowStep | WorkflowTrigger {
		return {
			type: "step",
			id: "log",
			getOptions: () => [
				{
					id: "message",
					type: "string",
				},
				{
					id: "level",
					type: "enum",
					enum: LOG_LEVELS.map((id) => ({
						id,
						languageKey: `workflow.plugin.workflow-utils.step.log.option.level.enum.${id}`,
					})),
				},
			],
			run: async (ctx) => {
				const message = ctx.getOption("message", "string");
				if (!message) {
					return;
				}

				const logger = ctx.getLogger();
				const level = ctx.getOption("level", "enum", LOG_LEVELS) || "log";
				logger[level](message);
			},
		};
	}
}
