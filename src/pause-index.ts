import { Logger } from "@pipe-bomb/plugin-sdk";
import EventEmitter from "events";

export class PauseIndex {
	private readonly pausedIds = new Set<string>();
	private readonly emitter = new EventEmitter();
	private readonly waits = new Set<() => void>();

	constructor(private readonly logger: Logger) {
		this.emitter.setMaxListeners(0); // disable memory leak warning
	}

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
		this.emitter.emit(`pause:${id}`, paused);
	}

	onChange(id: string, callback: (paused: boolean) => void) {
		this.emitter.on(`pause:${id}`, callback);
		return () => this.emitter.off(id, callback);
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
				this.waits.delete(end);
				this.emitter.off(id, end);
				resolve();
			};
			this.waits.add(end);

			this.emitter.on(`pause:${id}`, end);

			if (maxWait !== null) {
				// todo: stop timeout from overflowing at 24.8 days (2,147,483,647ms)
				timeout = setTimeout(end, maxWait);
			}
		});
	}

	public destroy() {
		this.emitter.removeAllListeners();
		for (const resolve of this.waits) {
			resolve();
		}
		this.waits.clear();
	}
}
