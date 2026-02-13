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

export type BarChartBarClick = {
  index: number;
  label: string;
  value: number;
};

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-bar-chart-host',
  },
  template: `
    <div class="app-chart app-chart--bar" [style.height.px]="height">
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
export class BarChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private readonly canvas?: ElementRef<HTMLCanvasElement>;

  @Input() labels: string[] = [];
  @Input() values: number[] = [];
  @Input() colors: string[] = [];
  @Input() selectedIndex: number | null = null;
  @Input() height = 260;
  @Input() ariaLabel = '';

  @Output() barClick = new EventEmitter<BarChartBarClick>();

  private chart?: Chart<'bar'>;
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
    const baseColors = this.colors?.length
      ? this.colors
      : labels.map(() => 'rgba(43, 124, 255, 0.72)');

    const reduceMotion =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const colors = baseColors.map((c, idx) =>
      this.selectedIndex === null || this.selectedIndex === idx ? this.applyAlpha(c, 0.82) : this.applyAlpha(c, 0.55),
    );

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduceMotion ? false : undefined,
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
          ticks: { color: 'rgba(11, 16, 32, 0.55)' },
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
        this.barClick.emit({
          index,
          label: String(labels[index] ?? ''),
          value: Number(values[index] ?? 0),
        });
      },
    };

    if (!this.chart) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderColor: 'rgba(255, 255, 255, 0.55)',
              borderWidth: 1,
              borderRadius: 10,
              hoverBackgroundColor: baseColors,
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
    this.chart.options = options;
    this.chart.update();
  }

  private applyAlpha(color: string, alpha: number) {
    const trimmed = String(color ?? '').trim();
    if (!trimmed) {
      return `rgba(43, 124, 255, ${alpha})`;
    }

    if (trimmed.startsWith('#')) {
      const hex = trimmed.slice(1);
      const normalized =
        hex.length === 3
          ? hex
              .split('')
              .map((c) => c + c)
              .join('')
          : hex;
      if (normalized.length === 6) {
        const r = Number.parseInt(normalized.slice(0, 2), 16);
        const g = Number.parseInt(normalized.slice(2, 4), 16);
        const b = Number.parseInt(normalized.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }

    const rgbaMatch = trimmed.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([.\d]+)\)$/i);
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const rgbMatch = trimmed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return trimmed;
  }
}
