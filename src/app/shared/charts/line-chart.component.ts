import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Chart, ChartOptions } from 'chart.js';
import { ensureChartJs } from './chartjs.setup';

export type LineChartPointClick = {
  index: number;
  label: string;
  value: number;
};

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-line-chart-host',
  },
  template: `
    <div class="app-chart app-chart--line" [style.height.px]="height">
      <canvas #canvas [attr.aria-label]="ariaLabel || null" role="img"></canvas>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    .app-chart {
      position: relative;
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
      display: block;
    }
  `,
})
export class LineChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private readonly canvas?: ElementRef<HTMLCanvasElement>;

  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() height = 240;
  @Input() ariaLabel = '';

  @Output() pointClick = new EventEmitter<LineChartPointClick>();

  private chart?: Chart<'line'>;
  private ro?: ResizeObserver;

  ngAfterViewInit(): void {
    ensureChartJs();
    this.createOrUpdate();

    const canvas = this.canvas?.nativeElement;
    if (!canvas) {
      return;
    }

    this.ro = new ResizeObserver(() => {
      this.chart?.resize();
    });
    this.ro.observe(canvas.parentElement ?? canvas);
  }

  ngOnChanges(): void {
    this.createOrUpdate();
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
    this.chart?.destroy();
  }

  private createOrUpdate() {
    const canvas = this.canvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const labels = this.labels ?? [];
    const values = this.values ?? [];

    const reduceMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 240);
    gradient.addColorStop(0, 'rgba(43, 124, 255, 0.35)');
    gradient.addColorStop(1, 'rgba(43, 124, 255, 0.02)');

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion ? false : undefined,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          titleColor: 'rgba(11, 16, 32, 0.92)',
          bodyColor: 'rgba(11, 16, 32, 0.82)',
          borderColor: 'rgba(255, 255, 255, 0.65)',
          borderWidth: 1,
          cornerRadius: 14,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(11, 16, 32, 0.55)', maxRotation: 0, autoSkip: true },
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.28)' },
          ticks: { color: 'rgba(11, 16, 32, 0.55)' },
        },
      },
      onClick: (_event, elements) => {
        const first = elements[0];
        if (!first) {
          return;
        }
        const index = first.index;
        this.pointClick.emit({
          index,
          label: String(labels[index] ?? ''),
          value: Number(values[index] ?? 0),
        });
      },
    };

    if (!this.chart) {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              data: values,
              borderColor: 'rgba(43, 124, 255, 0.85)',
              pointBackgroundColor: 'rgba(255, 255, 255, 0.92)',
              pointBorderColor: 'rgba(43, 124, 255, 0.85)',
              pointBorderWidth: 2,
              pointRadius: 3.5,
              pointHoverRadius: 5,
              borderWidth: 2,
              tension: 0.35,
              fill: true,
              backgroundColor: gradient,
            },
          ],
        },
        options,
      });
      return;
    }

    this.chart.data.labels = labels;
    this.chart.data.datasets[0]!.data = values;
    this.chart.options = options;
    this.chart.update();
  }
}
