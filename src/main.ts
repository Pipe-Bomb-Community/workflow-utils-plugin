import type PipeBomb from "@pipe-bomb/plugin-sdk";
import { Step } from "./step/step.js";
import { DurationStep } from "./step/duration.step.js";
import { CooldownStep } from "./step/cooldown.step.js";
import { FailStep } from "./step/fail.step.js";

export default class Plugin implements PipeBomb.Plugin {
	private api!: PipeBomb.PluginApiContext;
	private logger!: PipeBomb.Logger;

	enable(apiContext: PipeBomb.PluginApiContext) {
		this.api = apiContext;
		this.logger = apiContext.getLogger();

		this.api.registerLanguageDirectory("language");

		const workflowClient = this.api.getWorkflowClient();
		const STEPS: Step[] = [
			new DurationStep(),
			new CooldownStep(),
			new FailStep(),
		];

		for (const step of STEPS) {
			workflowClient.registerStep(step.get());
		}
	}

	disable() {}

	public getLogger() {
		return this.logger;
	}
}
