# Project File Structure

│—— bridge
│  │—— bufferUtils.js
│  │—— main.js
│  │—— meshBridge.js
│  │—— mqttBridge.js
│  │—— packetDecoders.js
│  │—— tcpClient.js
│  │—— websocketHandler.js
│  ╵—— wsServer.js
│—— disabled
│  │—— useMeshBridge.js.disabled
│  │—— useMeshMessages.js.disabled
│  │—— useMeshWebSocket.js.disabled
│  │—— useNodesList.js.disabled
│  ╵—— useWebSocket.js.disabled
│—— env
│  │—— .env
│  │—— .env.local
│  ╵—— .env.production
│—— proto
│  │—— protobufs
│  │  │—— .git
│  │  │  │—— branches
│  │  │  │—— hooks
│  │  │  │  │—— applypatch-msg.sample
│  │  │  │  │—— commit-msg.sample
│  │  │  │  │—— fsmonitor-watchman.sample
│  │  │  │  │—— post-update.sample
│  │  │  │  │—— pre-applypatch.sample
│  │  │  │  │—— pre-commit.sample
│  │  │  │  │—— pre-merge-commit.sample
│  │  │  │  │—— pre-push.sample
│  │  │  │  │—— pre-rebase.sample
│  │  │  │  │—— pre-receive.sample
│  │  │  │  │—— prepare-commit-msg.sample
│  │  │  │  │—— push-to-checkout.sample
│  │  │  │  │—— sendemail-validate.sample
│  │  │  │  ╵—— update.sample
│  │  │  │—— info
│  │  │  │  ╵—— exclude
│  │  │  │—— logs
│  │  │  │  │—— refs
│  │  │  │  │  │—— heads
│  │  │  │  │  │  ╵—— master
│  │  │  │  │  ╵—— remotes
│  │  │  │  │  │  ╵—— origin
│  │  │  │  │  │  │  ╵—— HEAD
│  │  │  │  ╵—— HEAD
│  │  │  │—— objects
│  │  │  │  │—— info
│  │  │  │  ╵—— pack
│  │  │  │  │  │—— pack-1f993831d701d3f221d696d32822e02dc6a22508.idx
│  │  │  │  │  │—— pack-1f993831d701d3f221d696d32822e02dc6a22508.pack
│  │  │  │  │  ╵—— pack-1f993831d701d3f221d696d32822e02dc6a22508.rev
│  │  │  │—— refs
│  │  │  │  │—— heads
│  │  │  │  │  ╵—— master
│  │  │  │  │—— remotes
│  │  │  │  │  ╵—— origin
│  │  │  │  │  │  ╵—— HEAD
│  │  │  │  ╵—— tags
│  │  │  │—— config
│  │  │  │—— description
│  │  │  │—— HEAD
│  │  │  │—— index
│  │  │  ╵—— packed-refs
│  │  │—— .github
│  │  │  │—— workflows
│  │  │  │  │—— ci.yml
│  │  │  │  │—— create_tag.yml
│  │  │  │  │—— publish.yml
│  │  │  │  ╵—— pull_request.yml
│  │  │  ╵—— pull_request_template.md
│  │  │—— .vscode
│  │  │  │—— extensions.json
│  │  │  ╵—— settings.json
│  │  │—— meshtastic
│  │  │  │—— admin.options
│  │  │  │—— admin.proto
│  │  │  │—— apponly.options
│  │  │  │—— apponly.proto
│  │  │  │—— atak.options
│  │  │  │—— atak.proto
│  │  │  │—— cannedmessages.options
│  │  │  │—— cannedmessages.proto
│  │  │  │—— channel.options
│  │  │  │—— channel.proto
│  │  │  │—— clientonly.options
│  │  │  │—— clientonly.proto
│  │  │  │—— config.options
│  │  │  │—— config.proto
│  │  │  │—— connection_status.options
│  │  │  │—— connection_status.proto
│  │  │  │—— deviceonly.options
│  │  │  │—— deviceonly.proto
│  │  │  │—— device_ui.options
│  │  │  │—— device_ui.proto
│  │  │  │—— interdevice.options
│  │  │  │—— interdevice.proto
│  │  │  │—— localonly.proto
│  │  │  │—— mesh.options
│  │  │  │—— mesh.proto
│  │  │  │—— module_config.options
│  │  │  │—— module_config.proto
│  │  │  │—— mqtt.options
│  │  │  │—— mqtt.proto
│  │  │  │—— paxcount.proto
│  │  │  │—— portnums.proto
│  │  │  │—— powermon.proto
│  │  │  │—— remote_hardware.proto
│  │  │  │—— rtttl.options
│  │  │  │—— rtttl.proto
│  │  │  │—— storeforward.options
│  │  │  │—— storeforward.proto
│  │  │  │—— telemetry.options
│  │  │  │—— telemetry.proto
│  │  │  │—— xmodem.options
│  │  │  ╵—— xmodem.proto
│  │  │—— .gitattributes
│  │  │—— .gitignore
│  │  │—— buf.yaml
│  │  │—— LICENSE
│  │  │—— nanopb.proto
│  │  │—— package-lock.json
│  │  │—— package.json
│  │  │—— README.md
│  │  ╵—— renovate.json
│  ╵—— make-json.ps1
│—— public
│  ╵—— vite.svg
│—— src
│  │—— assets
│  │  │—— proto.json
│  │  │—— proto.json.old
│  │  │—— proto.json.txt
│  │  ╵—— react.svg
│  │—— components
│  │  │—— Mesh
│  │  │  │—— MeshtasticClient.bkp
│  │  │  │—— MeshtasticClient.jsx
│  │  │  │—— MeshtasticConfig.jsx
│  │  │  │—— NodeIdentity.jsx
│  │  │  │—— NodeSelector.bkp
│  │  │  ╵—— NodeSelector.jsx
│  │  │—— Navigation
│  │  │  │—— Menu.jsx
│  │  │  │—— SideBar.jsx
│  │  │  │—— SidebarTabs.jsx
│  │  │  │—— TabContent.jsx
│  │  │  │—— TopBar.jsx
│  │  │  ╵—— TopToolbar.jsx
│  │  │—— Settings
│  │  │  │—— GPSTelemetry.jsx
│  │  │  │—— IdentityTab.jsx
│  │  │  │—— LogAlerts.jsx
│  │  │  │—— Metrics.jsx
│  │  │  │—— OTAUpdates.jsx
│  │  │  │—— RadioConfig.bkp
│  │  │  │—— RadioConfig.jsx
│  │  │  │—— SettingsDrawer.bkp
│  │  │  │—— SettingsDrawer.jsx
│  │  │  ╵—— TelemetryTab.jsx
│  │  ╵—— Tabs
│  │  │  │—— ChannelCard.jsx
│  │  │  │—— Channels.jsx
│  │  │  │—— ConnectionCard.jsx
│  │  │  │—— ConnectionCreate.jsx
│  │  │  │—— Connections.jsx
│  │  │  │—— Contacts.jsx
│  │  │  │—— ContactsTab.jsx
│  │  │  │—— Map.jsx
│  │  │  │—— MessageCard.jsx
│  │  │  │—— MessageDetails.jsx
│  │  │  │—— MessageList.jsx
│  │  │  │—— NodeCard.jsx
│  │  │  │—— NodeDetails.jsx
│  │  │  │—— Nodes.jsx
│  │  │  ╵—— TestTab.jsx
│  │—— hooks
│  │  │—— diagnostics.js
│  │  │—— useBridgeLifecycle.js
│  │  │—— useFlowControl.js
│  │  │—— useMeshLifeCycle.js
│  │  │—— useMeshSocketBridge.js
│  │  │—— useNodeSubscription.js
│  │  │—— useSocketInterface.js
│  │  ╵—— useTCPNodes.js
│  │—— pages
│  │  │—— ContactsPage.jsx
│  │  │—— Home.jsx
│  │  │—— HomePage.jsx
│  │  │—— MessageListPage.jsx
│  │  │—— NodesPage.jsx
│  │  ╵—— NotFoundPage.jsx
│  │—— utils
│  │  │—— config.js
│  │  │—— decodeFrame.js
│  │  │—— decodeNodesResponse.js
│  │  │—— decodePacket.js
│  │  │—— handlePacket.js
│  │  │—— mockFirmwareData.js
│  │  │—— nodeEvents.js
│  │  │—— protobufsUtils.js
│  │  │—— protoDescriptor.js
│  │  │—— protoHelpers.js
│  │  │—— protoValidate.js
│  │  │—— safeDecodeMeshPacket.js
│  │  │—— TCPMessage.js
│  │  ╵—— waitForSocketReady.js
│  │—— validators
│  │  ╵—— adminMessageLogger.js
│  │—— App.css
│  │—— App.jsx
│  │—— App.test.js
│  │—— counter.js
│  │—— index.css
│  │—— javascript.svg
│  │—— logo.svg
│  │—— main.jsx
│  │—— reportWebVitals.js
│  │—— setupTests.js
│  ╵—— style.css
│—— .env
│—— .env.local
│—— .env.production
│—— .gitattributes
│—— .gitignore
│—— config.yaml
│—— filestructure.md
│—— filestructure.ps1
│—— foo
│—— implmenting-ack.md
│—— index.html
│—— meshmanager.code-workspace
│—— oldtpnodes.js.txt
│—— olduseMeshSocketBridge.js.txt
│—— package-lock.json
│—— package.json
│—— README.md
│—— rewrite-imports.py
│—— tagging.md
│—— vite.config.js
╵—— vite.config.js.new
