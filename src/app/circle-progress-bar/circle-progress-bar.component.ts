import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

export const svgStrokeOffset = [
  trigger('circleProgress', [
    transition(':enter', [
      style({strokeDashoffset: '{{ circumference }}'}),
      animate('{{ duration }}')
    ], {params: {circumference: 0, duration: '1000ms'}}),
  ]),
];

@Component({
  selector: 'app-circle-progress-bar',
  templateUrl: './circle-progress-bar.component.html',
  styleUrls: ['./circle-progress-bar.component.scss'],
  animations: svgStrokeOffset,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircleProgressBarComponent implements OnInit, AfterViewInit {
  @Input() value = 0;
  @Input() radius = 90;
  @Input() stroke = 2;
  @Input() circleColor = '#666';
  @Input() progressColor = 'red';
  @Input() duration = 1000;

  @Output() progressValue: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('progressBar', {static: false}) progressBar: ElementRef;

  normalizedRadius: number;
  circumference: number;

  ngOnInit() {
    this.normalizedRadius = this.radius - this.stroke * 2;
    this.circumference = this.normalizedRadius * 2 * Math.PI;
    this.getStrokeOffset();
  }

  ngAfterViewInit(): void {
    if (this.value > 0) {
      this.progressBar.nativeElement.style.strokeDashoffset = this.getStrokeOffset();
    }
    this.setProgressNumber();
  }

  private setProgressNumber() {
    const dueTime = this.duration / this.value;
    const source = timer(0, dueTime);
    source.pipe(
      takeWhile(progress => (this.value > 0 && progress <= this.value)))
      .subscribe(val => this.progressValue.emit(val));
  }

  private getStrokeOffset() {
    if (this.value < 0) {
      this.value = 0;
    }
    if (this.value > 100) {
      this.value = 100;
    }
    return this.circumference - (this.value / 100 * this.circumference);
  }

}
