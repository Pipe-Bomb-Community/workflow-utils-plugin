import { WorkflowStep } from "@sdk";

export abstract class Step {
	abstract get(): WorkflowStep;
}
