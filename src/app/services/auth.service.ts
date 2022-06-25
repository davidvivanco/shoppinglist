import { Injectable, NgZone } from '@angular/core';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { environment } from 'src/environments/environment';
import * as auth from 'firebase/auth';
import { UserService } from './user.service';
import { NavController } from '@ionic/angular';
import { GoogleResponse, User } from '../interfaces';
import { Storage } from '@ionic/storage';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from './firebase.service';
import { StoreService } from './store.service';
import { UiService } from './ui.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  webClientId = environment.webClientId;
  user: Partial<User>;
  constructor(
    private firebase: FirebaseService,
    private storage: Storage,
    private navController: NavController,
    private googlePlus: GooglePlus,
    private ui: UiService,
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth
  ) {
    this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        const loading = await this.ui.loading();
        this.user = user;
        const uid = user?.uid;
        this.firebase.getUser(uid).subscribe(async (data) => {
          const user = data[0];
          this.storage.set('user', user);
          await loading.dismiss();
          this.navController.navigateForward('tabs');
        });
        return;
      }
      this.storage.remove('user');
    });
  }

  signIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        const uid = result?.user?.uid;
        this.firebase.getUser(uid).subscribe(data => {
          const user = data[0];
          this.storage.set('user', user);
        });
      })
      .catch((error) => {
        console.log(error);
        this.ui.errorToast();
      });
  }

  signUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        // this.SendVerificationMail();
        this.storage.set('user', this.user);
        this.navController.navigateForward(['tabs/']);
        this.setUserData(result.user);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  forgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  sendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification())
      .then(() => {
        this.navController.navigateForward(['verify-email-address']);
      });
  }

  setUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      id: user.uid,
      email: user.email,
      username: user.username,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };

    return userRef.set(userData, {
      merge: true,
    });
  }


  loginWithGoogle(): Promise<GoogleResponse> {
    return new Promise((resolve, reject) => {
      this.googlePlus
        .login({ webClientId: this.webClientId })
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  googleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider()).then((res: any) => {
      if (res) {
        this.navController.navigateForward(['tabs']);
      }
    });
  }

  AuthLogin(provider: any) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.setUserData(result.user);
      })
      .catch((error) => {
        window.alert(error);
      });
  }

  async isLoggedIn(): Promise<boolean> {
    const user = await this.storage.get('user') as User;
    return user !== null && user.emailVerified !== false ? true : false;
  }
}

