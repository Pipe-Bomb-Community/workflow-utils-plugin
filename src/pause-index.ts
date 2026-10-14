import { Logger } from "@pipe-bomb/plugin-sdk";
import EventEmitter from "events";

export class PauseIndex {
	private readonly pausedIds = new Set<string>();
	private readonly emitter = new EventEmitter();

	constructor(private readonly logger: Logger) {}

	public setPaused(id: string, paused: boolean) {
		if (paused) {
			if (this.pausedIds.has(id)) {
				this.logger.debug(`ID "${id}" was already paused`);
				return;
			}
			this.pausedIds.add(id);
		} else {
			if (!this.pausedIds.has(id)) {
				this.logger.debug(`ID "${id}" was already unpaused`);
				return;
			}
			this.pausedIds.delete(id);
		}
		this.emitter.emit(id, paused);
	}

	public waitForUnpause(id: string, maxWait: number | null) {
		return new Promise<void>((resolve) => {
			if (!this.pausedIds.has(id) || maxWait === 0) {
				return resolve();
			}

			let timeout: NodeJS.Timeout | null = null;
			const end = (paused?: boolean) => {
				if (paused) {
					return;
				}
				if (timeout) {
					clearTimeout(timeout);
				}
				this.emitter.off(id, end);
				resolve();
			};

			this.emitter.on(id, end);

			if (maxWait !== null) {
				timeout = setTimeout(end, maxWait);
			}
		});
	}

	public destroy() {
		this.emitter.removeAllListeners();
	}
}
