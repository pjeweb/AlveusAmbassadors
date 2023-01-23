/*
 * Are these types defined somewhere?
 * Should we use runtime schema validation (e.g. zod) for the responses?
 */

type ChannelsResponse = {
    data: Array<ChannelInfo>
}

type ChannelInfo = {
    broadcaster_id: string
    broadcaster_login: string
    broadcaster_name: string
    broadcaster_language: string
    game_id: string
    game_name: string
    title: string
    delay: number
    tags: string[]
}

type EventSubNotificationSubscription = {
    id: string
    status: string
    type: string
    version: string
    cost: number
    condition: EventSubNotificationCondition
    transport: EventSubNotificationTransport
    created_at: string
}

type EventSubNotificationCondition = {
    broadcaster_user_id: string
}

type EventSubNotificationTransport = {
    method: string
    session_id: string
}

type EventSubNotificationEvent = {
    user_id: string
    user_login: string
    user_name: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    followed_at: string
}

type EventSubMessage<
    Type extends string,
    Payload = undefined,
    Metadata = {},
> = {
    metadata: {
        message_id: string
        message_type: Type
        message_timestamp: string
    } & Metadata
    payload: Payload
}

type EventSubSessionConnected = {
    id: string
    status: "connected"
    connected_at: string
    keepalive_timeout_seconds: number
    reconnect_url: null
}

type EventSubSessionReconnecting = {
    id: string
    status: "reconnecting"
    connected_at: string
    keepalive_timeout_seconds: null
    reconnect_url: string
}

type AnyEventSubSession =
    | EventSubSessionConnected
    | EventSubSessionReconnecting

type EventSubSessionWelcomeMessage = EventSubMessage<'session_welcome', { session: EventSubSessionConnected }>
type EventSubSessionReconnectMessage = EventSubMessage<'session_reconnect', { session: EventSubSessionReconnecting }>
type EventSubNotificationMessage = EventSubMessage<'notification', {
    subscription: EventSubNotificationSubscription
    event: EventSubNotificationEvent
}, {
    subscription_type: "string" | string
    subscription_version: string
}>

type AnyEventSubMessage =
    | EventSubSessionWelcomeMessage
    | EventSubSessionReconnectMessage
    | EventSubNotificationMessage


class ExpiredAccessTokenError extends Error {}

async function fetchCurrentChannelInfo(channelId: string, auth: Twitch.ext.Authorized) {
    const params = new URLSearchParams();
    params.set('broadcaster_id', channelId);

    const response = await fetch(`https://api.twitch.tv/helix/channels?${params}`, {
        headers: {
            "client-id": auth.clientId,
            "Authorization": `Extension ${auth.helixToken}`,
        }
    })

    const data = await response.json() as ChannelsResponse // TODO: validate schema?
    if (data?.data?.length) {
        return data.data[0];
    }

    return null;
}

export async function createEventSubSubscriptionForChannel(
    type: string,
    channelId: string,
    sessionId: string,
    auth: Twitch.ext.Authorized
) {
    const response = await fetch(
        `https://api.twitch.tv/helix/eventsub/subscriptions`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "client-id": auth.clientId,
                "Authorization": `Bearer ${auth.helixToken}`,
            },
            body: JSON.stringify({
                type: type,
                version: "1",
                condition: {
                    broadcaster_user_id: channelId,
                },
                transport: {
                    method: "websocket",
                    session_id: sessionId,
                },
            }),
        }
    );

    if (response.status === 403) {
        throw new ExpiredAccessTokenError();
    }

    // usually 202 Accepted
    return response.status >= 200 && response.status < 300;
}

function handleChannelUpdate(info: ChannelInfo) {
    // TODO: Parse title, update ambassadors to highlight
}

function handleNotification(message: EventSubNotificationMessage) {
    switch (message.metadata.subscription_type) {

    }
}

function subscribeToEventSub(auth: Twitch.ext.Authorized) {
    console.log('ALVEUS: Event sub event connecting ...')
    const eventSubSocket = new WebSocket("wss://eventsub-beta.wss.twitch.tv/ws")
    eventSubSocket.addEventListener('message', (event) => {
        const message = JSON.parse(event.data) as AnyEventSubMessage // TODO: validate schema?

        switch (message.metadata.message_type) {
            case "session_welcome": {
                console.log('ALVEUS: Event sub connected!', {message})
                const payload = message.payload as EventSubSessionWelcomeMessage['payload'] // TODO: Fix type inference
                createEventSubSubscriptionForChannel('channel.update', auth.channelId, payload.session.id, auth)
            }
                break;
            case "session_reconnect": {
                console.log('ALVEUS: Event sub reconnect websocket ... TODO', {message})
                //const payload = message.payload as EventSubSessionReconnectMessage['payload'] // TODO: Fix type inference
                // TODO: Reconnect
            }
                break;
            case "notification":
                console.log('ALVEUS: Event sub notification', {message})
                handleNotification(message as EventSubNotificationMessage) // TODO: Fix type inference
                break;
            default:
                console.log('ALVEUS: Event sub unhandled event!', {message})
            // unhandled message
        }
    })
}

export function subscribeToChannelUpdate() {
    window.Twitch.ext.onAuthorized(async (auth) => {
        console.log('ALVEUS: Channel ID', auth.channelId);

        fetchCurrentChannelInfo(auth.channelId, auth).then(info => {
            if (info) {
                console.log('ALVEUS: Embedded on ' + info.broadcaster_name)
                console.log('ALVEUS: Current title', info.title)
                console.log('ALVEUS: Current tags', info.tags)
                console.log('ALVEUS: Current category', info.game_name)
                handleChannelUpdate(info)
            }
        })
        subscribeToEventSub(auth)
    })
}