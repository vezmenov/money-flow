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

export type DonutChartSliceClick = {
  index: number;
  label: string;
  value: number;
};

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-donut-chart-host',
  },
  template: `
    <div class="app-chart app-chart--donut" [style.height.px]="height">
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
export class DonutChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private readonly canvas?: ElementRef<HTMLCanvasElement>;

  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() colors: string[] = [];
  @Input() selectedIndex: number | null = null;
  @Input() height = 260;
  @Input() ariaLabel = '';

  @Output() sliceClick = new EventEmitter<DonutChartSliceClick>();

  private chart?: Chart<'doughnut'>;
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
    const colors = this.colors?.length ? this.colors : this.defaultColors(values.length);

    const reduceMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const offsets = values.map((_, idx) => (this.selectedIndex === idx ? 10 : 0));

    const options: ChartOptions<'doughnut'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion ? false : undefined,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          titleColor: 'rgba(11, 16, 32, 0.92)',
          bodyColor: 'rgba(11, 16, 32, 0.82)',
          borderColor: 'rgba(255, 255, 255, 0.65)',
          borderWidth: 1,
          cornerRadius: 14,
          displayColors: true,
          boxPadding: 4,
        },
      },
      onClick: (_event, elements) => {
        const first = elements[0];
        if (!first) {
          return;
        }
        const index = first.index;
        this.sliceClick.emit({
          index,
          label: String(labels[index] ?? ''),
          value: Number(values[index] ?? 0),
        });
      },
    };

    if (!this.chart) {
      this.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderColor: 'rgba(255, 255, 255, 0.55)',
              borderWidth: 1,
              hoverOffset: 10,
              offset: offsets,
            },
          ],
        },
        options,
      });
      return;
    }

    this.chart.data.labels = labels;
    this.chart.data.datasets[0]!.data = values;
    (this.chart.data.datasets[0] as unknown as { backgroundColor: string[] }).backgroundColor = colors;
    (this.chart.data.datasets[0] as unknown as { offset: number[] }).offset = offsets;
    this.chart.options = options;
    this.chart.update();
  }

  private defaultColors(count: number) {
    const base = [
      'rgba(43, 124, 255, 0.82)',
      'rgba(46, 229, 143, 0.78)',
      'rgba(99, 102, 241, 0.72)',
      'rgba(56, 189, 248, 0.72)',
      'rgba(16, 185, 129, 0.72)',
      'rgba(248, 113, 113, 0.72)',
    ];
    return Array.from({ length: count }, (_, i) => base[i % base.length]!);
  }
}
