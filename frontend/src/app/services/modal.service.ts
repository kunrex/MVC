import { Injectable } from "@angular/core";
import { Subject, Observable } from 'rxjs';

export class ModalOptions {
  constructor(public readonly title: string, public readonly message: string, public readonly loadLogin: boolean) { }
}

@Injectable()
export class ModalService {
  private readonly appEventSubject = new Subject<string>();

  public appEventObservable() : Observable<string> {
    return this.appEventSubject.asObservable()
  }

  public getOptions(data: string) : ModalOptions {
    const jsonOptions = JSON.parse(data);
    return new ModalOptions(jsonOptions.title, jsonOptions.message, jsonOptions.loadLogin);
  }

  public showModal(title: string, message: string) : void {
    this.appEventSubject.next(JSON.stringify(new ModalOptions(title, message, false)));
  }

  public showError(message: string) : void {
    this.appEventSubject.next(JSON.stringify(new ModalOptions('An Error Occurred', message, true)));
  }
}
