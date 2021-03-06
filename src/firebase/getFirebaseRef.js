export default function getFirebaseRef(firebase) {
  if (typeof firebase.database === 'function') {
    return firebase.database().ref();
  } else if (firebase.child) {
    return firebase;
  } else {
    throw new Error('getFirebaseSync - must receive a valid firebase instance.');
  }
}
