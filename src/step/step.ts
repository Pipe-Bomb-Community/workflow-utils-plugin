import { WorkflowStep } from "@pipe-bomb/plugin-sdk";

export abstract class Step {
	abstract get(): WorkflowStep;
}
