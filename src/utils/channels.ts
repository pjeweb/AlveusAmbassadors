import {useSyncExternalStore} from 'react'
import {fetchCurrentChannelInfo} from './twitch-api'

type ChannelsListener = () => void

const testChannelNames = process.env.REACT_APP_TEST_CHANNEL_NAMES?.split(',') ?? []
const defaultChannelNames = process.env.REACT_APP_DEFAULT_CHANNEL_NAMES?.split(',') ?? []

let channelNames = [...defaultChannelNames, ...testChannelNames]
let listeners: ChannelsListener[] = []


function updateChannelNames(newChannelNames: string[]) {
  channelNames = [...newChannelNames, ...testChannelNames]
  for (let listener of listeners) {
    listener()
  }
}

const subscribe = (listener: ChannelsListener) => {
  listeners = [...listeners, listener]

  return () => {
    listeners = listeners.filter(l => l !== listener)
  }
}

const getChannelNames = () => channelNames

// We use a custom hook based on useSyncExternalStore to make the channels available to components
// but also can update them from outside of React (especially from the Twitch auth callback that may be called
// before React is ready)
export const useChannelNames = () => useSyncExternalStore(subscribe, getChannelNames)

export async function handleChannelAuth(auth: Twitch.ext.Authorized) {
  // We get back a channel id from the auth object, but we need to fetch the channel name
  const newChannelInfo = await fetchCurrentChannelInfo(auth.channelId, auth)
  if (newChannelInfo) {
    // NOTE: We could use the channel info here to e.g. parse the title and
    //      highlight the ambassadors for the current scene
    updateChannelNames([newChannelInfo.broadcaster_name])
  }
}

// Register callback immediately on extension load as using an effect hook may be too late
export function registerTwitchAuthCallback() {
  if ('Twitch' in window) {
    window.Twitch.ext.onAuthorized(handleChannelAuth)
  }
}
