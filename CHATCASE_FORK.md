# ChatCase fork notes

This repository is the local ChatCase fork of `Tiledesk/chat21-ionic`.

## Base

- Upstream: `https://github.com/Tiledesk/chat21-ionic.git`
- Local branch: `chatcase/main`
- Base tag: `3.4.22`
- Base commit: `af9aca7f`

The base tag matches the Docker image currently used by `chatcase-tiledesk-deploy`:

```yaml
image: "chat21/chat21-ionic:3.4.22"
```

## Why this fork exists

The current deploy applies ChatCase behavior through `ionic-rebrand.sh` at container startup. That script started as branding/cache patching, but now also changes product UI behavior for:

- PDF previews;
- generic file cards;
- quoted messages;
- WhatsApp/CaseZap structured cards;
- contact, poll, event and audio rendering;
- Google Fonts removal and app metadata.

Future changes such as message delivery status, channel error state, typing indicators, and conversation-list previews should live in this app source instead of DOM mutation patches.

## Git remotes

`upstream` points to Tiledesk. Add the ChatCase GitHub repo later as `origin`:

```powershell
git remote add origin https://github.com/ewzxyh/chatcase-chat21-ionic.git
git push -u origin chatcase/main
```

## Next migration target

Port the behavior from `C:\Users\enzo\chatcase-tiledesk-deploy\ionic-rebrand.sh` into Angular/Ionic components and services, then build a ChatCase Docker image and update `chatcase-tiledesk-deploy` to use it.
