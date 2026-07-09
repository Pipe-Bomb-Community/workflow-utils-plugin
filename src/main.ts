import type PipeBomb from "@sdk";

export default class Plugin implements PipeBomb.Plugin {
	private api!: PipeBomb.PluginApiContext;
	private logger!: PipeBomb.Logger;

	enable(apiContext: PipeBomb.PluginApiContext) {
		this.api = apiContext;
		this.logger = apiContext.getLogger();

		this.api.registerLanguageDirectory("language");

		const workflowClient = this.api.getWorkflowClient();

		workflowClient.registerStep({
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
		});
	}

	disable() {}

	public getLogger() {
		return this.logger;
	}
}
