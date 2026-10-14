import type PipeBomb from "@pipe-bomb/plugin-sdk";
import { Step } from "./step/step.js";
import { DurationStep } from "./step/duration.step.js";
import { CooldownStep } from "./step/cooldown.step.js";
import { FailStep } from "./step/fail.step.js";
import { EventTrigger } from "./step/event-trigger.step.js";
import { LogStep } from "./step/log.step.js";
import { PauseIndex } from "./pause-index.js";
import { PauseStep } from "./step/pause.step.js";
import { SetPauseStep } from "./step/set-pause.step.js";
import { PauseTrigger } from "./step/pause-trigger.step.js";

export default class Plugin implements PipeBomb.Plugin {
	private api!: PipeBomb.PluginApiContext;
	private logger!: PipeBomb.Logger;
	private pauseIndex: PauseIndex | null = null;

	enable(apiContext: PipeBomb.PluginApiContext) {
		this.api = apiContext;
		this.logger = apiContext.getLogger();

		this.api.registerLanguageDirectory("language");

		this.pauseIndex = new PauseIndex(this.logger);

		const workflowClient = this.api.getWorkflowClient();
		const STEPS: Step[] = [
			new DurationStep(),
			new CooldownStep(),
			new FailStep(),
			new LogStep(),
			new PauseStep(this.pauseIndex),
			new SetPauseStep(this.pauseIndex),

			new PauseTrigger(this.pauseIndex),
			new EventTrigger(this.api.getDataClient()),
		];

		for (const step of STEPS) {
			workflowClient.registerStep(step.get());
		}
	}

	disable() {
		this.pauseIndex?.destroy();
		this.pauseIndex = null;
	}

	public getLogger() {
		return this.logger;
	}
}
