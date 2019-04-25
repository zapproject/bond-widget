import { Injectable } from '@angular/core';
import { ZapLoginModule } from './zap-login.module';
import { SubscriberService } from '../subscriber-service/subscriber.service';
import { filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: ZapLoginModule
})
export class LoginService {

  private login: HTMLElement;

  constructor(private subscriber: SubscriberService) {
    this.hideLogin = this.hideLogin.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  showLogin() {
    this.login = document.body.appendChild(document.createElement('zap-login'));
    this.login.addEventListener('login', this.handleLogin);
    this.login.addEventListener('close', this.hideLogin);
  }

  hideLogin() {
    this.login.removeEventListener('login', this.handleLogin);
    this.login.removeEventListener('close', this.handleLogin);
    this.login.parentElement.removeChild(this.login);
    this.login = null;
  }

  handleLogin(event: CustomEvent) {
    this.subscriber.account$.pipe(
      filter(e => !!e),
      take(1),
    ).subscribe(() => {
      this.hideLogin();
    });
    this.subscriber.setProvider(event.detail);
  }
}
