// ─── CometChat Integration for Cutters Choice Radio ───────────────────
document.addEventListener('DOMContentLoaded', () => {
  // 1) YOUR CREDENTIALS
  const APP_ID   = '27471907b883a58a';
  const REGION   = 'EU';
  const AUTH_KEY = 'f877c5cae80d3ec238080cad932702b12077c7f';

  // 2) CHAT GROUP CONFIG
  const GUID       = 'cutters_choice_chat';
  const GROUP_TYPE = CometChat.GROUP_TYPE.PUBLIC;
  const GROUP_NAME = 'Cutters Choice Radio Chat';

  // 3) INIT COMETCHAT
  const appSetting = new CometChat.AppSettingsBuilder()
    .subscribePresenceForAllUsers()
    .setRegion(REGION)
    .autoEstablishSocketConnection(true)
    .build();

  CometChat.init(APP_ID, appSetting)
    .then(() => {
      console.log('✅ CometChat initialized');
      // 4) GUEST NICKNAME FLOW
      let uid = localStorage.getItem('ccrChatUid');
      if (!uid) {
        uid = prompt('Choose a chat nickname:');
        localStorage.setItem('ccrChatUid', uid);
      }
      // 5) CREATE OR LOGIN
      return CometChat.createUser(new CometChat.User(uid), AUTH_KEY)
        .then(() => CometChat.login(uid, AUTH_KEY))
        .catch(err => {
          console.warn('User may already exist; logging in anyway', err);
          return CometChat.login(uid, AUTH_KEY);
        });
    })
    .then(user => {
      console.log('👤 Logged in as', user);
      // 6) JOIN OR CREATE GROUP
      return CometChat.joinGroup(GUID, GROUP_TYPE, AUTH_KEY)
        .catch(err => {
          if (err.code === 'ERR_GROUP_NOT_FOUND') {
            console.log('Group not found—creating it now');
            return CometChat.createGroup(
              new CometChat.Group(GUID, GROUP_TYPE, GROUP_NAME),
              AUTH_KEY
            )
            .then(() => CometChat.joinGroup(GUID, GROUP_TYPE, AUTH_KEY));
          }
          return Promise.reject(err);
        });
    })
    .then(response => {
      console.log('🎉 Joined group', response);
      // 7) RENDER THE CHAT UI
      CometChatUI.renderGroup(
        {
          GUID: GUID,
          groupType: GROUP_TYPE,
          name: GROUP_NAME
        },
        document.getElementById('cometchat')
      );
    })
    .catch(err => {
      console.error('❌ CometChat error:', err);
    });
});
