import { Component, EventEmitter, HostListener, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-webcam-capture',
  templateUrl: './webcam-capture.component.html',
  styleUrls: ['./webcam-capture.component.scss']
})
export class WebcamCaptureComponent implements OnInit {

  private trigger: Subject<any> = new Subject();
  public webcamImage!: WebcamImage;
  private nextWebcam: Subject<any> = new Subject();
  sysImage = '';
  conFirm = new EventEmitter();
  hasCaptured = false;
  facingMode: string = 'user';  //Set front camera
  ngOnInit() {}
  constructor() {
  }
  public getSnapshot(): void {
    this.trigger.next(void 0);
    this.hasCaptured = true;
  }
  public get videoOptions(): MediaTrackConstraints {
      const result: MediaTrackConstraints = {};
      if (this.facingMode && this.facingMode !== '') {
          result.facingMode = { ideal: this.facingMode };
      }
      return result;
  }
  public captureImg(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.sysImage = webcamImage!.imageAsDataUrl;
  }
  public get invokeObservable(): Observable<any> {
    return this.trigger.asObservable();
  }
  public get nextWebcamObservable(): Observable<any> {
    return this.nextWebcam.asObservable();
  }

  ok() {
    this.conFirm.emit(this.webcamImage);
    this.hasCaptured = false;
  }

  retake() {
    this.hasCaptured = false;
  }

  close() {
    this.conFirm.emit(null);
  }
}
