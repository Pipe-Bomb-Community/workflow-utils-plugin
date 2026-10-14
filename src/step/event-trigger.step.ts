import { DataClient, WorkflowTrigger } from "@pipe-bomb/plugin-sdk";
import { EventMap } from "@pipe-bomb/plugin-sdk/events.js";
import { Step } from "./step.js";

function defineEventKeys<T extends readonly (keyof EventMap)[]>(
	keys: T &
		(Exclude<keyof EventMap, T[number]> extends never
			? unknown
			: {
					error: "Missing EventMap keys";
					missing: Exclude<keyof EventMap, T[number]>;
				}),
): T {
	return keys;
}

const EVENT_IDS = defineEventKeys([
	"track-added",
	"track-removed",
	"track-identities-updated",
	"track-attributes-updated",
	"track-artists-updated",
	"track-albums-updated",
	"album-added",
	"album-removed",
	"album-identities-updated",
	"album-attributes-updated",
	"album-tracklist-updated",
	"album-artists-updated",
	"artist-added",
	"artist-removed",
	"artist-identities-updated",
	"artist-attributes-updated",
	"playlist-added",
	"playlist-removed",
	"playlist-attributes-updated",
	"playlist-tracklist-updated",
	"playlist-visibility-updated",
	"playlist-members-updated",
	"playlist-filters-updated",
	"user-added",
	"user-saved-track",
	"user-unsaved-track",
	"user-saved-album",
	"user-unsaved-album",
	"user-saved-artist",
	"user-unsaved-artist",
] as const);

export class EventTrigger extends Step {
	constructor(private readonly dataClient: DataClient) {
		super();
	}

	get(): WorkflowTrigger {
		return {
			type: "trigger",
			id: "event-trigger",
			getOptions: () => [
				{
					id: "event",
					type: "enum",
					enum: EVENT_IDS.map((id) => ({
						id,
						languageKey: `workflow.plugin.workflow-utils.step.event-trigger.option.event.enum.${id}`,
					})),
				},
				{
					id: "rerun",
					type: "boolean",
				},
			],
			create: (ctx) => {
				const eventId = ctx.getOption("event", "enum", EVENT_IDS);
				if (!eventId) {
					return () => {};
				}
				const allowRerun = !!ctx.getOption("rerun", "boolean");

				const handler = this.dataClient.addListener(eventId, () =>
					ctx.activate(allowRerun),
				);

				return handler.end;
			},
		};
	}
}
