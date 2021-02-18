import app from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPUor3VUo-by6ki8P852Bax9KD7-d5ON8",
  authDomain: "sistemadriego.firebaseapp.com",
  projectId: "sistemadriego",
  storageBucket: "sistemadriego.appspot.com",
  messagingSenderId: "710058303405",
  appId: "1:710058303405:web:1ef0cb8887bf748e17cb24",
  measurementId: "G-NJYHYJ88TT"
};

class Firebase {
  constructor() {
    app.initializeApp(firebaseConfig);

    // this.serverValue = app.database.ServerValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    /* Firebase APIs */
    this.auth = app.auth();
  }


  // *** Auth API ***
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = (email) => this.auth.sendPasswordResetEmail(email);

  doSendEmailVerification = () =>
    this.auth.currentUser.sendEmailVerification({
      url: "https://sistemadriego.web.app/login",
    });

  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) =>
    this.auth.onAuthStateChanged((authUser) => {
      // console.log("auth user listener", authUser);
      if (authUser) {
        next(authUser);
        /* this.user(authUser.uid)
          .get()
          .then((doc) => {
            var dbUser = {};
            if (doc.exists) {
              dbUser = doc.data();
              if (!dbUser.roles) {
                dbUser.roles = {};
              }
            }

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
          }); */
      } else {
        fallback();
      }
    });

}

export default Firebase;
